import * as organizationLearnerFilterRepository from '../../../../../../src/prescription/learner-management/infrastructure/repositories/organization-learner-filter-repository.js';
import { UnicityConstraintError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | Repository | Organization Learner Management | Organization Learner Filter', function () {
  describe('#deleteOrganizationLearnerFiltersFromOrganizationId', function () {
    it('should delete organization learner filter from organizationId', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearnerFilter({
        organizationId,
        attributeName: 'division',
        values: ['E3', '8R', 'Z6'],
      });

      await databaseBuilder.commit();

      // when
      await organizationLearnerFilterRepository.deleteOrganizationLearnerFiltersFromOrganizationId(organizationId);

      // then
      const result = await knex('organization_learner_filters').where('organization_id', organizationId);

      expect(result).lengthOf(0);
    });

    it('should not delete organization learner filter from another organizationId', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      const anotherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearnerFilter({
        organizationId: anotherOrganizationId,
        attributeName: 'division',
        values: ['E3', '8R', 'Z6'],
      });

      await databaseBuilder.commit();

      // when
      await organizationLearnerFilterRepository.deleteOrganizationLearnerFiltersFromOrganizationId(organizationId);

      // then
      const result = await knex('organization_learner_filters').where('organization_id', anotherOrganizationId);

      expect(result).lengthOf(1);
      expect(result[0].attribute_name).equal('division');
      expect(result[0].values).deep.equal(['E3', '8R', 'Z6']);
    });
  });

  describe('#saveOrganizationLearnerFilters', function () {
    it('save organization learner filter', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;

      await databaseBuilder.commit();
      // when
      await organizationLearnerFilterRepository.saveOrganizationLearnerFilters([
        {
          organization_id: organizationId,
          attribute_name: 'Lofteur',
          values: JSON.stringify(['ouai', 'cool', 'wahou']),
        },
        {
          organization_id: organizationId,
          attribute_name: 'MiniKeums',
          values: JSON.stringify(['vanessa', 'non ne pleur pas', 'woho ho ho']),
        },
      ]);

      // then
      const result = await knex('organization_learner_filters').where('organization_id', organizationId);

      expect(result).lengthOf(2);
    });

    it('throw an error when duplicate entry is found', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearnerFilter({
        organizationId,
        attributeName: 'Lofteur',
        values: JSON.stringify(['ouai', 'cool', 'wahou']),
      });

      await databaseBuilder.commit();
      // when
      const error = await catchErr(organizationLearnerFilterRepository.saveOrganizationLearnerFilters)([
        {
          organization_id: organizationId,
          attribute_name: 'Lofteur',
          values: JSON.stringify(['ouai', 'cool', 'wahou']),
        },
        {
          organization_id: organizationId,
          attribute_name: 'MiniKeums',
          values: JSON.stringify(['vanessa', 'non ne pleur pas', 'woho ho ho']),
        },
      ]);

      // then
      expect(error).instanceOf(UnicityConstraintError);
      const result = await knex('organization_learner_filters').where('organization_id', organizationId);

      expect(result).lengthOf(1);
    });
  });
});
