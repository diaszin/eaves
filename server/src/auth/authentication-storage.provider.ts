import { Injectable } from '@nestjs/common';
import { AuthenticationStorage } from '@nestjs/authentication';
import type {
  EmailTokenPurpose,
  EmailTokenRecord,
  EmailTokenStore,
  MfaState,
  MfaStore,
  RefreshTokenRecord,
  RefreshTokenStore,
  SessionRecord,
  SessionStore,
  TotpRecord,
} from '@nestjs/authentication';
import { DataSource } from 'typeorm';

interface RefreshTokenRow {
  id: string;
  family_id: string;
  user_id: string;
  created_at: Date;
  expires_at: Date;
  family_expires_at: Date;
  used_at: Date | null;
  claims: Record<string, unknown> | null;
}

interface SessionRow {
  id: string;
  user_id: string;
  created_at: Date;
  expires_at: Date;
  last_active_at: Date;
  mfa: MfaState | null;
  metadata: Record<string, unknown> | null;
}

interface EmailTokenRow {
  id: string;
  purpose: EmailTokenPurpose;
  user_id: string;
  email: string;
  fingerprint: string | null;
  created_at: Date;
  expires_at: Date;
}

const EMAIL_TOKEN_CAP = 10_000;

// TypeORM's postgres driver returns `[rows, rowCount]` for UPDATE/DELETE.
function returnedRows<T>(result: unknown): T[] {
  return (result as [T[], number])[0];
}

function toSessionRecord(row: SessionRow): SessionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: new Date(row.created_at),
    expiresAt: new Date(row.expires_at),
    lastActiveAt: new Date(row.last_active_at),
    ...(row.mfa && { mfa: row.mfa }),
    ...(row.metadata && { metadata: row.metadata }),
  };
}

interface TotpRow {
  secret: string;
  confirmed: boolean;
  pending_secret: string | null;
  last_used_step: string | null;
}

@Injectable()
export class AuthenticationStorageProvider implements RefreshTokenStore, MfaStore, SessionStore, EmailTokenStore
{
  constructor(
    private readonly dataSource: DataSource,
    storage: AuthenticationStorage,
  ) {
    storage.registerSource({
      refreshTokens: this,
      mfa: this,
      sessions: this,
      emailTokens: this,
    });
  }

  async getRefreshToken(id: string): Promise<RefreshTokenRecord | undefined> {
    const [row] = (await this.dataSource.query(
      'SELECT * FROM auth_refresh_token WHERE id = $1',
      [id],
    )) as RefreshTokenRow[];
    if (!row) return undefined;

    return {
      id: row.id,
      familyId: row.family_id,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      expiresAt: new Date(row.expires_at),
      familyExpiresAt: new Date(row.family_expires_at),
      ...(row.used_at && { usedAt: new Date(row.used_at) }),
      ...(row.claims && { claims: row.claims }),
    };
  }

