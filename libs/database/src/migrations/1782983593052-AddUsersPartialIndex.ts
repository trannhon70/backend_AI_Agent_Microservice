import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsersPartialIndex1782983593052 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        // ==========================
        // Add search_vector column
        // ==========================
        await queryRunner.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS search_vector tsvector;
        `);

        // ==========================
        // Fill existing data
        // ==========================
        await queryRunner.query(`
            UPDATE users
            SET search_vector =
                setweight(to_tsvector('simple', coalesce(full_name, '')), 'A') ||
                setweight(to_tsvector('simple', coalesce(email, '')), 'B');
        `);

        // ==========================
        // Trigger
        // ==========================
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION users_search_vector_trigger()
            RETURNS trigger AS $$
            BEGIN
                NEW.search_vector :=
                    setweight(to_tsvector('simple', coalesce(NEW.full_name, '')), 'A') ||
                    setweight(to_tsvector('simple', coalesce(NEW.email, '')), 'B');
                RETURN NEW;
            END
            $$ LANGUAGE plpgsql;
        `);

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS trg_users_search_vector ON users;
        `);

        await queryRunner.query(`
            CREATE TRIGGER trg_users_search_vector
            BEFORE INSERT OR UPDATE OF full_name, email
            ON users
            FOR EACH ROW
            EXECUTE FUNCTION users_search_vector_trigger();
        `);

        // ==========================
        // GIN index
        // ==========================
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_users_search_vector
            ON users
            USING GIN(search_vector);
        `);

        // ==========================
        // Login
        // ==========================
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_users_provider_email_active
            ON users(provider, email)
            WHERE is_deleted = false;
        `);

        // User list
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_users_created_active
            ON users(created_at DESC)
            WHERE is_deleted = false;
        `);

        // Filter by role + pagination
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_users_role_created_active
            ON users(role_id, created_at DESC)
            WHERE is_deleted = false;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_users_search_vector;
        `);

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS trg_users_search_vector ON users;
        `);

        await queryRunner.query(`
            DROP FUNCTION IF EXISTS users_search_vector_trigger();
        `);

        await queryRunner.query(`
            ALTER TABLE users
            DROP COLUMN IF EXISTS search_vector;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_users_role_created_active;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_users_created_active;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_users_provider_email_active;
        `);
    }
}