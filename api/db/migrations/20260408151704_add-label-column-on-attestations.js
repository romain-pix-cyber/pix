const TABLE_NAME = 'attestations';
const COLUMN_NAME = 'label';

const keyAndLabelPairs = [
  { key: 'EDUCOLLAB', label: 'Pix+Edu - Communiquer collaborer' },
  { key: 'EDUCULTURENUM', label: 'Pix+Edu - Culture numérique' },
  { key: 'EDUDOC', label: 'Pix+Edu - Adapter les documents' },
  { key: 'EDUIA', label: 'Pix+Edu - Données, algorithmes et IA' },
  { key: 'EDUINCONTOURNABLES', label: 'Pix+Edu - Les incontournables' },
  { key: 'EDURESSOURCES', label: 'Pix+Edu - Gestion et partage de ressources' },
  { key: 'EDUSECU', label: 'Pix+Edu - Numérique et sécurité' },
  { key: 'EDUSUPPORT', label: 'Pix+Edu - Créer des supports pédagogiques' },
  { key: 'EDUVEILLE', label: 'Pix+Edu - Réaliser une veille' },
  { key: 'MAIRIEBUREAU', label: 'Mairie de Paris - Fondamentaux bureautiques' },
  { key: 'MINARM', label: 'Socle numérique' },
  { key: 'PARENTHOOD', label: 'Attestation de sensibilisation au numérique' },
  { key: 'SIXTH_GRADE', label: 'Attestation de sensibilisation au numérique' },
];

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string(COLUMN_NAME).defaultTo(null).comment('Name used to display attestations');
  });

  for (const { label, key } of keyAndLabelPairs) {
    await knex(TABLE_NAME)
      .update({ [`${COLUMN_NAME}`]: label })
      .where('key', key);
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};

export { down, up };
