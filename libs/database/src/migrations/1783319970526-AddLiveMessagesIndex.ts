import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLiveMessagesIndex1783319970526 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        // Extension
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS unaccent;
        `);

        // Add search_vector column
        await queryRunner.query(`ALTER TABLE live_messages ADD COLUMN IF NOT EXISTS search_vector tsvector;`);

        // Backfill existing data
        await queryRunner.query(`
            UPDATE live_messages
            SET search_vector = to_tsvector(
                'simple',
                unaccent(coalesce(text, ''))
            );
        `);

        // GIN index
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS live_messages_search_idx
            ON live_messages
            USING GIN(search_vector);
        `);

        // Trigger function
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION live_messages_search_vector_update()
            RETURNS trigger AS $$
            BEGIN
                NEW.search_vector :=
                    to_tsvector(
                        'simple',
                        unaccent(coalesce(NEW.text, ''))
                    );

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Trigger
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS live_messages_search_trigger
            ON live_messages;
        `);

        await queryRunner.query(`
            CREATE TRIGGER live_messages_search_trigger
            BEFORE INSERT OR UPDATE OF text
            ON live_messages
            FOR EACH ROW
            EXECUTE FUNCTION live_messages_search_vector_update();
        `);

        // Composite index get paging
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_live_messages_conversation_sent_at_id
            ON live_messages(conversation_id, sent_at DESC, id DESC);
        `);

        // Foreign Key indexes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_live_messages_user_id
            ON live_messages(user_id);
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_live_messages_conversation_id
            ON live_messages(conversation_id);
        `);


    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS live_messages_search_idx;`);
        await queryRunner.query(`DROP TRIGGER IF EXISTS live_messages_search_trigger ON live_messages;`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS live_messages_search_vector_update();`);
        await queryRunner.query(` ALTER TABLE live_messages DROP COLUMN IF EXISTS search_vector;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_live_messages_conversation_sent_at_id;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_live_messages_user_id;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_live_messages_conversation_id;`);

    }

}