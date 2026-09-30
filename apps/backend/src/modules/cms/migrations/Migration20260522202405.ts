import { Migration } from '@mikro-orm/migrations';

export class Migration20260522202405 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "cms_page" drop constraint if exists "cms_page_slug_unique";`);
    this.addSql(`create table if not exists "cms_page" ("id" text not null, "slug" text not null, "title" text not null, "body" jsonb null, "seo_title" text null, "seo_description" text null, "updated_by_user_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "cms_page_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_cms_page_slug_unique" ON "cms_page" (slug) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_cms_page_deleted_at" ON "cms_page" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "home_slot" ("id" text not null, "slot" text check ("slot" in ('hero', 'category-grid', 'featured-collection-1', 'featured-collection-2', 'blog-preview', 'promo')) not null, "position" integer not null default 0, "payload" jsonb null, "enabled" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "home_slot_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_home_slot_deleted_at" ON "home_slot" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "site_setting" ("id" text not null, "brand_name" text null, "logo_url" text null, "announcement_text" text null, "announcement_link" text null, "announcement_enabled" boolean not null default false, "social_links" jsonb null, "contact_email" text null, "contact_phone" text null, "footer_copy" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "site_setting_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_site_setting_deleted_at" ON "site_setting" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "cms_page" cascade;`);

    this.addSql(`drop table if exists "home_slot" cascade;`);

    this.addSql(`drop table if exists "site_setting" cascade;`);
  }

}
