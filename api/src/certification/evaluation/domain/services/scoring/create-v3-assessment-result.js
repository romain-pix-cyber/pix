import { AssessmentResultFactory } from '../../models/factories/AssessmentResultFactory.js';

export function createV3AssessmentResult({
  toBeCancelled,
  allAnswers,
  assessmentId,
  pixScore,
  capacity,
  reachedMeshIndex,
  versionId,
  status,
  competenceMarks,
  isRejectedForFraud,
  isAbortReasonTechnical,
  juryId,
  minimumAnswersRequiredToValidateACertification,
}) {
  if (toBeCancelled) {
    return AssessmentResultFactory.buildCancelledAssessmentResult({
      juryId,
      pixScore,
      assessmentId,
      competenceMarks,
      capacity,
      reachedMeshIndex,
      versionId,
    });
  }
  if (isRejectedForFraud) {
    return AssessmentResultFactory.buildFraud({
      pixScore,
      assessmentId,
      juryId,
      competenceMarks,
      capacity,
      reachedMeshIndex,
      versionId,
    });
  }

  if (
    _candidateDidNotAnswerEnoughV3CertificationQuestions(allAnswers, minimumAnswersRequiredToValidateACertification)
  ) {
    if (isAbortReasonTechnical) {
      return AssessmentResultFactory.buildLackOfAnswersForTechnicalReason({
        pixScore,
        assessmentId,
        juryId,
        competenceMarks,
        capacity,
        reachedMeshIndex,
        versionId,
      });
    } else {
      return AssessmentResultFactory.buildLackOfAnswers({
        pixScore,
        status,
        assessmentId,
        juryId,
        competenceMarks,
        capacity,
        reachedMeshIndex,
        versionId,
      });
    }
  }

  if (pixScore === 0 || reachedMeshIndex === null) {
    return AssessmentResultFactory.buildRejectedDueToBelowMinimumMesh({
      pixScore,
      assessmentId,
      juryId,
      capacity,
      reachedMeshIndex,
      versionId,
    });
  }

  return AssessmentResultFactory.buildStandardAssessmentResult({
    pixScore,
    status,
    assessmentId,
    juryId,
    competenceMarks,
    capacity,
    reachedMeshIndex,
    versionId,
  });
}

function _candidateDidNotAnswerEnoughV3CertificationQuestions(
  allAnswers,
  minimumAnswersRequiredToValidateACertification,
) {
  return allAnswers.length < minimumAnswersRequiredToValidateACertification;
}
