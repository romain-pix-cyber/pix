import * as userRecommendedTrainingRepository from '../../../../devcomp/infrastructure/repositories/user-recommended-training-repository.js';
import * as badgeAcquisitionRepository from '../../../../evaluation/infrastructure/repositories/badge-acquisition-repository.js';
import * as userRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import * as organizationFeatureApi from '../../../../organizational-entities/application/api/organization-features-api.js';
import * as organizationsProfileRewardRepository from '../../../../profile/infrastructure/repositories/organizations-profile-reward-repository.js';
import * as obfuscationService from '../../../../shared/domain/services/obfuscation-service.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import * as userReconciliationService from '../../../../shared/domain/services/user-reconciliation-service.js';
import { featureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';
import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import { auditLoggingJobRepository } from '../../../../shared/infrastructure/repositories/jobs/audit-logging-job.repository.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import * as membershipRepository from '../../../../team/infrastructure/repositories/membership.repository.js';
import * as campaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as campaignParticipationRepositoryFromBC from '../../../campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import * as libOrganizationLearnerRepository from '../../../organization-learner/infrastructure/repositories/organization-learner-repository.js';
import * as registrationOrganizationLearnerRepository from '../../../organization-learner/infrastructure/repositories/registration-organization-learner-repository.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import { importCommonOrganizationLearnersJobRepository } from '../../infrastructure/repositories/jobs/import-common-organization-learners-job-repository.js';
import { importOrganizationLearnersJobRepository } from '../../infrastructure/repositories/jobs/import-organization-learners-job-repository.js';
import { importScoCsvOrganizationLearnersJobRepository } from '../../infrastructure/repositories/jobs/import-sco-csv-organization-learners-job-repository.js';
import { importSupOrganizationLearnersJobRepository } from '../../infrastructure/repositories/jobs/import-sup-organization-learners-job-repository.js';
import { validateCommonOrganizationImportFileJobRepository } from '../../infrastructure/repositories/jobs/validate-common-organization-learners-import-file-job-repository.js';
import { validateCsvOrganizationImportFileJobRepository } from '../../infrastructure/repositories/jobs/validate-csv-organization-learners-import-file-job-repository.js';
import { validateOrganizationImportFileJobRepository } from '../../infrastructure/repositories/jobs/validate-organization-learners-import-file-job-repository.js';
import * as organizationImportRepository from '../../infrastructure/repositories/organization-import-repository.js';
import * as organizationLearnerFilterRepository from '../../infrastructure/repositories/organization-learner-filter-repository.js';
import * as organizationLearnerImportFormatRepository from '../../infrastructure/repositories/organization-learner-import-format-repository.js';
import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import * as studentRepository from '../../infrastructure/repositories/student-repository.js';
import * as supOrganizationLearnerRepository from '../../infrastructure/repositories/sup-organization-learner-repository.js';
import { importStorage } from '../../infrastructure/storage/import-storage.js';

/**
 * @typedef {dependencies} PrescriptionLearnerManagementDependencies
 */

const dependencies = {
  assessmentRepository,
  badgeAcquisitionRepository,
  campaignParticipationRepository: repositories.campaignParticipationRepository,
  campaignParticipationRepositoryFromBC,
  campaignRepository,
  auditLoggingJobRepository,
  featureToggles,
  importCommonOrganizationLearnersJobRepository,
  importOrganizationLearnersJobRepository,
  importScoCsvOrganizationLearnersJobRepository,
  importStorage,
  importSupOrganizationLearnersJobRepository,
  libOrganizationLearnerRepository,
  logger,
  membershipRepository,
  obfuscationService,
  organizationFeatureApi,
  organizationFeatureRepository: repositories.organizationFeatureRepository,
  organizationImportRepository,
  organizationLearnerFilterRepository,
  organizationLearnerImportFormatRepository,
  organizationLearnerRepository,
  organizationRepository,
  organizationsProfileRewardRepository,
  placementProfileService,
  registrationOrganizationLearnerRepository,
  studentRepository,
  supOrganizationLearnerRepository,
  userRecommendedTrainingRepository,
  userReconciliationService,
  userRepository,
  validateCommonOrganizationImportFileJobRepository,
  validateCsvOrganizationImportFileJobRepository,
  validateOrganizationImportFileJobRepository,
};

import { addOrUpdateOrganizationLearners } from './add-or-update-organization-learners.js';
import { anonymizeUser } from './anonymize-user.js';
import { computeOrganizationLearnerCertificability } from './compute-organization-learner-certificability.js';
import { deleteOrganizationLearners } from './delete-organization-learners.js';
import { dissociateUserFromOrganizationLearner } from './dissociate-user-from-organization-learner.js';
import { findAllOrganizationLearnerImportFormats } from './find-all-organization-learner-import-format.js';
import { findOrganizationLearnersBeforeImportFeature } from './find-organization-learners-before-import-feature.js';
import { getDeltaOrganizationLearnerIds } from './get-delta-organization-learner-ids.js';
import { getOrganizationImport } from './get-organization-import.js';
import { getOrganizationImportStatus } from './get-organization-import-status.js';
import { getOrganizationLearnersCsvTemplate } from './get-organization-learners-csv-template.js';
import { handlePayloadTooLargeError } from './handle-payload-too-large-error.js';
import { hasBeenLearner } from './has-been-learner.js';
import { saveOrganizationLearnersFile } from './import-from-feature/save-organization-learners-file.js';
import { sendOrganizationLearnersFile } from './import-from-feature/send-organization-learners-file.js';
import { validateOrganizationLearnersFile } from './import-from-feature/validate-organization-learners-file.js';
import { importOrganizationLearnersFromSIECLECSVFormat } from './import-organization-learners-from-siecle-csv-format.js';
import { importSupOrganizationLearners } from './import-sup-organization-learners.js';
import { reconcileCommonOrganizationLearner } from './reconcile-common-organization-learner.js';
import { reconcileScoOrganizationLearnerAutomatically } from './reconcile-sco-organization-learner-automatically.js';
import { reconcileScoOrganizationLearnerManually } from './reconcile-sco-organization-learner-manually.js';
import { reconcileSupOrganizationLearner } from './reconcile-sup-organization-learner.js';
import { saveOrganizationLearnerImportFormats } from './save-organization-learner-import-formats.js';
import { updateOrganizationLearnerName } from './update-organization-learner-name.js';
import { updateStudentNumber } from './update-student-number.js';
import { uploadCsvFile } from './upload-csv-file.js';
import { uploadSiecleFile } from './upload-siecle-file.js';
import { validateCsvFile } from './validate-csv-file.js';
import { validateSiecleXmlFile } from './validate-siecle-xml-file.js';

const usecasesWithoutInjectedDependencies = {
  saveOrganizationLearnersFile,
  sendOrganizationLearnersFile,
  validateOrganizationLearnersFile,
  addOrUpdateOrganizationLearners,
  anonymizeUser,
  computeOrganizationLearnerCertificability,
  deleteOrganizationLearners,
  dissociateUserFromOrganizationLearner,
  findAllOrganizationLearnerImportFormats,
  findOrganizationLearnersBeforeImportFeature,
  getDeltaOrganizationLearnerIds,
  getOrganizationImportStatus,
  getOrganizationImport,
  getOrganizationLearnersCsvTemplate,
  handlePayloadTooLargeError,
  hasBeenLearner,
  importOrganizationLearnersFromSIECLECSVFormat,
  importSupOrganizationLearners,
  reconcileCommonOrganizationLearner,
  reconcileScoOrganizationLearnerAutomatically,
  reconcileScoOrganizationLearnerManually,
  reconcileSupOrganizationLearner,
  saveOrganizationLearnerImportFormats,
  updateOrganizationLearnerName,
  updateStudentNumber,
  uploadCsvFile,
  uploadSiecleFile,
  validateCsvFile,
  validateSiecleXmlFile,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
