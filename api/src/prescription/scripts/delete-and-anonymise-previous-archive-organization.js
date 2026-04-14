import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { usecases as campaignUsecases } from '../campaign/domain/usecases/index.js';
import { usecases as learnerManagementUsecases } from '../learner-management/domain/usecases/index.js';

export class DeleteAndAnonymisePreviousOrganizationScript extends Script {
  constructor() {
    super({
      description: 'Parse Archived Organization before date to delete and anonymise their related data',
      permanent: false,
      options: {
        startArchiveDate: {
          type: 'date',
          describe: 'date to start anonymisation',
          demandOption: true,
        },
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    const engineeringUserId = process.env.ENGINEERING_USER_ID;

    await DomainTransaction.execute(async () => {
      const knexConn = DomainTransaction.getConnection();
      logger.info(
        `BEGIN: Delete and anonymise campaigns, participations... on archived organizations before ${options.startArchiveDate}`,
      );
      try {
        const organizationIds = await knexConn('organizations')
          .where('archivedAt', '<', options.startArchiveDate)
          .pluck('id');

        logger.info(`Organizations to verify ${organizationIds.length}`);

        for (const organizationId of organizationIds) {
          logger.info(`Parse organization :${organizationId}`);

          const campaignIds = await knexConn('campaigns').where({ organizationId }).pluck('id');

          if (campaignIds) {
            logger.info(`Campaigns :${campaignIds.length} to delete on Organization ${organizationId}`);
            await campaignUsecases.deleteCampaigns({
              organizationId,
              campaignIds,
              userId: engineeringUserId,
              keepPreviousDeletion: true,
              userRole: 'SUPER_ADMIN',
              client: 'SCRIPT',
            });
          }

          const organizationLearnerIds = await knexConn('organization-learners').where({ organizationId }).pluck('id');

          if (organizationLearnerIds) {
            logger.info(
              `OrganizationLearners :${organizationLearnerIds.length} to delete on Organization ${organizationId}`,
            );
            await learnerManagementUsecases.deleteOrganizationLearners({
              organizationLearnerIds,
              userId: engineeringUserId,
              organizationId,
              userRole: 'SUPER_ADMIN',
              client: 'SCRIPT',
              keepPreviousDeletion: true,
            });
          }
        }

        if (options.dryRun) {
          await knexConn.rollback();
          logger.info(`ROLLBACK: Delete and anonymise campaigns, participations... on archived organizations before`);
          logger.info(`--dryRun true to persist changes`);
          return;
        }

        logger.info(`COMMIT: Delete and anonymise campaigns, participations... on archived organizations before`);
      } catch (error) {
        await knexConn.rollback();
        throw error;
      }
    });
  }
}

await ScriptRunner.execute(import.meta.url, DeleteAndAnonymisePreviousOrganizationScript);
