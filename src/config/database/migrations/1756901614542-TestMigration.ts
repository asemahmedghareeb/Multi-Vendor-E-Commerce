import { MigrationInterface, QueryRunner } from "typeorm";

export class TestMigration1756901614542 implements MigrationInterface {
    name = 'TestMigration1756901614542'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_entity" ADD "age" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_entity" DROP COLUMN "age"`);
    }

}
