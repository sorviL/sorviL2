import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("reading_updates", (table) => {
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
    table.integer("current_page").unsigned().nullable();
    table.decimal("percentage", 5, 2).nullable();
    table.text("comment").nullable();
    table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
    table.boolean("deleted").notNullable().defaultTo(false);

    table.index("created_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("reading_updates");
}
