import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1775220465706 implements MigrationInterface {
  name = 'InitialSchema1775220465706';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "users"`);

    await queryRunner.query(
      `CREATE TABLE "users"."user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"."user"`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS "users"`);
  }
}
