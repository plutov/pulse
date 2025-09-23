import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("runs", (table) => {
    table.uuid("id").primary();
    table
      .uuid("monitor_id")
      .notNullable()
      .references("id")
      .inTable("monitors")
      .onDelete("CASCADE");
    table
      .enu("status", ["success", "failure", "timeout"], {
        useNative: true,
        enumName: "run_status",
      })
      .notNullable();
    table.integer("duration_ms").notNullable().defaultTo(0);
    table.jsonb("result_details").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.index(["monitor_id", "created_at"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("runs");
  await knex.raw("DROP TYPE IF EXISTS run_status CASCADE");
}
