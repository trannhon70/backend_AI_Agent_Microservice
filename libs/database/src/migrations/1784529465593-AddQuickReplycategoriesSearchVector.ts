import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuickReplycategoriesSearchVector1784529465593 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Extension
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS unaccent;
        `);

        // Add search_vector column
        await queryRunner.query(`ALTER TABLE quick_reply_category ADD COLUMN IF NOT EXISTS search_vector tsvector;`);

        // Backfill existing data
        await queryRunner.query(`
            UPDATE quick_reply_category
            SET search_vector = to_tsvector(
                'simple',
                unaccent(coalesce(name, ''))
            );
        `);

        // GIN index
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS quick_reply_category_search_idx
            ON quick_reply_category
            USING GIN(search_vector);
        `);

        // Trigger function
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION quick_reply_category_search_vector_update()
            RETURNS trigger AS $$
            BEGIN
                NEW.search_vector :=
                    to_tsvector(
                        'simple',
                        unaccent(coalesce(NEW.name, ''))
                    );

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Trigger
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS quick_reply_category_search_trigger
            ON quick_reply_category;
        `);

        await queryRunner.query(`
            CREATE TRIGGER quick_reply_category_search_trigger
            BEFORE INSERT OR UPDATE OF name
            ON quick_reply_category
            FOR EACH ROW
            EXECUTE FUNCTION quick_reply_category_search_vector_update();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS quick_reply_category_search_idx;`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS quick_reply_category_search_trigger ON quick_reply_category;`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS quick_reply_category_search_vector_update();`);
        await queryRunner.query(` ALTER TABLE quick_reply_category DROP COLUMN IF EXISTS search_vector;`);
    }

}
