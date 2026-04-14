import jsonapiSerializer from 'jsonapi-serializer';

import { AdminCombinedCourseBlueprint } from '../../domain/models/AdminCombinedCourseBlueprint.js';

const { Deserializer, Serializer } = jsonapiSerializer;

const serialize = function (adminCombinedCourseBlueprint) {
  return new Serializer('combined-course-blueprints', {
    attributes: [
      'name',
      'internalName',
      'description',
      'illustration',
      'content',
      'createdAt',
      'updatedAt',
      'attestationKey',
    ],
  }).serialize(adminCombinedCourseBlueprint);
};

const deserialize = async function (payload) {
  const deserializedData = await new Deserializer({
    keyForAttribute: 'camelCase',
  }).deserialize(payload);
  return new AdminCombinedCourseBlueprint(deserializedData);
};

export { deserialize, serialize };
