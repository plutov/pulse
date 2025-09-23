import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary();
    table.string("username", 255).notNullable().unique();
    table.string("password_hash", 4098).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();

    table.index("username");
  });

  await knex.schema.createTable("monitors", (table) => {
    table.uuid("id").primary();
    table
      .uuid("author")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .enu("monitor_type", ["http"], {
        useNative: true,
        enumName: "monitor_type",
      })
      .notNullable();
    table.string("name", 255).notNullable().unique();
    table.text("description");
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.timestamp("updated_at").defaultTo(knex.fn.now()).notNullable();

    table.index("name");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("monitors");
  await knex.raw("DROP TYPE IF EXISTS monitor_type CASCADE");
  await knex.schema.dropTable("users");
}
