import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthenticationStorageMigration implements MigrationInterface {
  name = 'AuthenticationStorageMigration1770000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE auth_refresh_token_family (
        family_id text PRIMARY KEY,
        user_id text,
        expires_at timestamptz,
        revoked boolean NOT NULL DEFAULT false
      )
    `);
    await queryRunner.query(`
      CREATE TABLE auth_refresh_token (
        id text PRIMARY KEY,
        family_id text NOT NULL REFERENCES auth_refresh_token_family(family_id) ON DELETE CASCADE,
        user_id text NOT NULL,
        created_at timestamptz NOT NULL,
        expires_at timestamptz NOT NULL,
        family_expires_at timestamptz NOT NULL,
        used_at timestamptz,
        claims jsonb
      )
    `);
    await queryRunner.query(
      'CREATE INDEX auth_refresh_token_user_id_idx ON auth_refresh_token(user_id)',
    );
    await queryRunner.query(`
      CREATE TABLE auth_mfa_totp (
        user_id text PRIMARY KEY,
        secret text NOT NULL,
        confirmed boolean NOT NULL,
        pending_secret text,
        last_used_step bigint
      )
    `);
    await queryRunner.query(`
      CREATE TABLE auth_mfa_recovery_code (
        user_id text NOT NULL,
        hash text NOT NULL,
        PRIMARY KEY (user_id, hash)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE auth_mfa_failure (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id text NOT NULL,
        occurred_at_ms bigint NOT NULL
      )
    `);
    await queryRunner.query(
      'CREATE INDEX auth_mfa_failure_user_time_idx ON auth_mfa_failure(user_id, occurred_at_ms)',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE auth_mfa_failure');
    await queryRunner.query('DROP TABLE auth_mfa_recovery_code');
    await queryRunner.query('DROP TABLE auth_mfa_totp');
    await queryRunner.query('DROP TABLE auth_refresh_token');
    await queryRunner.query('DROP TABLE auth_refresh_token_family');
  }
}