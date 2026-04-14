import _ from 'lodash';

import { ADMIN_COMBINED_COURSE_BLUEPRINT_ITEMS } from '../models/AdminCombinedCourseBlueprint.js';
import { CombinedCourseBlueprint } from '../models/CombinedCourseBlueprint.js';

export const createCombinedCourseBlueprint = async ({
  adminCombinedCourseBlueprint,
  combinedCourseBlueprintRepository,
  targetProfileRepository,
  moduleRepository,
  rewardRepository,
}) => {
  const targetProfileIds = adminCombinedCourseBlueprint.content
    .filter((item) => item.type === ADMIN_COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION)
    .map(({ value }) => value);
  await targetProfileRepository.findByIds({ ids: targetProfileIds });

  const moduleShortIds = adminCombinedCourseBlueprint.content
    .filter((item) => item.type === ADMIN_COMBINED_COURSE_BLUEPRINT_ITEMS.MODULE)
    .map(({ value }) => value);
  const modules = await moduleRepository.getByShortIds({ moduleShortIds });
  const modulesByShortId = _.groupBy(modules, 'shortId');

  const reward = adminCombinedCourseBlueprint.attestationKey
    ? await rewardRepository.getByAttestationKey({ key: adminCombinedCourseBlueprint.attestationKey })
    : null;

  return combinedCourseBlueprintRepository.save({
    combinedCourseBlueprint: CombinedCourseBlueprint.buildWithQuest({
      adminCombinedCourseBlueprint,
      modulesByShortId,
      rewardId: reward?.id,
      rewardType: reward?.type,
    }),
  });
};
