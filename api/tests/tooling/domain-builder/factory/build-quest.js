import { REWARD_TYPES } from '../../../../src/quest/domain/constants.js';
import { Quest } from '../../../../src/quest/domain/models/Quest.js';

function buildQuest({
  id = 1,
  createdAt = new Date(),
  updatedAt = new Date(),
  rewardId = 1,
  rewardType = REWARD_TYPES.ATTESTATION,
  eligibilityRequirements = [],
  successRequirements = [],
} = {}) {
  return new Quest({
    id,
    createdAt,
    updatedAt,
    rewardId,
    rewardType,
    eligibilityRequirements,
    successRequirements,
  });
}

export { buildQuest };
