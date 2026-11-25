import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthenticationSessionsEmailTokensMigration implements MigrationInterface {
  name = 'AuthenticationSessionsEmailTokensMigration1793300000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE auth_session (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        created_at timestamptz NOT NULL,
        expires_at timestamptz NOT NULL,
        last_active_at timestamptz NOT NULL,
        mfa text,
        metadata jsonb
      )
    `);
    await queryRunner.query(
      'CREATE INDEX auth_session_user_id_idx ON auth_session(user_id)',
    );
    await queryRunner.query(`
      CREATE TABLE auth_email_token (
        id text PRIMARY KEY,
        purpose text NOT NULL,
        user_id text NOT NULL,
        email text NOT NULL,
        fingerprint text,
        created_at timestamptz NOT NULL,
        expires_at timestamptz NOT NULL
      )
    `);
    await queryRunner.query(
      'CREATE INDEX auth_email_token_user_purpose_idx ON auth_email_token(user_id, purpose)',
    );
    await queryRunner.query(
      'CREATE INDEX auth_email_token_expires_at_idx ON auth_email_token(expires_at)',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE auth_email_token');
    await queryRunner.query('DROP TABLE auth_session');
  }
}
