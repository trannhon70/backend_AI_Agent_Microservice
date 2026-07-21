import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLabelSearchVector1784261627928 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Extension
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS unaccent;
        `);

        // Add search_vector column
        await queryRunner.query(`ALTER TABLE labels ADD COLUMN IF NOT EXISTS search_vector tsvector;`);

        // Backfill existing data
        await queryRunner.query(`
            UPDATE labels
            SET search_vector = to_tsvector(
                'simple',
                unaccent(coalesce(name, ''))
            );
        `);

        // GIN index
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS labels_search_idx
            ON labels
            USING GIN(search_vector);
        `);

        // Trigger function
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION labels_search_vector_update()
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
            DROP TRIGGER IF EXISTS labels_search_trigger
            ON labels;
        `);

        await queryRunner.query(`
            CREATE TRIGGER labels_search_trigger
            BEFORE INSERT OR UPDATE OF name
            ON labels
            FOR EACH ROW
            EXECUTE FUNCTION labels_search_vector_update();
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS labels_search_idx;`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS labels_search_trigger ON labels;`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS labels_search_vector_update();`);
        await queryRunner.query(` ALTER TABLE labels DROP COLUMN IF EXISTS search_vector;`);
    }

}
