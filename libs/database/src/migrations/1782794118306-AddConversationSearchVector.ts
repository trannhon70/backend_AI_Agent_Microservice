import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversationSearchVector1782794118306 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {

        // Enable extension
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS unaccent;
        `);

        // Add search_vector column
        await queryRunner.query(`
            ALTER TABLE conversations
            ADD COLUMN IF NOT EXISTS search_vector tsvector;
        `);

        // Backfill existing data
        await queryRunner.query(`
            UPDATE conversations
            SET search_vector = to_tsvector(
                'simple',
                unaccent(coalesce(full_name, ''))
            );
        `);

        // GIN index
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS conversation_search_idx
            ON conversations
            USING GIN(search_vector);
        `);

        // Composite index
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_conversation_page_updated_id
            ON conversations(page_id, updated_at DESC, id DESC);
        `);

        // Trigger function
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION conversation_search_vector_update()
            RETURNS trigger AS $$
            BEGIN
                NEW.search_vector :=
                    to_tsvector(
                        'simple',
                        unaccent(coalesce(NEW.full_name, ''))
                    );

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Trigger
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS conversation_search_trigger
            ON conversations;
        `);

        await queryRunner.query(`
            CREATE TRIGGER conversation_search_trigger
            BEFORE INSERT OR UPDATE OF full_name
            ON conversations
            FOR EACH ROW
            EXECUTE FUNCTION conversation_search_vector_update();
        `);

        // Foreign Key indexes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_conversation_assigned_user_id
            ON conversations(assigned_user_id);
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_conversation_last_message_id
            ON conversations(last_message_id);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`DROP TRIGGER IF EXISTS conversation_search_trigger ON conversations;`);

        await queryRunner.query(`DROP FUNCTION IF EXISTS conversation_search_vector_update();`);

        await queryRunner.query(`DROP INDEX IF EXISTS idx_conversation_page_updated_id;`);

        await queryRunner.query(`DROP INDEX IF EXISTS conversation_search_idx;`);

        await queryRunner.query(`ALTER TABLE conversations DROP COLUMN IF EXISTS search_vector;`);

        await queryRunner.query(`DROP INDEX IF EXISTS idx_conversation_assigned_user_id;`);

        await queryRunner.query(`DROP INDEX IF EXISTS idx_conversation_last_message_id;`);
        // Không nên DROP EXTENSION vì có thể migration khác cũng dùng
    }
}