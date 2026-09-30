import { Migration } from '@mikro-orm/migrations';

export class Migration20260523110000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "home_slot" drop constraint if exists "home_slot_slot_check";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "home_slot" add constraint "home_slot_slot_check" check ("slot" in ('hero', 'category-grid', 'featured-collection-1', 'featured-collection-2', 'blog-preview', 'promo'));`);
  }

}
