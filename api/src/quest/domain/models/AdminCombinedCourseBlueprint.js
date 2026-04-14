import Joi from 'joi';

import { REQUIREMENT_TYPES } from './Quest.js';

export class AdminCombinedCourseBlueprint {
  constructor({
    id,
    name,
    internalName,
    description,
    illustration,
    content,
    attestationKey,
    createdAt,
    updatedAt,
    organizationIds = [],
  }) {
    this.id = id;
    this.name = name;
    this.internalName = internalName;
    this.description = description;
    this.illustration = illustration;
    this.organizationIds = organizationIds;
    this.content = content;
    this.attestationKey = attestationKey;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static buildContentItems(items) {
    const data = items.map(({ moduleShortId, targetProfileId }) => {
      return moduleShortId
        ? { type: ADMIN_COMBINED_COURSE_BLUEPRINT_ITEMS.MODULE, value: moduleShortId }
        : { type: ADMIN_COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION, value: targetProfileId };
    });
    return Joi.attempt(data, contentSchema);
  }

  static buildFromBlueprint({ combinedCourseBlueprint, modulesById, attestationKey }) {
    const items = combinedCourseBlueprint.quest.successRequirements.map((requirement) => {
      if (requirement.requirement_type === REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS) {
        return { targetProfileId: requirement.data.targetProfileId.data };
      } else if (requirement.requirement_type === REQUIREMENT_TYPES.OBJECT.PASSAGES) {
        const module = modulesById[requirement.data.moduleId.data];
        return { moduleShortId: module?.[0].shortId };
      }
    });

    const content = AdminCombinedCourseBlueprint.buildContentItems(items);
    return new AdminCombinedCourseBlueprint({ ...combinedCourseBlueprint, content, attestationKey });
  }
}

export const ADMIN_COMBINED_COURSE_BLUEPRINT_ITEMS = {
  MODULE: 'module',
  EVALUATION: 'evaluation',
};

export const contentSchema = Joi.array()
  .items(
    Joi.object({
      type: Joi.string()
        .valid(ADMIN_COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION, ADMIN_COMBINED_COURSE_BLUEPRINT_ITEMS.MODULE)
        .required(),
      value: Joi.alternatives()
        .conditional('type', {
          switch: [
            {
              is: ADMIN_COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION,
              then: Joi.number().integer(),
            },
            {
              is: ADMIN_COMBINED_COURSE_BLUEPRINT_ITEMS.MODULE,
              then: Joi.string(),
            },
          ],
        })
        .required(),
    }),
  )
  .required()
  .strict();
