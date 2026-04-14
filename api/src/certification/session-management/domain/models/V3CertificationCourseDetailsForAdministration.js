export class V3CertificationCourseDetailsForAdministration {
  constructor({
    certificationCourseId,
    certificationChallengesForAdministration = [],
    isRejectedForFraud,
    createdAt,
    completedAt,
    endedAt = null,
    assessmentState,
    assessmentResultStatus,
    abortReason,
    pixScore,
    reachedMeshIndex,
    eduV3ExternalJuryResult,
    numberOfChallenges,
    certificationFramework,
  }) {
    this.certificationCourseId = certificationCourseId;
    this.isRejectedForFraud = isRejectedForFraud;
    this.certificationChallengesForAdministration = certificationChallengesForAdministration;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.assessmentState = assessmentState;
    this.assessmentResultStatus = assessmentResultStatus;
    this.abortReason = abortReason;
    this.pixScore = pixScore;
    this.reachedMeshIndex = reachedMeshIndex;
    this.eduV3ExternalJuryResult = eduV3ExternalJuryResult;
    this.numberOfChallenges = numberOfChallenges;
    this.endedAt = endedAt;
    this.certificationFramework = certificationFramework;
  }

  get reachedResultKey() {
    const resultKey = this.eduV3ExternalJuryResult || (this.reachedMeshIndex ?? 'BELOW_MINIMUM');
    return `${this.certificationFramework}.${resultKey}`;
  }

  setCompetencesDetails(competenceList) {
    this.certificationChallengesForAdministration.forEach((challenge) => {
      challenge.setCompetenceDetails(competenceList);
    });
  }
}
