import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AlreadyExistingEntityError } from '../../../shared/domain/errors.js';
import * as knexUtils from '../../../shared/infrastructure/utils/knex-utils.js';
import { REWARD_TYPES } from '../../domain/constants.js';

const ATTESTATION_KEY_UNIQUE_CONSTRAINT = 'attestations_key_unique';
const DUPLICATE_ATTESTATION_KEY = 'DUPLICATE_ATTESTATION_KEY';

export const save = async ({ templateName, templateKey, templateFile, attestationStorage }) => {
  await DomainTransaction.execute(async () => {
    const knexConn = DomainTransaction.getConnection();

    try {
      await knexConn('attestations').insert({ key: templateKey, templateName });
      await attestationStorage.startUpload({ filename: `${templateName}.pdf`, readableStream: templateFile });
    } catch (error) {
      if (knexUtils.isUniqConstraintViolated(error) && error.constraint === ATTESTATION_KEY_UNIQUE_CONSTRAINT) {
        throw new AlreadyExistingEntityError(error.detail, DUPLICATE_ATTESTATION_KEY);
      }
      throw error;
    }
  });
};

export const getByRewardId = async ({ rewardId, rewardApi }) => {
  return rewardApi.getByIdAndType({ rewardId, rewardType: REWARD_TYPES.ATTESTATION });
};
