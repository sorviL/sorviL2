import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("reading_updates", (table) => {
    table.string("reaction", 20).nullable();
    table.boolean("has_spoiler").notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("reading_updates", (table) => {
    table.dropColumn("reaction");
    table.dropColumn("has_spoiler");
  });
}
