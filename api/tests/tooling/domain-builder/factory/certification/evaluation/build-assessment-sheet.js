import {
  AssessmentSheet,
  STATES,
  STATES_OF_LAST_QUESTION,
} from '../../../../../../src/certification/evaluation/domain/models/AssessmentSheet.js';

export const buildAssessmentSheet = function ({
  certificationCourseId = 1,
  assessmentId = 2,
  userId = 3,
  lastChallengeId = null,
  abortReason = null,
  isRejectedForFraud = false,
  state = STATES.COMPLETED,
  lastQuestionState = STATES_OF_LAST_QUESTION.ASKED,
  assessmentUpdatedAt = new Date(),
  certificationCourseUpdatedAt = new Date(),
  lastAnswerAt = new Date(),
  lastQuestionDate = new Date(),
  answers = [],
} = {}) {
  return new AssessmentSheet({
    certificationCourseId,
    assessmentId,
    userId,
    lastChallengeId,
    abortReason,
    isRejectedForFraud,
    state,
    lastQuestionState,
    assessmentUpdatedAt,
    certificationCourseUpdatedAt,
    lastAnswerAt,
    lastQuestionDate,
    answers,
  });
};

buildAssessmentSheet.STATES = STATES;
buildAssessmentSheet.STATES_OF_LAST_QUESTION = STATES_OF_LAST_QUESTION;
