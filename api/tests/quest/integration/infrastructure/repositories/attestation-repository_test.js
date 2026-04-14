import * as attestationRepository from '../../../../../src/quest/infrastructure/repositories/attestation-repository.js';
import { AttestationStorage } from '../../../../../src/quest/infrastructure/storage/attestation-storage.js';
import { AlreadyExistingEntityError } from '../../../../../src/shared/domain/errors.js';
import { S3UploadError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, expect, knex, mockAttestationStorageUpload } from '../../../../test-helper.js';
import { AttestationTemplateFixture } from '../../../../tooling/fixtures/index.js';

describe('Quest | Integration | Repository | attestation', function () {
  describe('#save', function () {
    it('should upload attestation file and save attestation in db', async function () {
      const templateName = 'name';
      const templateKey = 'key';
      const templateFile = await AttestationTemplateFixture.getFile();

      //when
      const storageMock = mockAttestationStorageUpload({ attestation: { templateName } });

      await attestationRepository.save({
        templateName,
        templateKey,
        templateFile,
        attestationStorage: AttestationStorage.createClient(),
      });

      // then
      const results = await knex('attestations');

      expect(storageMock.isDone()).to.be.true;
      expect(results.length).to.equal(1);
      expect(results[0].key).to.equal(templateKey);
      expect(results[0].templateName).to.equal(templateName);
    });

    it('should not save attestation in db if file upload failed', async function () {
      const templateName = 'name';
      const templateKey = 'key';
      const templateFile = await AttestationTemplateFixture.getFile();

      //when
      const storageMock = mockAttestationStorageUpload({ attestation: { templateName }, isFailed: true });
      const error = await catchErr(attestationRepository.save)({
        templateName,
        templateKey,
        templateFile,
        attestationStorage: AttestationStorage.createClient(),
      });

      // then
      const results = await knex('attestations');

      expect(storageMock.isDone()).to.be.true;
      expect(results.length).to.equal(0);
      expect(error).to.be.instanceOf(S3UploadError);
    });

    it('should not save attestation in db if attestation exists', async function () {
      const templateName = 'name';
      const templateKey = 'key';
      const templateFile = await AttestationTemplateFixture.getFile();

      databaseBuilder.factory.buildAttestation({ key: templateKey, templateName: 'anotherTemplateName' });
      await databaseBuilder.commit();

      //when
      const error = await catchErr(attestationRepository.save)({
        templateName,
        templateKey,
        templateFile,
        attestationStorage: null,
      });

      // then
      const results = await knex('attestations');

      expect(results.length).to.equal(1);
      expect(results[0].templateName).to.equal('anotherTemplateName');
      expect(error).to.be.instanceOf(AlreadyExistingEntityError);
    });
  });
});
