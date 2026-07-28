import { MigrationInterface, QueryRunner } from "typeorm";

export class AllterMessageReply1784086205100 implements MigrationInterface {
    name = "AllterMessageReply1784086205100";

    public async up(queryRunner: QueryRunner): Promise<void> {

        // Xóa FK cũ (reply_to_id -> id)
        await queryRunner.query(`
            ALTER TABLE "live_messages"
            DROP CONSTRAINT IF EXISTS "FK_87b211a636e70ab69362e88e802";
        `);



        // Đổi reply_to_id sang varchar
        await queryRunner.query(`
            ALTER TABLE "live_messages"
            ALTER COLUMN "reply_to_id"
            TYPE varchar
            USING "reply_to_id"::varchar;
        `);

        // FK mới -> facebook_mid
        await queryRunner.query(`
            ALTER TABLE "live_messages"
            ADD CONSTRAINT "FK_live_messages_reply"
            FOREIGN KEY ("reply_to_id")
            REFERENCES "live_messages"("facebook_mid")
            ON DELETE SET NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            ALTER TABLE "live_messages"
            DROP CONSTRAINT IF EXISTS "FK_live_messages_reply";
        `);



        await queryRunner.query(`
            ALTER TABLE "live_messages"
            ALTER COLUMN "reply_to_id"
            TYPE integer
            USING NULLIF("reply_to_id",'')::integer;
        `);

        await queryRunner.query(`
            ALTER TABLE "live_messages"
            ADD CONSTRAINT "FK_87b211a636e70ab69362e88e802"
            FOREIGN KEY ("reply_to_id")
            REFERENCES "live_messages"("id")
            ON DELETE SET NULL;
        `);
    }
}