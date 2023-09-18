import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlogsTables1694475719973 implements MigrationInterface {
    name = 'AddBlogsTables1694475719973'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "blogs_ban" ("isBanned" boolean NOT NULL DEFAULT false, "bandDate" TIMESTAMP NOT NULL DEFAULT now(), "blogId" integer NOT NULL, CONSTRAINT "PK_ea8588a14c8bbfbbd15b6c85a6c" PRIMARY KEY ("blogId"))`);
        await queryRunner.query(`CREATE TABLE "blogs" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "websiteUrl" character varying NOT NULL, "isMembership" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "ownerId" integer NOT NULL, CONSTRAINT "PK_e113335f11c926da929a625f118" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "blogs_ban" ADD CONSTRAINT "FK_ea8588a14c8bbfbbd15b6c85a6c" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD CONSTRAINT "FK_998d6c1e3c685955774e5195f49" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs" DROP CONSTRAINT "FK_998d6c1e3c685955774e5195f49"`);
        await queryRunner.query(`ALTER TABLE "blogs_ban" DROP CONSTRAINT "FK_ea8588a14c8bbfbbd15b6c85a6c"`);
        await queryRunner.query(`DROP TABLE "blogs"`);
        await queryRunner.query(`DROP TABLE "blogs_ban"`);
    }

}
