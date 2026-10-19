import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RepairAuthenticationMfaStorage1792276897997
  implements MigrationInterface
{
  name = 'RepairAuthenticationMfaStorage1792276897997';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS auth_mfa_totp (
        user_id text PRIMARY KEY,
        secret text NOT NULL,
        confirmed boolean NOT NULL,
        pending_secret text,
        last_used_step bigint
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS auth_mfa_recovery_code (
        user_id text NOT NULL,
        hash text NOT NULL,
        PRIMARY KEY (user_id, hash)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS auth_mfa_failure (
        id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id text NOT NULL,
        occurred_at_ms bigint NOT NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS auth_mfa_failure_user_time_idx
      ON auth_mfa_failure(user_id, occurred_at_ms)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE auth_mfa_failure');
    await queryRunner.query('DROP TABLE auth_mfa_recovery_code');
    await queryRunner.query('DROP TABLE auth_mfa_totp');
  }
}