  async saveRefreshToken(record: RefreshTokenRecord): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM auth_refresh_token_family
       WHERE expires_at IS NOT NULL AND expires_at <= $1`,
      [record.createdAt],
    );
    await this.dataSource.query(
      `INSERT INTO auth_refresh_token_family (family_id, user_id, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (family_id) DO UPDATE SET
         user_id = COALESCE(auth_refresh_token_family.user_id, EXCLUDED.user_id),
         expires_at = GREATEST(auth_refresh_token_family.expires_at, EXCLUDED.expires_at)`,
      [record.familyId, record.userId, record.familyExpiresAt],
    );
    await this.dataSource.query(
      `INSERT INTO auth_refresh_token
       (id, family_id, user_id, created_at, expires_at, family_expires_at, used_at, claims)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        record.id,
        record.familyId,
        record.userId,
        record.createdAt,
        record.expiresAt,
        record.familyExpiresAt,
        record.usedAt ?? null,
        record.claims ? JSON.stringify(record.claims) : null,
      ],
    );
  }

  async markRefreshTokenUsed(id: string, at: Date): Promise<boolean> {
    const rows = returnedRows<{ id: string }>(
      await this.dataSource.query(
        'UPDATE auth_refresh_token SET used_at = $2 WHERE id = $1 AND used_at IS NULL RETURNING id',
        [id, at],
      ),
    );
    return rows.length > 0;
  }

  async revokeRefreshTokenFamily(familyId: string): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO auth_refresh_token_family (family_id, revoked)
       VALUES ($1, true)
       ON CONFLICT (family_id) DO UPDATE SET revoked = true`,
      [familyId],
    );
  }

  async isRefreshTokenFamilyRevoked(familyId: string): Promise<boolean> {
    const rows = (await this.dataSource.query(
      'SELECT revoked FROM auth_refresh_token_family WHERE family_id = $1',
      [familyId],
    )) as { revoked: boolean }[];
    return rows[0]?.revoked ?? false;
  }

  async revokeUserRefreshTokens(userId: string): Promise<void> {
    await this.dataSource.query(
      'UPDATE auth_refresh_token_family SET revoked = true WHERE user_id = $1',
      [userId],
    );
  }

  async getTotp(userId: string): Promise<TotpRecord | undefined> {
    const [row] = (await this.dataSource.query(
      'SELECT * FROM auth_mfa_totp WHERE user_id = $1',
      [userId],
    )) as TotpRow[];
    if (!row) return undefined;

    return {
      secret: row.secret,
      confirmed: row.confirmed,
      ...(row.pending_secret !== null && { pendingSecret: row.pending_secret }),
      ...(row.last_used_step !== null && {
        lastUsedStep: Number(row.last_used_step),
      }),
    };
  }

  async saveTotp(userId: string, record: TotpRecord | null): Promise<void> {
    if (!record) {
      await this.dataSource.query('DELETE FROM auth_mfa_totp WHERE user_id = $1', [
        userId,
      ]);
      return;
    }

    await this.dataSource.query(
      `INSERT INTO auth_mfa_totp (user_id, secret, confirmed, pending_secret, last_used_step)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         secret = EXCLUDED.secret,
         confirmed = EXCLUDED.confirmed,
         pending_secret = EXCLUDED.pending_secret,
         last_used_step = GREATEST(auth_mfa_totp.last_used_step, EXCLUDED.last_used_step)`,
      [
        userId,
        record.secret,
        record.confirmed,
        record.pendingSecret ?? null,
        record.lastUsedStep ?? null,
      ],
    );
  }

  async claimTotpStep(userId: string, step: number): Promise<boolean> {
    const rows = returnedRows<{ user_id: string }>(
      await this.dataSource.query(
        `UPDATE auth_mfa_totp SET last_used_step = $2
         WHERE user_id = $1 AND (last_used_step IS NULL OR last_used_step < $2)
         RETURNING user_id`,
        [userId, step],
      ),
    );
    return rows.length > 0;
  }

  async saveRecoveryCodes(userId: string, hashes: string[]): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        'DELETE FROM auth_mfa_recovery_code WHERE user_id = $1',
        [userId],
      );
      if (hashes.length > 0) {
        await manager.query(
          `INSERT INTO auth_mfa_recovery_code (user_id, hash)
           SELECT $1, unnest($2::text[]) ON CONFLICT DO NOTHING`,
          [userId, hashes],
        );
      }
    });
  }

  async consumeRecoveryCode(userId: string, hash: string): Promise<boolean> {
    const rows = returnedRows<{ hash: string }>(
      await this.dataSource.query(
        `DELETE FROM auth_mfa_recovery_code
         WHERE user_id = $1 AND hash = $2 RETURNING hash`,
        [userId, hash],
      ),
    );
    return rows.length > 0;
  }

  async countRecoveryCodes(userId: string): Promise<number> {
    const [row] = (await this.dataSource.query(
      'SELECT COUNT(*)::int AS count FROM auth_mfa_recovery_code WHERE user_id = $1',
      [userId],
    )) as { count: number }[];
    return row.count;
  }

  async recordMfaFailure(
    userId: string,
    windowMs: number,
    now: number,
  ): Promise<number> {
    await this.dataSource.query(
      'INSERT INTO auth_mfa_failure (user_id, occurred_at_ms) VALUES ($1, $2)',
      [userId, now],
    );
    return this.countMfaFailures(userId, windowMs, now);
  }

  async countMfaFailures(
    userId: string,
    windowMs: number,
    now: number,
  ): Promise<number> {
    const [row] = (await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM auth_mfa_failure
       WHERE user_id = $1 AND occurred_at_ms > $2`,
      [userId, now - windowMs],
    )) as { count: number }[];
    return row.count;
  }

  async clearMfaFailures(userId: string): Promise<void> {
    await this.dataSource.query('DELETE FROM auth_mfa_failure WHERE user_id = $1', [
      userId,
    ]);
  }

  async getSession(id: string): Promise<SessionRecord | undefined> {
    const [row] = (await this.dataSource.query(
      'SELECT * FROM auth_session WHERE id = $1',
      [id],
    )) as SessionRow[];
    return row ? toSessionRecord(row) : undefined;
  }

  async createSession(record: SessionRecord): Promise<void> {
    await this.dataSource.query(
      'DELETE FROM auth_session WHERE expires_at <= $1',
      [record.createdAt],
    );
    await this.dataSource.query(
      `INSERT INTO auth_session
       (id, user_id, created_at, expires_at, last_active_at, mfa, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        record.id,
        record.userId,
        record.createdAt,
        record.expiresAt,
        record.lastActiveAt,
        record.mfa ?? null,
        record.metadata ? JSON.stringify(record.metadata) : null,
      ],
    );
  }

  async touchSession(id: string, lastActiveAt: Date): Promise<void> {
    await this.dataSource.query(
      'UPDATE auth_session SET last_active_at = $2 WHERE id = $1 AND last_active_at < $2',
      [id, lastActiveAt],
    );
  }

  async deleteSession(id: string): Promise<boolean> {
    const rows = returnedRows<{ id: string }>(
      await this.dataSource.query(
        'DELETE FROM auth_session WHERE id = $1 RETURNING id',
        [id],
      ),
    );
    return rows.length > 0;
  }

  async listUserSessions(userId: string): Promise<SessionRecord[]> {
    const rows = (await this.dataSource.query(
      'SELECT * FROM auth_session WHERE user_id = $1',
      [userId],
    )) as SessionRow[];
    return rows.map(toSessionRecord);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.dataSource.query('DELETE FROM auth_session WHERE user_id = $1', [
      userId,
    ]);
  }

  async saveEmailToken(record: EmailTokenRecord): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO auth_email_token
       (id, purpose, user_id, email, fingerprint, created_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        record.id,
        record.purpose,
        record.userId,
        record.email,
        record.fingerprint ?? null,
        record.createdAt,
        record.expiresAt,
      ],
    );
    await this.dataSource.query(
      'DELETE FROM auth_email_token WHERE expires_at <= $1',
      [record.createdAt],
    );
    await this.dataSource.query(
      `DELETE FROM auth_email_token WHERE id IN (
         SELECT id FROM auth_email_token
         ORDER BY expires_at DESC
         OFFSET $1
       )`,
      [EMAIL_TOKEN_CAP],
    );
  }

  async consumeEmailToken(
    id: string,
    purpose: EmailTokenPurpose,
  ): Promise<EmailTokenRecord | undefined> {
    const [row] = returnedRows<EmailTokenRow>(
      await this.dataSource.query(
        'DELETE FROM auth_email_token WHERE id = $1 AND purpose = $2 RETURNING *',
        [id, purpose],
      ),
    );
    if (!row) return undefined;

    return {
      id: row.id,
      purpose: row.purpose,
      userId: row.user_id,
      email: row.email,
      ...(row.fingerprint !== null && { fingerprint: row.fingerprint }),
      createdAt: new Date(row.created_at),
      expiresAt: new Date(row.expires_at),
    };
  }

  async deleteUserEmailTokens(
    userId: string,
    purpose: EmailTokenPurpose,
  ): Promise<void> {
    await this.dataSource.query(
      'DELETE FROM auth_email_token WHERE user_id = $1 AND purpose = $2',
      [userId, purpose],
    );
  }
}
