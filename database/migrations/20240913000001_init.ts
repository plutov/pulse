import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("monitors", (table) => {
    table.uuid("id").primary();
    table.string("name", 255).notNullable().unique();
    table.text("description");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index("name");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("monitors");
}
