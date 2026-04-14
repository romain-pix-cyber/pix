import 'dayjs/locale/fr.js';

import querystring from 'node:querystring';

import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSorted from 'chai-sorted';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import MockDate from 'mockdate';
import nock from 'nock';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { DatamartBuilder } from '../datamart/datamart-builder/datamart-builder.js';
import { knex as datamartKnex } from '../datamart/knex-database-connection.js';
import { knex as datawarehouseKnex } from '../datawarehouse/knex-database-connection.js';
import { DatabaseBuilder } from '../db/database-builder/database-builder.js';
import { disconnect, knex } from '../db/knex-database-connection.js';
import { createServer } from '../server.js';
import { createMaddoServer } from '../server.maddo.js';
import * as tutorialRepository from '../src/devcomp/infrastructure/repositories/tutorial-repository.js';
import { ApplicationAccessToken } from '../src/identity-access-management/domain/models/ApplicationAccessToken.js';
import { UserAccessToken } from '../src/identity-access-management/domain/models/UserAccessToken.js';
import { UserReconciliationSamlIdToken } from '../src/identity-access-management/domain/models/UserReconciliationSamlIdToken.js';
import * as missionRepository from '../src/school/infrastructure/repositories/mission-repository.js';
import { featureToggles } from '../src/shared/infrastructure/feature-toggles/index.js';
import { JobClient } from '../src/shared/infrastructure/jobs/JobClient.js';
import { clearMutex, quitMutex } from '../src/shared/infrastructure/mutex/RedisMutex.js';
import * as areaRepository from '../src/shared/infrastructure/repositories/area-repository.js';
import * as challengeRepository from '../src/shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../src/shared/infrastructure/repositories/competence-repository.js';
import * as courseRepository from '../src/shared/infrastructure/repositories/course-repository.js';
import * as frameworkRepository from '../src/shared/infrastructure/repositories/framework-repository.js';
import * as skillRepository from '../src/shared/infrastructure/repositories/skill-repository.js';
import * as thematicRepository from '../src/shared/infrastructure/repositories/thematic-repository.js';
import * as tubeRepository from '../src/shared/infrastructure/repositories/tube-repository.js';
import * as customChaiHelpers from './tooling/chai-custom-helpers/index.js';
import * as domainBuilder from './tooling/domain-builder/factory/index.js';
import { AttestationTemplateFixture } from './tooling/fixtures/index.js';
import { jobChai } from './tooling/jobs/expect-job.js';
import { buildLearningContent as learningContentBuilder } from './tooling/learning-content-builder/index.js';
import { increaseCurrentTestTimeout } from './tooling/mocha-tools.js';
import { HttpTestServer } from './tooling/server/http-test-server.js';
import { createTempFile, isSameBinary, removeTempFile } from './tooling/test-utils/file.js';
import { parseNDJSON } from './tooling/test-utils/json.js';

// Init Dayjs configuration
dayjs.extend(localizedFormat);

// Extends Chai helpers
chaiUse(chaiAsPromised);
chaiUse(chaiSorted);
chaiUse(sinonChai);
chaiUse(jobChai());
Object.values(customChaiHelpers).forEach(chaiUse);

// Init Database builders
const databaseBuilder = await DatabaseBuilder.create({
  knex,
  beforeEmptyDatabase: () => {
    // Sometimes, truncating tables may cause the first ran test to timeout, so
    // we increase the timeout to ensure we don't have flaky tests
    increaseCurrentTestTimeout(2000);
  },
});

const datamartBuilder = await DatamartBuilder.create({
  knex: datamartKnex,
});

// TEMPORARY WORKAROUND
databaseBuilder.factory.learningContent.injectNock(nock);

nock.disableNetConnect();
nock.enableNetConnect('localhost:9090');
const EMPTY_BLANK_AND_NULL = ['', '\t \n', null];

/* eslint-disable mocha/no-top-level-hooks */
before(async function () {
  try {
    await JobClient.instance.initialize();
  } catch {
    // pgBoss is not available on unit tests
  }
});

afterEach(async function () {
  sinon.restore();
  nock.cleanAll();
  frameworkRepository.clearCache();
  areaRepository.clearCache();
  competenceRepository.clearCache();
  thematicRepository.clearCache();
  tubeRepository.clearCache();
  skillRepository.clearCache();
  challengeRepository.clearCache();
  courseRepository.clearCache();
  tutorialRepository.clearCache();
  missionRepository.clearCache();
  await featureToggles.resetDefaults();
  await datamartBuilder.clean();
  await clearMutex();
  try {
    await JobClient.instance.flushJobs();
  } catch {
    // pgBoss is not available on unit tests
  }
  return databaseBuilder.clean();
});

after(async function () {
  await quitMutex();
  try {
    await JobClient.instance.stop();
  } catch {
    // pgBoss is not available on unit tests
  }
  return await disconnect();
});

/* eslint-enable mocha/no-top-level-hooks */

/**
 * For acceptance tests. To be used as `const options = generateInjectOptions; await server.inject(options);`
 *
 * @param {Object} params
 * @param {string} params.url
 * @param {string} params.method
 * @param {Object} [params.payload]
 * @param {string} [params.locale]
 * @param {string} [params.audience]
 * @param {Object} [params.authorizationData] - data to generate an AccessToken, for example: { userId: 1234 }
 * @param {boolean} [params.urlEncodePayload]
 * @returns {Object} options
 */
