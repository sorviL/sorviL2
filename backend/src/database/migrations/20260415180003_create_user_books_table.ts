import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("user_books", (table) => {
    table.increments("id").primary();
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .integer("book_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("books")
      .onDelete("CASCADE");
    table
      .enum("status", ["quero_ler", "lendo", "lido", "relendo", "abandonado"])
      .notNullable();
    table.boolean("is_favorite").notNullable().defaultTo(false);
    table.decimal("rating", 2, 1).nullable();
    table.integer("current_page").unsigned().nullable();
    table.date("started_at").nullable();
    table.date("finished_at").nullable();
    table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
    table.datetime("updated_at").notNullable().defaultTo(knex.fn.now());
    table.boolean("deleted").notNullable().defaultTo(false);

    table.unique(["user_id", "book_id"]);
    table.index("status");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("user_books");
}
