import { status as assessmentResultStatuses } from '../../../../shared/domain/models/AssessmentResult.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
const STARTED = 'started';
const ENDED_BY_INVIGILATOR = 'endedByInvigilator';
const CORE_CERTIFICATION = 'CORE';
const DOUBLE_CORE_CLEA_CERTIFICATION = 'DOUBLE_CORE_CLEA';

export class JuryCertificationSummary {
  constructor({
    id,
    firstName,
    lastName,
    status,
    pixScore,
    algorithmVersion,
    reachedMeshIndex,
    createdAt,
    completedAt,
    abortReason,
    isPublished,
    isEndedByInvigilator,
    eduV3ExternalJuryResult,
    certificationFramework,
    certificationIssueReports,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.status = _getStatus({ status, isEndedByInvigilator });
    this.algorithmVersion = algorithmVersion;
    this.pixScore = pixScore;
    this.reachedMeshIndex = reachedMeshIndex;
    this.eduV3ExternalJuryResult = eduV3ExternalJuryResult;
    this.isFlaggedAborted = Boolean(abortReason) && !completedAt;
    this.certificationFramework = certificationFramework;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.isPublished = isPublished;
    this.certificationIssueReports = certificationIssueReports;
  }

  get reachedResultKey() {
    if (this.algorithmVersion !== AlgorithmEngineVersion.V3) {
      return `${this.certificationFramework}.NONE`;
    }

    const resultKey = this.eduV3ExternalJuryResult || (this.reachedMeshIndex ?? 'BELOW_MINIMUM');

    return `${this.certificationFramework}.${resultKey}`;
  }

  isActionRequired() {
    return this.certificationIssueReports.some((issueReport) => issueReport.isImpactful && !issueReport.isResolved());
  }

  hasScoringError() {
    return this.status === assessmentResultStatuses.ERROR;
  }

  hasCompletedAssessment() {
    return this.status !== STARTED;
  }

  getCertificationLabel(translate) {
    return this.#shouldBeTranslated() ? translate(this.#getKeyToTranslate()) : this.certificationObtained;
  }

  #getKeyToTranslate() {
    return `jury-certification-summary.comment.${this.certificationObtained}`;
  }

  #shouldBeTranslated() {
    return !!(
      this.certificationObtained === CORE_CERTIFICATION || this.certificationObtained === DOUBLE_CORE_CLEA_CERTIFICATION
    );
  }
}

function _getStatus({ status, isEndedByInvigilator }) {
  if (isEndedByInvigilator) {
    return ENDED_BY_INVIGILATOR;
  }

  if (!Object.values(assessmentResultStatuses).includes(status)) {
    return STARTED;
  }

  return status;
}
