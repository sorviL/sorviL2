import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("reading_update_likes", (table) => {
    table.increments("id").primary();
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .integer("reading_update_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("reading_updates")
      .onDelete("CASCADE");
    table.datetime("created_at").notNullable().defaultTo(knex.fn.now());

    table.unique(["user_id", "reading_update_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("reading_update_likes");
}
