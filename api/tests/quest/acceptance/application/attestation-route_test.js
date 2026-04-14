import FormData from 'form-data';

import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  knex,
  mockAttestationStorageUpload,
} from '../../../test-helper.js';
import { AttestationTemplateFixture } from '../../../tooling/fixtures/index.js';

describe('Quest | Acceptance | Application | Attestation Route ', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/attestations', function () {
    context('when user has one of the authorized roles', function () {
      let userId;

      beforeEach(async function () {
        userId = databaseBuilder.factory.buildUser.withRole({ role: PIX_ADMIN.ROLES.SUPER_ADMIN }).id;
        await databaseBuilder.commit();
      });
      context('when all parameters are valid', function () {
        it('creates attestation', async function () {
          const templateKey = 'key';
          const templateName = 'name';

          const formData = new FormData();
          formData.append('templateKey', templateKey);
          formData.append('templateName', templateName);
          const templateFile = await AttestationTemplateFixture.getFile();
          formData.append('templateFile', templateFile, {
            filename: 'attestation-template.pdf',
            contentType: 'application/pdf',
          });
          mockAttestationStorageUpload({ attestation: { templateName } });
          const options = {
            method: 'POST',
            url: '/api/admin/attestations',
            headers: {
              ...formData.getHeaders(),
              ...generateAuthenticatedUserRequestHeaders({ userId }),
            },
            payload: formData.getBuffer(),
          };

          // when
          const response = await server.inject(options);

          // then
          const createdAttestation = await knex('attestations').where('key', templateKey).first();

          expect(response.statusCode).to.equal(204);

          expect(createdAttestation.templateName).to.equal('name');
        });
      });

      context('when file is not a pdf', function () {
        it('should return a 400 error code', async function () {
          // given
          const formData = new FormData();
          formData.append('templateKey', 'key');
          formData.append('templateName', 'name');

          formData.append('templateFile', Buffer.alloc(0), { filename: 'testFile_temp.jpeg' });

          const options = {
            method: 'POST',
            url: '/api/admin/attestations',
            headers: {
              ...formData.getHeaders(),
              ...generateAuthenticatedUserRequestHeaders({ userId }),
            },
            payload: formData.getBuffer(),
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(400);
        });
      });
    });
  });
});
