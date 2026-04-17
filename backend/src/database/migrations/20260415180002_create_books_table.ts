import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("books", (table) => {
    table.increments("id").primary();
    table.string("google_books_id", 50).notNullable().unique();
    table.string("title", 500).notNullable();
    table.json("authors").nullable();
    table.text("synopsis").nullable();
    table.string("cover_url", 500).nullable();
    table.string("publisher", 255).nullable();
    table.string("published_date", 20).nullable();
    table.integer("page_count").unsigned().nullable();
    table.string("isbn_10", 13).nullable();
    table.string("isbn_13", 17).nullable();
    table.json("categories").nullable();
    table.string("language", 10).nullable();
    table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("books");
}
