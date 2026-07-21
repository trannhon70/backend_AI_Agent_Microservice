import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFanpageUniquePageId1782894248728
    implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE fanpages
      ADD CONSTRAINT uq_fanpages_page_id
      UNIQUE(page_id);
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE fanpages
      DROP CONSTRAINT uq_fanpages_page_id;
    `);
    }
}