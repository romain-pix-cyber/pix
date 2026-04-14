import FormData from 'form-data';

import { attestationController } from '../../../../src/quest/application/attestation-controller.js';
import * as attestationRoute from '../../../../src/quest/application/attestation-route.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect, generateAuthenticatedUserRequestHeaders, HttpTestServer, sinon } from '../../../test-helper.js';
import { AttestationTemplateFixture } from '../../../tooling/fixtures/index.js';

describe('Quest | Unit | Routes | Attestation Route', function () {
  describe('POST /api/admin/attestations', function () {
    describe('when parameters are valid', function () {
      it('should call prehandler with exact parameters', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(attestationController, 'save').resolves('ok');

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(attestationRoute);

        const formData = new FormData();
        formData.append('templateKey', 'my_key');
        formData.append('templateName', 'my_name');
        formData.append('templateFile', await AttestationTemplateFixture.getFile());

        const headers = {
          ...formData.getHeaders(),
          ...generateAuthenticatedUserRequestHeaders({ userId: 132 }),
        };
        const payload = formData.getBuffer();
        // when
        await httpTestServer.request('POST', '/api/admin/attestations', payload, null, headers);

        // then
        expect(securityPreHandlers.hasAtLeastOneAccessOf).to.have.been.calledOnceWithExactly([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleMetier,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
        ]);
      });
    });
    describe('when parameters are invalid', function () {
      it('should fail when templateKey is missing', async function () {
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(attestationController, 'save').resolves('ok');

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(attestationRoute);

        const formData = new FormData();
        formData.append('templateName', 'my_name');
        formData.append('templateFile', await AttestationTemplateFixture.getFile());

        const headers = {
          ...formData.getHeaders(),
          ...generateAuthenticatedUserRequestHeaders({ userId: 132 }),
        };
        const payload = formData.getBuffer();

        // when
        const response = await httpTestServer.request('POST', '/api/admin/attestations', payload, null, headers);

        //then
        expect(response.statusCode).to.equal(400);
      });
      it('should fail when templateName is missing', async function () {
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(attestationController, 'save').resolves('ok');

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(attestationRoute);

        const formData = new FormData();
        formData.append('templateKey', 'key');
        formData.append('templateFile', await AttestationTemplateFixture.getFile());

        const headers = {
          ...formData.getHeaders(),
          ...generateAuthenticatedUserRequestHeaders({ userId: 132 }),
        };
        const payload = formData.getBuffer();

        // when
        const response = await httpTestServer.request('POST', '/api/admin/attestations', payload, null, headers);

        //then
        expect(response.statusCode).to.equal(400);
      });
      it('should fail when templateFile is missing', async function () {
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(attestationController, 'save').resolves('ok');

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(attestationRoute);

        const formData = new FormData();
        formData.append('templateName', 'name');
        formData.append('templateKey', 'key');

        const headers = {
          ...formData.getHeaders(),
          ...generateAuthenticatedUserRequestHeaders({ userId: 132 }),
        };
        const payload = formData.getBuffer();

        // when
        const response = await httpTestServer.request('POST', '/api/admin/attestations', payload, null, headers);

        //then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
