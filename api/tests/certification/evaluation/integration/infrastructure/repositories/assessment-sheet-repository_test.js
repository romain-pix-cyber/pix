import * as assessmentSheetRepository from '../../../../../../src/certification/evaluation/infrastructure/repositories/assessment-sheet-repository.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Certification | Evaluation | Infrastructure | Repositories | AssessmentSheetRepository', function () {
  let certificationCourseId, assessmentId, userId, answerData;
  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;
    certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
      abortReason: 'candidate',
      maxReachableLevelOnCertificationDate: 6,
      isRejectedForFraud: true,
      userId,
      updatedAt: new Date('2022-02-22'),
      lastAnswerAt: new Date('2022-01-11'),
    }).id;
    assessmentId = databaseBuilder.factory.buildAssessment({
      certificationCourseId,
      state: Assessment.states.COMPLETED,
      updatedAt: new Date('2023-10-05'),
      userId,
      lastChallengeId: 'nextChallengeIdToAnswer',
      lastQuestionDate: new Date('2024-11-07'),
      lastQuestionState: Assessment.statesOfLastQuestion.TIMEOUT,
    }).id;
    answerData = databaseBuilder.factory.buildAnswer({ assessmentId, result: 'ok' });
    await databaseBuilder.commit();
  });

  describe('#findByCertificationCourseId', function () {
    context('when the certification course exists', function () {
      it('should return the assessment sheet', async function () {
        // when
        const assessmentSheet = await assessmentSheetRepository.findByCertificationCourseId(certificationCourseId);

        // then
        expect(assessmentSheet).to.deepEqualInstance(
          domainBuilder.certification.evaluation.buildAssessmentSheet({
            certificationCourseId,
            assessmentId,
            userId,
            abortReason: 'candidate',
            isRejectedForFraud: true,
            state: Assessment.states.COMPLETED,
            assessmentUpdatedAt: new Date('2023-10-05'),
            answers: [domainBuilder.buildAnswer(answerData)],
            lastChallengeId: 'nextChallengeIdToAnswer',
            lastQuestionDate: new Date('2024-11-07'),
            lastQuestionState: Assessment.statesOfLastQuestion.TIMEOUT,
            certificationCourseUpdatedAt: new Date('2022-02-22'),
            lastAnswerAt: new Date('2022-01-11'),
          }),
        );
      });
    });

    context('when the certification course does not exist', function () {
      it('should return null', async function () {
        // when
        const assessmentSheet = await assessmentSheetRepository.findByCertificationCourseId(certificationCourseId + 1);

        // then
        expect(assessmentSheet).to.be.null;
      });
    });
  });

  describe('#update', function () {
    it('should update only allowed fields of the assessment the assessment sheet', async function () {
      // given
      const assessmentSheetToUpdate = domainBuilder.certification.evaluation.buildAssessmentSheet({
        certificationCourseId,
        assessmentId,
        abortReason: 'technical',
        isRejectedForFraud: false,
        state: Assessment.states.STARTED,
        assessmentUpdatedAt: new Date('2024-05-11'),
        answers: [],
        lastChallengeId: 'somethingElse',
        lastQuestionDate: new Date('2033-10-07'),
        lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
        certificationCourseUpdatedAt: new Date('2044-02-22'),
        lastAnswerAt: new Date('2044-01-11'),
      });

      // when
      await assessmentSheetRepository.update(assessmentSheetToUpdate);

      // then
      const updatedAssessmentSheet = await assessmentSheetRepository.findByCertificationCourseId(certificationCourseId);
      expect(updatedAssessmentSheet).to.deepEqualInstance(
        domainBuilder.certification.evaluation.buildAssessmentSheet({
          certificationCourseId,
          assessmentId,
          userId,
          abortReason: 'candidate',
          isRejectedForFraud: true,
          state: Assessment.states.STARTED, // updated
          assessmentUpdatedAt: new Date('2024-05-11'), // updated
          answers: [domainBuilder.buildAnswer(answerData)],
          lastChallengeId: 'nextChallengeIdToAnswer',
          lastQuestionDate: new Date('2024-11-07'),
          lastQuestionState: Assessment.statesOfLastQuestion.TIMEOUT,
          certificationCourseUpdatedAt: new Date('2044-02-22'), // updated
          lastAnswerAt: new Date('2044-01-11'), // updated
        }),
      );
    });
  });
});
