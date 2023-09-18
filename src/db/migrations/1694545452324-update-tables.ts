import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTables1694545452324 implements MigrationInterface {
    name = 'UpdateTables1694545452324'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs" DROP CONSTRAINT "FK_998d6c1e3c685955774e5195f49"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "ownerId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs" ADD "ownerId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD CONSTRAINT "FK_998d6c1e3c685955774e5195f49" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
