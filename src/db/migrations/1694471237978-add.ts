import { MigrationInterface, QueryRunner } from 'typeorm';

export class Add1694471237978 implements MigrationInterface {
  name = 'Add1694471237978';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users_devices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ip" character varying NOT NULL, "deviceName" character varying NOT NULL, "issuedAt" TIMESTAMP NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_984434640f7ccaa3c1419312ff1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users_email_confirmation" ("confirmationCode" character varying NOT NULL DEFAULT uuid_generate_v4(), "expirationDate" TIMESTAMP NOT NULL, "isConfirmed" boolean NOT NULL DEFAULT false, "userId" integer NOT NULL, CONSTRAINT "PK_c71869984394d889dfec9602354" PRIMARY KEY ("userId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "login" character varying COLLATE "C" NOT NULL, "email" character varying COLLATE "C" NOT NULL, "passwordHash" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2d443082eccd5198f95f2a36e2" ON "users" ("login") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users_ban" ("isBanned" boolean NOT NULL DEFAULT false, "banReason" character varying, "banDate" TIMESTAMP DEFAULT now(), "userId" integer NOT NULL, CONSTRAINT "PK_58080afe4aea10f647a9eaea5d9" PRIMARY KEY ("userId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users_password_recovery" ("confirmationCode" character varying NOT NULL DEFAULT uuid_generate_v4(), "expirationDate" TIMESTAMP NOT NULL, "isConfirmed" boolean NOT NULL DEFAULT false, "userId" integer NOT NULL, CONSTRAINT "PK_677fc33c1820a2cddced71eff32" PRIMARY KEY ("userId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_devices" ADD CONSTRAINT "FK_06e84444eb36666381bf370b629" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_email_confirmation" ADD CONSTRAINT "FK_c71869984394d889dfec9602354" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_ban" ADD CONSTRAINT "FK_58080afe4aea10f647a9eaea5d9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_password_recovery" ADD CONSTRAINT "FK_677fc33c1820a2cddced71eff32" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_password_recovery" DROP CONSTRAINT "FK_677fc33c1820a2cddced71eff32"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_ban" DROP CONSTRAINT "FK_58080afe4aea10f647a9eaea5d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_email_confirmation" DROP CONSTRAINT "FK_c71869984394d889dfec9602354"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_devices" DROP CONSTRAINT "FK_06e84444eb36666381bf370b629"`,
    );
    await queryRunner.query(`DROP TABLE "users_password_recovery"`);
    await queryRunner.query(`DROP TABLE "users_ban"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2d443082eccd5198f95f2a36e2"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "users_email_confirmation"`);
    await queryRunner.query(`DROP TABLE "users_devices"`);
  }
}
