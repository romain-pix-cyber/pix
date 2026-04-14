import { Examiner } from '../../../shared/domain/models/Examiner.js';
import { AnswerEvaluationError } from '../errors.js';
import { ValidatorAlwaysOK } from '../models/ValidatorAlwaysOK.js';

export function evaluateAnswer({
  challenge,
  answer,
  challengeSubmittedAt,
  hasChallengeBeenFocusedOut,
  isCertificationEvaluation,
  accessibilityAdjustmentNeeded,
  forceOKAnswer = false,
}) {
  let examiner;
  if (forceOKAnswer) {
    const validatorAlwaysOK = new ValidatorAlwaysOK();
    examiner = new Examiner({ validator: validatorAlwaysOK });
  } else {
    examiner = new Examiner({ validator: challenge.validator });
  }

  try {
    const correctedAnswer = examiner.evaluate({
      answer,
      challengeFormat: challenge.format,
      isFocusedChallenge: challenge.focused,
      hasLastQuestionBeenFocusedOut: hasChallengeBeenFocusedOut,
      isCertificationEvaluation,
      accessibilityAdjustmentNeeded,
    });

    const now = new Date();
    correctedAnswer.setTimeSpentFrom({ now, lastQuestionDate: challengeSubmittedAt || now });
    return correctedAnswer;
  } catch {
    throw new AnswerEvaluationError(challenge);
  }
}
