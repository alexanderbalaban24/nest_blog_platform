import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCascadeDeleteOptions1695070996435 implements MigrationInterface {
    name = 'AddCascadeDeleteOptions1695070996435'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs_ban" DROP CONSTRAINT "FK_ea8588a14c8bbfbbd15b6c85a6c"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_55d9c167993fed3f375391c8e31"`);
        await queryRunner.query(`ALTER TABLE "blogs_ban" ADD CONSTRAINT "FK_ea8588a14c8bbfbbd15b6c85a6c" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_55d9c167993fed3f375391c8e31" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_55d9c167993fed3f375391c8e31"`);
        await queryRunner.query(`ALTER TABLE "blogs_ban" DROP CONSTRAINT "FK_ea8588a14c8bbfbbd15b6c85a6c"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_55d9c167993fed3f375391c8e31" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blogs_ban" ADD CONSTRAINT "FK_ea8588a14c8bbfbbd15b6c85a6c" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
