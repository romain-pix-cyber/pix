import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { expect, knex, mockAttestationStorageUpload } from '../../../../test-helper.js';
import { AttestationTemplateFixture } from '../../../../tooling/fixtures/index.js';

describe('Integration | Attestation | Domain | UseCases | create-attestation', function () {
  it('should create an attestation', async function () {
    // given
    const templateKey = 'key';
    const templateName = 'name';
    const templateFile = await AttestationTemplateFixture.getFile();
    mockAttestationStorageUpload({ attestation: { templateName } });

    // when
    await usecases.createAttestation({ templateKey, templateName, templateFile });

    // then
    const result = await knex('attestations').where('key', templateKey);

    expect(result.length).to.equal(1);
    expect(result[0].key).to.equal(templateKey);
    expect(result[0].templateName).to.equal(templateName);
  });
});
