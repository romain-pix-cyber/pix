import { glob } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import _ from 'lodash';
import PgBoss from 'pg-boss';

import { Metrics } from '../../../monitoring/infrastructure/metrics.js';
import { config } from '../../config.js';
import { executeInContext, EXECUTORS } from '../execution-context-manager.js';
import { importNamedExportFromFile } from '../utils/import-named-exports-from-directory.js';
import { child } from '../utils/logger.js';
import { MonitoredJobHandler } from './monitoring/MonitoredJobHandler.js';
import { MonitoringJobExecutionTimeHandler } from './monitoring/MonitoringJobExecutionTimeHandler.js';

const workerDirPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const logger = child('worker', { event: 'worker' });
const metrics = new Metrics({ config });

const monitorStateIntervalSeconds = config.pgBoss.monitorStateIntervalSeconds;

export class JobClient {
  static #jobClient;

  #pgBoss = null;
  #isInitialized = false;

  async initialize({ worker, jobGroups } = { worker: false, jobGroups: [] }, pgBossFactory) {
    if (this.#isInitialized) return;

    const connectionString = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;

    if (worker) {
      this.#pgBoss = pgBossFactory
        ? pgBossFactory()
        : new PgBoss({
            connectionString,
            max: config.pgBoss.workerConnexionPoolMaxSize,
            ...(monitorStateIntervalSeconds ? { monitorStateIntervalSeconds } : {}),
            archiveFailedAfterSeconds: config.pgBoss.archiveFailedAfterSeconds,
          });

      this.#pgBoss.on('monitor-states', ({ queues, ...state }) => {
        logger.info({ event: 'pg-boss-state', name: 'global', queue: state }, 'PGBOSS MONITOR-STATES');
        _.each(queues, (queue, name) => {
          logger.info({ event: 'pg-boss-state', name, queue }, 'PGBOSS MONITOR-STATES');
        });
      });
      this.#pgBoss.on('error', (err) => {
        logger.error({ err, event: 'pg-boss-error' }, 'PGBOSS ERROR');
      });
      this.#pgBoss.on('wip', (data) => {
        logger.info({ data, event: 'pg-boss-wip' }, 'PGBOSS WIP');
      });

      await this.#pgBoss.start();
      await this.#registerJobs(jobGroups);
    } else {
      this.#pgBoss = pgBossFactory
        ? pgBossFactory()
        : new PgBoss({
            connectionString,
            max: config.pgBoss.clientConnexionPoolMaxSize,
            noSupervisor: true,
            noScheduling: true,
          });
      await this.#pgBoss.start();
    }

    this.#isInitialized = true;
  }

  #assertIsInitialized() {
    if (!this.#isInitialized) {
      throw new Error('JobClient has not been initialized before use');
    }
  }

  async #registerJobs(jobGroups) {
    const globPattern = `${workerDirPath}/src/**/application/**/*job-controller.js`;

    logger.info(`Search for job handlers in ${globPattern}`);
    const jobFiles = await Array.fromAsync(glob(globPattern, { exclude: ['**/job-controller.js'] }));
    logger.info(`${jobFiles.length} job handlers files found.`);

    let jobModules = {};
    for (const jobFile of jobFiles) {
      const fileModules = await importNamedExportFromFile(jobFile);
      jobModules = { ...jobModules, ...fileModules };
    }

    let jobRegisteredCount = 0;
    let cronJobCount = 0;
    for (const [moduleName, ModuleClass] of Object.entries(jobModules)) {
      const job = new ModuleClass();

      if (!jobGroups.includes(job.jobGroup)) continue;

      if (job.isJobEnabled) {
        logger.info(`Job "${job.jobName}" registered from module "${moduleName}."`);
        this.#registerJob(metrics, job.jobName, ModuleClass);

        if (!job.jobCron && job.legacyName) {
          logger.warn(`Temporary Job" ${job.legacyName}" registered from module "${moduleName}."`);
          this.#registerJob(metrics, job.legacyName, ModuleClass);
        }

        if (job.jobCron) {
          await this.scheduleCronJob({
            name: job.jobName,
            cron: job.jobCron,
            options: { tz: 'Europe/Paris', expireInSeconds: job.expireIn },
          });
          logger.info(`Cron for job "${job.jobName}" scheduled "${job.jobCron}"`);

          // For cronJob we need to unschedule older cron
          if (job.legacyName) {
            await this.#unscheduleCronJob(job.legacyName);
          }

          cronJobCount++;
        } else {
          jobRegisteredCount++;
        }
      } else {
        logger.warn(`Job "${job.jobName}" is disabled.`);

        // For cronJob we need to unschedule older cron
        if (job.jobCron) {
          await this.#unscheduleCronJob(job.jobName);
          logger.info(`Job CRON "${job.jobName}" is unscheduled.`);
        }
      }
    }
    logger.info(`${jobRegisteredCount} jobs registered for groups "${jobGroups}".`);
    logger.info(`${cronJobCount} cron jobs scheduled for groups "${jobGroups}".`);
  }

  #registerJob(metrics, name, handlerClass) {
    const jobHandler = new handlerClass();
    const { teamConcurrency, teamSize } = jobHandler;

    this.#pgBoss.work(name, { teamSize, teamConcurrency }, async (job) => {
      const context = this.#initLogContext(job);
      return executeInContext(
        context,
        async () => {
          const monitoredJobHandler = new MonitoredJobHandler(metrics, jobHandler, logger);
          return monitoredJobHandler.handle({ data: job.data, jobName: name, jobId: job.id });
        },
        EXECUTORS.JOB,
      );
    });

    this.#pgBoss.onComplete(name, { teamSize, teamConcurrency }, (completedJob) => {
      const context = this.#initLogContext(completedJob.data.request);
      return executeInContext(
        context,
        async () => {
          const monitoringJobHandler = new MonitoringJobExecutionTimeHandler({ logger });
          return monitoringJobHandler.handle(completedJob);
        },
        EXECUTORS.JOB,
      );
    });
  }

  #initLogContext(job) {
    const inheritedContext = job.data?.correlationContext ?? {};
    return {
      ...inheritedContext,
      jobId: job.id,
    };
  }

  async scheduleCronJob({ name, cron, data, options }) {
    return this.#pgBoss.schedule(name, cron, data, options);
  }

  async #unscheduleCronJob(name) {
    return this.#pgBoss.unschedule(name);
  }

  async send(name, payload, options) {
    this.#assertIsInitialized();
    await this.#pgBoss.send(name, payload, options);
  }

  async fetch(name, count, options) {
    this.#assertIsInitialized();
    return this.#pgBoss.fetch(name, count, options);
  }

  async getSchedules() {
    this.#assertIsInitialized();
    return this.#pgBoss.getSchedules();
  }

  async flushJobs() {
    this.#assertIsInitialized();
    await this.#pgBoss.clearStorage();
  }

  async stop(options = { graceful: false, timeout: 1000, destroy: true }) {
    this.#assertIsInitialized();
    await this.#pgBoss.stop(options);
    this.#isInitialized = false;
  }

  static get instance() {
    if (!JobClient.#jobClient) {
      JobClient.#jobClient = new JobClient();
    }
    return JobClient.#jobClient;
  }
}
