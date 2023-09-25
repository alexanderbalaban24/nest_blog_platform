import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactoringCommentLikesRelation1695660522267 implements MigrationInterface {
    name = 'RefactoringCommentLikesRelation1695660522267'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment_likes" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "comment_likes" DROP CONSTRAINT "PK_34d1f902a8a527dbc2502f87c88"`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ADD CONSTRAINT "PK_31070402cf722d3d9652681d00b" PRIMARY KEY ("userId", "id")`);
        await queryRunner.query(`ALTER TABLE "comment_likes" DROP CONSTRAINT "FK_34d1f902a8a527dbc2502f87c88"`);
        await queryRunner.query(`ALTER TABLE "comment_likes" DROP CONSTRAINT "PK_31070402cf722d3d9652681d00b"`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ADD CONSTRAINT "PK_2c299aaf1f903c45ee7e6c7b419" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ADD CONSTRAINT "FK_34d1f902a8a527dbc2502f87c88" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment_likes" DROP CONSTRAINT "FK_34d1f902a8a527dbc2502f87c88"`);
        await queryRunner.query(`ALTER TABLE "comment_likes" DROP CONSTRAINT "PK_2c299aaf1f903c45ee7e6c7b419"`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ADD CONSTRAINT "PK_31070402cf722d3d9652681d00b" PRIMARY KEY ("userId", "id")`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ADD CONSTRAINT "FK_34d1f902a8a527dbc2502f87c88" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_likes" DROP CONSTRAINT "PK_31070402cf722d3d9652681d00b"`);
        await queryRunner.query(`ALTER TABLE "comment_likes" ADD CONSTRAINT "PK_34d1f902a8a527dbc2502f87c88" PRIMARY KEY ("userId")`);
        await queryRunner.query(`ALTER TABLE "comment_likes" DROP COLUMN "id"`);
    }

}
