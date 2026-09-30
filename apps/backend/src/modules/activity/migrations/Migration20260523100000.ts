import { Migration } from '@mikro-orm/migrations';

export class Migration20260523100000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "admin_activity" ("id" text not null, "user_id" text null, "user_email" text null, "action" text not null, "resource_type" text not null, "resource_id" text null, "method" text not null, "path" text not null, "status" integer null, "diff" jsonb null, "ip" text null, "ua" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "admin_activity_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_admin_activity_created_at" ON "admin_activity" (created_at DESC) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_admin_activity_resource" ON "admin_activity" (resource_type, resource_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_admin_activity_user" ON "admin_activity" (user_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_admin_activity_deleted_at" ON "admin_activity" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "admin_activity" cascade;`);
  }

}
