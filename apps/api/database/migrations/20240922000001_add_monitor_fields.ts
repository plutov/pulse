import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("monitors", (table) => {
    table.string("schedule", 255).notNullable();
    table
      .enu("status", ["active", "paused"], {
        useNative: true,
        enumName: "monitor_status",
      })
      .defaultTo("active")
      .notNullable();
    table.jsonb("config").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("monitors", (table) => {
    table.dropColumn("schedule");
    table.dropColumn("status");
    table.dropColumn("config");
  });
  await knex.raw("DROP TYPE IF EXISTS monitor_status CASCADE");
}
