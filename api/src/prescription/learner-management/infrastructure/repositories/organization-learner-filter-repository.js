import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { UnicityConstraintError } from '../../../../shared/domain/errors.js';
import * as knexUtils from '../../../../shared/infrastructure/utils/knex-utils.js';

const deleteOrganizationLearnerFiltersFromOrganizationId = async function (organizationId) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn('organization_learner_filters').where('organization_id', organizationId).del();
};

const saveOrganizationLearnerFilters = async function (organizationLearnerFilters) {
  try {
    const knexConn = DomainTransaction.getConnection();
    await knexConn.batchInsert('organization_learner_filters', organizationLearnerFilters).transacting(knexConn);
  } catch (error) {
    if (knexUtils.isUniqConstraintViolated(error) && error.code === '23505') {
      throw new UnicityConstraintError(
        'Unicity constraint failed on organization learner filter repository',
        error.detail,
      );
    }

    throw error;
  }
};

export { deleteOrganizationLearnerFiltersFromOrganizationId, saveOrganizationLearnerFilters };
