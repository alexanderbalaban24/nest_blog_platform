import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactoringPostLikesTable1695501070102 implements MigrationInterface {
    name = 'RefactoringPostLikesTable1695501070102'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_likes" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "PK_37d337ad54b1aa6b9a44415a498"`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "PK_b0f234c28d70b737dabdfb3d7a6" PRIMARY KEY ("userId", "id")`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "FK_37d337ad54b1aa6b9a44415a498"`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "PK_b0f234c28d70b737dabdfb3d7a6"`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "PK_e4ac7cb9daf243939c6eabb2e0d" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "FK_37d337ad54b1aa6b9a44415a498" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "FK_37d337ad54b1aa6b9a44415a498"`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "PK_e4ac7cb9daf243939c6eabb2e0d"`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "PK_b0f234c28d70b737dabdfb3d7a6" PRIMARY KEY ("userId", "id")`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "FK_37d337ad54b1aa6b9a44415a498" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "PK_b0f234c28d70b737dabdfb3d7a6"`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "PK_37d337ad54b1aa6b9a44415a498" PRIMARY KEY ("userId")`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP COLUMN "id"`);
    }

}
