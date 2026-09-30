import { Migration } from '@mikro-orm/migrations';

export class Migration20260522202404 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "contact_submission" ("id" text not null, "name" text not null, "email" text not null, "phone" text null, "subject" text null, "message" text not null, "status" text check ("status" in ('new', 'read', 'replied', 'archived')) not null default 'new', "replied_at" timestamptz null, "replied_by_user_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "contact_submission_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_contact_submission_deleted_at" ON "contact_submission" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "contact_submission" cascade;`);
  }

}
