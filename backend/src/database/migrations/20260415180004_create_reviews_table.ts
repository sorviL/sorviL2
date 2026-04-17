import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("reviews", (table) => {
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
    table.decimal("rating", 2, 1).notNullable();
    table.text("content").notNullable();
    table.boolean("has_spoiler").notNullable().defaultTo(false);
    table.date("reading_start_date").nullable();
    table.date("reading_end_date").nullable();
    table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
    table.datetime("updated_at").notNullable().defaultTo(knex.fn.now());
    table.boolean("deleted").notNullable().defaultTo(false);

    table.index("book_id");
    table.index("user_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("reviews");
}
