import dayjs from 'dayjs';

class MonitoredJobHandler {
  constructor(metrics, handler, logger) {
    this.metrics = metrics;
    this.handler = handler;
    this.logger = logger;
  }

  async handle({ data, jobName, jobId }) {
    let result;
    const startedAt = dayjs();
    try {
      this.logJobStarting({ data, jobName, jobId });
      result = await this.handler.handle({ data, jobId });
      const duration = dayjs().diff(startedAt);
      this.metrics.addMetricPoint({
        type: 'histogram',
        name: 'captain.job.duration',
        tags: ['method:pg-boss', `jobName:${jobName}`, `statusCode:SUCCESS`],
        value: duration,
      });
    } catch (error) {
      const duration = dayjs().diff(startedAt);
      this.logJobFailed({ data, error, jobName, jobId });
      this.metrics.addMetricPoint({
        type: 'histogram',
        name: 'captain.job.duration',
        tags: ['method:pg-boss', `jobName:${jobName}`, `statusCode:FAILED`],
        value: duration,
      });
      throw error;
    }
    return result;
  }

  logJobStarting({ data, jobName, jobId }) {
    this.logger.info(
      {
        data,
        handlerName: jobName,
        type: 'JOB_LOG',
        message: 'Job Started',
        jobId,
      },
      'PGBOSS JOB STARTING',
    );
  }

  logJobFailed({ data, jobName, jobId, error }) {
    this.logger.error(
      {
        data,
        handlerName: jobName,
        error: error?.message ? error.message + ' (see dedicated log for more information)' : undefined,
        type: 'JOB_LOG_ERROR',
        message: 'Job failed',
        jobId,
      },
      'PGBOSS ERROR IN JOB',
    );
  }
}

export { MonitoredJobHandler };
