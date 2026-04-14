import { setTimeout } from 'node:timers/promises';

import { knex } from '../../db/knex-database-connection.js';
import { Script } from '../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../src/shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../src/shared/domain/DomainTransaction.js';
import { batchUpdate } from '../../src/shared/infrastructure/utils/knex-utils.js';

export class FillLastAnswerAtColumn extends Script {
  constructor() {
    super({
      description: 'Retro-fill the "lastAnswerAt" column in "certification-courses" table',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: true,
        },
        throttleDelay: {
          type: 'number',
          describe: 'The throttle delay',
          default: 200,
        },
        chunkSize: {
          type: 'number',
          describe: 'Number of certifications handled at the same time',
          default: 2000,
        },
        startId: {
          type: 'number',
          describe: 'ID of the certification on which we start the process',
          default: 1,
        },
      },
    });
  }

  async handle({ logger, options }) {
    const { dryRun, chunkSize, throttleDelay, startId } = options;
    logger.info(`Script execution started with options ${JSON.stringify(options)}`);
    let cntTotalCertificationsHandled = 0;
    let currentStartId = startId;
    const [{ max }] = await knex('certification-courses').max('id');
    let certificationDataToProcess = await findNextCertificationsToProcess(currentStartId, chunkSize);
    while (currentStartId <= max) {
      try {
        await DomainTransaction.execute(async () => {
          if (certificationDataToProcess.length > 0) {
            await batchUpdate({
              schema: 'public',
              tableName: 'certification-courses',
              primaryKeyName: 'id',
              rows: certificationDataToProcess,
              chunkSize,
            });
            if (dryRun) {
              throw new Error('DRYRUN');
            }
          }
        });
      } catch (error) {
        if (!error?.message?.includes('DRYRUN')) {
          logger.error(`An error happened in batch ${currentStartId} - ${currentStartId + chunkSize - 1} : ${error}`);
          logger.info(
            `Script interrupted. Number of certifications processed so far : ${cntTotalCertificationsHandled}`,
          );
          throw error;
        }
      }
      logger.info(`Batch from ${currentStartId} to ${currentStartId + chunkSize - 1} done`);
      cntTotalCertificationsHandled += certificationDataToProcess.length;
      currentStartId += chunkSize;
      certificationDataToProcess = await findNextCertificationsToProcess(currentStartId, chunkSize);
      await setTimeout(throttleDelay);
    }
    logger.info(`Script finished. Number of certifications processed : ${cntTotalCertificationsHandled}, youpi`);
  }
}

async function findNextCertificationsToProcess(startId, chunkSize) {
  const results = await knex.raw(
    `
      SELECT
        cc.id,
        latest_ans."lastAnswerAt"
      FROM "certification-courses" AS cc
      CROSS JOIN LATERAL (
        SELECT ans."createdAt" AS "lastAnswerAt"
        FROM "assessments" AS ass
        JOIN "answers" AS ans ON ans."assessmentId" = ass.id
        WHERE ass."certificationCourseId" = cc.id
        ORDER BY ans."createdAt" DESC
        LIMIT 1
      ) AS latest_ans
      WHERE cc.id >= ? AND cc.id < ?
      ORDER BY cc.id ASC
    `,
    [startId, startId + chunkSize],
  );
  return results.rows;
}

await ScriptRunner.execute(import.meta.url, FillLastAnswerAtColumn);