function generateInjectOptions({ url, method, payload, locale, audience, authorizationData, urlEncodePayload }) {
  const options = {
    url,
    method,
    headers: {
      // cf. cookies = req.headers.cookie in @hapi/hapi/lib/route.js +369
      ...(locale && { cookie: `locale=${locale}` }),
      ...(audience && generateForwardedHeaders(audience)),
    },
  };

  if (payload) {
    if (urlEncodePayload) {
      options.payload = querystring.stringify(payload);
      options.headers['content-type'] = 'application/x-www-form-urlencoded';
    } else {
      options.payload = payload;
    }
  }

  if (authorizationData) {
    if (!audience) {
      throw new Error('You must provide an audience parameter when providing authorizationData.');
    }

    const accessToken = UserAccessToken.generateUserToken({ ...authorizationData, audience }).accessToken;
    options.headers.authorization = `Bearer ${accessToken}`;
  }

  return options;
}

/**
 * @param {Object} params
 * @param {number} params.userId
 * @param {string} params.source
 * @param {string} params.audience - an origin URL, for example: https://app.pix.org
 * @returns {Object} headers
 */
function generateAuthenticatedUserRequestHeaders({
  userId = 1234,
  source = 'pix',
  audience = 'https://app.pix.org',
} = {}) {
  const accessToken = UserAccessToken.generateUserToken({ userId, source, audience }).accessToken;

  return {
    ...generateForwardedHeaders(audience),
    authorization: `Bearer ${accessToken}`,
  };
}

/**
 * Generates HTTP X-Forwarded-Proto (XFP) headers.
 *
 * @param {string} audience - an origin URL, for example: https://app.pix.org
 * @returns {Object} headers
 */
function generateForwardedHeaders(audience) {
  const url = new URL(audience);
  const protoHeader = url.protocol.slice(0, -1);
  const hostHeader = url.hostname;

  return { 'x-forwarded-proto': protoHeader, 'x-forwarded-host': hostHeader };
}

function generateValidRequestAuthorizationHeaderForApplication(clientId = 'client-id-name', source, scope = '') {
  const accessToken = ApplicationAccessToken.generate({ clientId, source, scope });
  return `Bearer ${accessToken}`;
}

function generateIdTokenForExternalUser(externalUser) {
  return UserReconciliationSamlIdToken.generate(externalUser);
}

// Hapi
const hFake = {
  response(source) {
    return {
      statusCode: 200,
      source,
      code(c) {
        this.statusCode = c;
        return this;
      },
      headers: {},
      header(key, value) {
        this.headers[key] = value;
        return this;
      },
      type(type) {
        this.contentType = type;
        return this;
      },
      takeover() {
        this.isTakeOver = true;
        return this;
      },
      created() {
        this.statusCode = 201;
        return this;
      },
    };
  },
  authenticated(data) {
    return {
      authenticated: data,
    };
  },
  redirect(location) {
    return {
      statusCode: 302,
      headers: { location },
    };
  },
  file(path, options) {
    return this.response({ path, options });
  },
  continue: Symbol('continue'),
};

function catchErr(promiseFn, ctx) {
  return async (...args) => {
    try {
      await promiseFn.call(ctx, ...args);
    } catch (err) {
      return err;
    }
    throw new Error('Expected an error, but none was thrown.');
  };
}

function catchErrSync(fn, ctx) {
  return (...args) => {
    try {
      fn.call(ctx, ...args);
    } catch (err) {
      return err;
    }
    throw new Error('Expected an error, but none was thrown.');
  };
}

async function mockLearningContent(learningContent) {
  const scope = databaseBuilder.factory.learningContent.build(learningContent);
  await databaseBuilder.commit();
  return scope;
}

function mockAttestationStorage(attestation) {
  const template = AttestationTemplateFixture.getStream();

  nock('http://attestations.fake.endpoint.example.net:80')
    .get(`/attestations.bucket/${attestation.templateName}.pdf?x-id=GetObject`)
    .reply(200, () => template);

  return template;
}

function mockAttestationStorageUpload({ attestation, isFailed = false }) {
  return nock('http://attestations.fake.endpoint.example.net:80')
    .put(`/attestations.bucket/${attestation.templateName}.pdf?x-id=PutObject`)
    .reply(isFailed ? 500 : 200)
    .persist();
}

const preventStubsToBeCalledUnexpectedly = (stubs) => {
  for (const stub of stubs) {
    stub.rejects(
      new Error(
        `Unexpected call to stub "${stub.toString()}" (whether because it should not have been called OR called with wrong arguments)`,
      ),
    );
  }
};

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

function waitForStreamFinalizationToBeDone() {
  return wait(300);
}

// eslint-disable-next-line mocha/no-exports
export {
  catchErr,
  catchErrSync,
  createMaddoServer,
  createServer,
  createTempFile,
  databaseBuilder,
  datamartBuilder,
  datamartKnex,
  datawarehouseKnex,
  domainBuilder,
  EMPTY_BLANK_AND_NULL,
  expect,
  generateAuthenticatedUserRequestHeaders,
  generateIdTokenForExternalUser,
  generateInjectOptions,
  generateValidRequestAuthorizationHeaderForApplication,
  hFake,
  HttpTestServer,
  isSameBinary,
  knex,
  learningContentBuilder,
  mockAttestationStorage,
  mockAttestationStorageUpload,
  MockDate,
  mockLearningContent,
  nock,
  parseNDJSON,
  preventStubsToBeCalledUnexpectedly,
  removeTempFile,
  sinon,
  wait,
  waitForStreamFinalizationToBeDone,
};
