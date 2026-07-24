import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFanPageSearchVector1784882841905 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Extension
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS unaccent;
        `);

        // Add search_vector column
        await queryRunner.query(`ALTER TABLE fanpages ADD COLUMN IF NOT EXISTS search_vector tsvector;`);

        // Backfill existing data
        await queryRunner.query(`
            UPDATE fanpages
            SET search_vector = to_tsvector(
                'simple',
                unaccent(coalesce(page_name, ''))
            );
        `);

        // GIN index
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS fanpages_search_idx
            ON fanpages
            USING GIN(search_vector);
        `);

        // Trigger function
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION fanpages_search_vector_update()
            RETURNS trigger AS $$
            BEGIN
                NEW.search_vector :=
                    to_tsvector(
                        'simple',
                        unaccent(coalesce(NEW.page_name, ''))
                    );

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Trigger
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS fanpages_search_trigger
            ON fanpages;
        `);

        await queryRunner.query(`
            CREATE TRIGGER fanpages_search_trigger
            BEFORE INSERT OR UPDATE OF page_name
            ON fanpages
            FOR EACH ROW
            EXECUTE FUNCTION fanpages_search_vector_update();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS fanpages_search_idx;`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS fanpages_search_trigger ON fanpages;`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS fanpages_search_vector_update();`);
        await queryRunner.query(` ALTER TABLE fanpages DROP COLUMN IF EXISTS search_vector;`);
    }

}
