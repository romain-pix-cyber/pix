import { JuryCertificationSummary } from '../../../../../../src/certification/session-management/domain/read-models/JuryCertificationSummary.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/AssessmentResult.js';

const buildJuryCertificationSummary = function ({
  id = 123,
  firstName = 'Jean',
  lastName = 'Bon',
  status = AssessmentResult.status.VALIDATED,
  algorithmVersion = 2,
  pixScore = 100,
  reachedMeshIndex = 1,
  createdAt = new Date('2020-01-01'),
  completedAt = new Date('2020-01-02'),
  abortReason = null,
  isPublished = true,
  isEndedByInvigilator = false,
  eduV3ExternalJuryResult = null,
  certificationIssueReports = [],
  certificationFramework = null,
} = {}) {
  return new JuryCertificationSummary({
    id,
    firstName,
    lastName,
    status,
    algorithmVersion,
    pixScore,
    reachedMeshIndex,
    createdAt,
    completedAt,
    abortReason,
    isPublished,
    isEndedByInvigilator,
    eduV3ExternalJuryResult,
    certificationIssueReports,
    certificationFramework,
  });
};

export { buildJuryCertificationSummary };
