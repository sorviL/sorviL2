import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn("books", "open_library_key");
  if (!hasColumn) {
    await knex.schema.alterTable("books", (table) => {
      table.string("open_library_key", 50).nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn("books", "open_library_key");
  if (hasColumn) {
    await knex.schema.alterTable("books", (table) => {
      table.dropColumn("open_library_key");
    });
  }
}
