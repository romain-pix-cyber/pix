import { setupTest } from 'ember-qunit';
import { assessmentResultStatus, assessmentStates } from 'pix-admin/models/certification';
import setupIntl from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';

module('Unit | Model | certification', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let store;
  let intl;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    intl = this.owner.lookup('service:intl');
  });

  module('#publishedText', function () {
    test('it should return "oui" when isPublished is true', function (assert) {
      // given
      const certification = store.createRecord('certification', {
        isPublished: true,
      });

      // when
      const isPublishedLabel = certification.publishedText;

      // then
      assert.strictEqual(isPublishedLabel, 'Oui');
    });

    test('it should return "non" when isPublished is false', function (assert) {
      // given
      const certification = store.createRecord('certification', {
        isPublished: false,
      });

      // when
      const isPublishedLabel = certification.publishedText;

      // then
      assert.strictEqual(isPublishedLabel, 'Non');
    });
  });

  module('#indexedCompetences', function () {
    test('it should return the indexedCompetences from the competencesWithMark', function (assert) {
      // given
      const certification = store.createRecord('certification', {
        competencesWithMark: [
          {
            id: '1',
            area_code: '1',
            competence_code: '1.1',
            competenceId: 'rec11',
            level: 4,
            score: 39,
            assessmentResultId: 123,
          },
          {
            id: '2',
            area_code: '2',
            competence_code: '2.1',
            competenceId: 'rec21',
            level: 5,
            score: 20,
            assessmentResultId: 123,
          },
        ],
      });

      // when
      const indexedCompetences = certification.indexedCompetences;

      // then
      assert.deepEqual(indexedCompetences, {
        1.1: {
          index: '1.1',
          level: 4,
          score: 39,
        },
        2.1: {
          index: '2.1',
          level: 5,
          score: 20,
        },
      });
    });
  });

  module('#competences', function () {
    test('it should return the competences from the indexedCompetences', function (assert) {
      // given
      const certification = store.createRecord('certification', {
        competencesWithMark: [
          {
            id: '1',
            area_code: '1',
            competence_code: '1.1',
            competenceId: 'rec11',
            level: 4,
            score: 39,
            assessmentResultId: 123,
          },
          {
            id: '2',
            area_code: '2',
            competence_code: '2.1',
            competenceId: 'rec21',
            level: 5,
            score: 20,
            assessmentResultId: 123,
          },
        ],
      });

      // when
      const competences = certification.competences;

      // then
      assert.deepEqual(competences, [
        {
          index: '1.1',
          level: 4,
          score: 39,
        },
        {
          index: '2.1',
          level: 5,
          score: 20,
        },
      ]);
    });
  });

  module('#statusLabelAndValue', function () {
    [
      { value: assessmentStates.STARTED, label: 'Démarrée' },
      { value: assessmentResultStatus.ERROR, label: 'En erreur' },
      { value: assessmentResultStatus.VALIDATED, label: 'Validée' },
      { value: assessmentResultStatus.REJECTED, label: 'Rejetée' },
      { value: assessmentResultStatus.CANCELLED, label: 'Annulée' },
    ].forEach((certificationStatus) => {
      test('it should return the right pair of label and value', function (assert) {
        // given
        const certification = store.createRecord('certification', {
          status: certificationStatus.value,
        });

        // then
        assert.deepEqual(certification.statusLabelAndValue, {
          value: certificationStatus.value,
          label: certificationStatus.label,
        });
      });
    });
  });

  module('#get completionDate', function () {
    test('it should return null if completedAt is null', function (assert) {
      // given
      const juryCertificationSummary = store.createRecord('certification', { completedAt: null });

      // then
      assert.strictEqual(juryCertificationSummary.completionDate, null);
    });

    test('it should a formatted date when completedAt is defined', function (assert) {
      // given
      const completedAt = '2021-06-30 15:10:45';
      const juryCertificationSummary = store.createRecord('certification', { completedAt });

      // then
      const expectedFormat = intl.formatDate(new Date(completedAt), { format: 'long' });
      assert.strictEqual(juryCertificationSummary.completionDate, expectedFormat);
    });
  });

  module('#get isV3', function () {
    test('it should return false if version is not 3', function (assert) {
      // given
      const certification = store.createRecord('certification', { version: 2 });

      // then
      assert.false(certification.isV3);
    });

    test('it should return true if version is 3', function (assert) {
      // given
      const certification = store.createRecord('certification', { version: 3 });

      // then
      assert.true(certification.isV3);
    });
  });

  module('#getInformation', function () {
    test('it should return the certification candidate information', function (assert) {
      // given
      const certification = store.createRecord('certification', {
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        sex: 'F',
        birthInseeCode: '66212',
        birthPostalCode: null,
        birthCountry: 'FRANCE',
      });

      // when
      const information = certification.getInformation();

      // then
      assert.deepEqual(information, {
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        sex: 'F',
        birthInseeCode: '66212',
        birthPostalCode: null,
        birthCountry: 'FRANCE',
      });
    });
  });

  module('#updateInformation', function () {
    test('it should update the certification candidate information', function (assert) {
      // given
      const certification = store.createRecord('certification', {
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        sex: 'F',
        birthInseeCode: '66212',
        birthPostalCode: null,
        birthCountry: 'FRANCE',
      });

      // when
      certification.updateInformation({
        firstName: 'Xander',
        lastName: 'Harris',
        birthdate: '1981-02-22',
        birthplace: 'Argelès',
        sex: 'M',
        birthInseeCode: '99120',
        birthPostalCode: null,
        birthCountry: 'TheMoon !',
      });

      // then
      assert.deepEqual(certification.getInformation(), {
        firstName: 'Xander',
        lastName: 'Harris',
        birthdate: '1981-02-22',
        birthplace: 'Argelès',
        sex: 'M',
        birthInseeCode: '99120',
        birthPostalCode: null,
        birthCountry: 'TheMoon !',
      });
    });
  });

  module('#result', function () {
    test('it should return the translated result for a given reachedResultKey', function (assert) {
      // given & when
      const certification = store.createRecord('certification', {
        reachedResultKey: 'EDU_1ER_DEGRE.0',
      });

      // then
      assert.strictEqual(certification.result, intl.t('common.certification.meshLevels.EDU_1ER_DEGRE.0'));
    });

    test('it should pass pixScore to the translation', function (assert) {
      // given & when
      const certification = store.createRecord('certification', {
        reachedResultKey: 'CORE.NONE',
        pixScore: 450,
      });

      // then
      assert.strictEqual(certification.result, intl.t('common.certification.meshLevels.CORE.NONE', { pixScore: 450 }));
    });
  });

  module('#wasBornInFrance', function () {
    test('it should return true when candidate was born in France', function (assert) {
      // given
      const certification = store.createRecord('certification', { birthCountry: 'FRANCE' });

      // when
      const wasBornInFrance = certification.wasBornInFrance();

      // then
      assert.true(wasBornInFrance);
    });

    test('it should return false when candidate was not born in France', function (assert) {
      // given
      const certification = store.createRecord('certification', { birthCountry: 'OTHER_COUNTRY' });

      // when
      const wasBornInFrance = certification.wasBornInFrance();

      // then
      assert.false(wasBornInFrance);
    });
  });
});
