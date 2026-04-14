const TABLE_NAME = 'organization_learner_filters';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.integer('organization_id').references('organizations.id').comment('Refers to organizations table').index();
    table
      .string('attribute_name')
      .comment('Refers to organization-learners attributes "key" where we can find all values for an organization');
    table.jsonb('values').comment('list of value stored in attributes[key] on organization-learners table');
    table.datetime('created_at').comment('creation date of filter');

    table.unique(['organization_id', 'attribute_name']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
