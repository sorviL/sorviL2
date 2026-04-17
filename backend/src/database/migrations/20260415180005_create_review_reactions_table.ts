import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("review_reactions", (table) => {
    table.increments("id").primary();
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .integer("review_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("reviews")
      .onDelete("CASCADE");
    table.enum("type", ["like", "dislike"]).notNullable();
    table.datetime("created_at").notNullable().defaultTo(knex.fn.now());

    table.unique(["user_id", "review_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("review_reactions");
}
