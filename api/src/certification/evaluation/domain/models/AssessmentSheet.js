import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { ABORT_REASONS } from '../../../shared/domain/constants/abort-reasons.js';

export const STATES = Assessment.states;
export const STATES_OF_LAST_QUESTION = Assessment.statesOfLastQuestion;

export class AssessmentSheet {
  /**
   * @param {object} params
   * @param {number} params.certificationCourseId
   * @param {number} params.userId
   * @param {number} params.assessmentId
   * @param {string} params.lastChallengeId
   * @param {Assessment.statesOfLastQuestion} params.lastQuestionState
   * @param {Date} params.lastQuestionDate
   * @param {ABORT_REASONS} params.abortReason
   * @param {boolean} params.isRejectedForFraud
   * @param {Assessment.states} params.state
   * @param {Date} params.assessmentUpdatedAt
   * @param {Date} params.certificationCourseUpdatedAt
   * @param {Date} params.lastAnswerAt
   * @param {Answer[]} params.answers
   */
  constructor({
    certificationCourseId,
    userId,
    assessmentId,
    lastChallengeId,
    lastQuestionState,
    lastQuestionDate,
    abortReason,
    isRejectedForFraud,
    state,
    assessmentUpdatedAt,
    certificationCourseUpdatedAt,
    lastAnswerAt,
    answers,
  }) {
    this.certificationCourseId = certificationCourseId;
    this.userId = userId;
    this.assessmentId = assessmentId;
    this.lastChallengeId = lastChallengeId;
    this.lastQuestionState = lastQuestionState;
    this.lastQuestionDate = lastQuestionDate;
    this.abortReason = abortReason;
    this.isRejectedForFraud = isRejectedForFraud;
    this.state = state;
    this.assessmentUpdatedAt = assessmentUpdatedAt;
    this.certificationCourseUpdatedAt = certificationCourseUpdatedAt;
    this.lastAnswerAt = lastAnswerAt;
    this.answers = answers;
  }

  get isAbortReasonTechnical() {
    return this.abortReason === ABORT_REASONS.TECHNICAL;
  }

  get isStarted() {
    return this.state === STATES.STARTED;
  }

  complete() {
    if (this.state === STATES.STARTED) {
      this.state = STATES.COMPLETED;
      this.assessmentUpdatedAt = new Date();
    }
  }

  isEndedByInvigilator() {
    return this.state === STATES.ENDED_BY_INVIGILATOR;
  }

  hasBeenEndedDueToFinalization() {
    return this.state === STATES.ENDED_DUE_TO_FINALIZATION;
  }

  hasAnsweredChallenge(challengeId) {
    return this.answers.some((answer) => answer.challengeId === challengeId);
  }

  isChallengeExpectedToBeAnswered(challengeId) {
    return Boolean(!this.lastChallengeId || this.lastChallengeId === challengeId);
  }

  hasLastQuestionBeenFocusedOut() {
    return this.lastQuestionState === STATES_OF_LAST_QUESTION.FOCUSEDOUT;
  }

  refreshLastAnswerTimestamp(refreshDate) {
    this.lastAnswerAt = refreshDate;
    this.certificationCourseUpdatedAt = refreshDate;
  }
}
