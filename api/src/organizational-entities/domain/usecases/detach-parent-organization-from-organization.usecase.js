import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UnableToDetachParentOrganizationFromChildOrganization } from '../errors.js';

const detachParentOrganizationFromOrganization = withTransaction(async function ({
  childOrganizationId,
  organizationForAdminRepository,
}) {
  const childOrganization = await organizationForAdminRepository.get({ organizationId: childOrganizationId });

  // TODO: _checkOrganizationHasParent doit vérifier via fct_structures (parent_structure_id) et non organizations.parentOrganizationId
  _checkOrganizationHasParent(childOrganization);

  childOrganization.updateParentOrganizationId(null);

  // TODO: mettre à jour fct_structures.parent_structure_id et networkId à null lors du détachement
  await organizationForAdminRepository.update({ organization: childOrganization });
});

function _checkOrganizationHasParent(organization) {
  if (!organization.parentOrganizationId) {
    throw new UnableToDetachParentOrganizationFromChildOrganization({
      message: 'Unable to detach parent organization from child because it has no parent.',
      meta: { organizationId: Number(organization.id) },
    });
  }
}
export { detachParentOrganizationFromOrganization };
