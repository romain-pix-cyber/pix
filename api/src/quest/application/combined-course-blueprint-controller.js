import { usecases } from '../domain/usecases/index.js';
import * as adminCombinedCourseBlueprintSerializer from '../infrastructure/serializers/admin-combined-course-blueprint-serializer.js';
import * as combinedCourseBlueprintOrganizationSerializer from '../infrastructure/serializers/combined-course-blueprint-organization-serializer.js';
import * as combinedCourseBlueprintSerializer from '../infrastructure/serializers/combined-course-blueprint-serializer.js';

const findAll = async (request, _, dependencies = { combinedCourseBlueprintSerializer }) => {
  const combinedCourseBlueprints = await usecases.findCombinedCourseBlueprints();
  return dependencies.combinedCourseBlueprintSerializer.serialize(combinedCourseBlueprints);
};

const save = async (request, h, dependencies = { adminCombinedCourseBlueprintSerializer }) => {
  const adminCombinedCourseBlueprint = await dependencies.adminCombinedCourseBlueprintSerializer.deserialize(
    request.payload,
  );
  const combinedCourseBlueprint = await usecases.createCombinedCourseBlueprint({
    adminCombinedCourseBlueprint,
  });
  return h.response(dependencies.adminCombinedCourseBlueprintSerializer.serialize(combinedCourseBlueprint)).created();
};

const getById = async (request, _, dependencies = { adminCombinedCourseBlueprintSerializer }) => {
  const combinedCourseBlueprint = await usecases.getCombinedCourseBlueprintById({ id: request.params.blueprintId });
  return dependencies.adminCombinedCourseBlueprintSerializer.serialize(combinedCourseBlueprint);
};

const detachOrganization = async (request, h) => {
  await usecases.detachOrganizationFromCombinedCourseBlueprint({
    combinedCourseBlueprintId: request.params.blueprintId,
    organizationId: request.params.organizationId,
  });
  return h.response().code(204);
};

const attachOrganizations = async (request, h, dependencies = { combinedCourseBlueprintOrganizationSerializer }) => {
  const combinedCourseBlueprintId = request.params.blueprintId;
  const results = await usecases.attachOrganizationsToCombinedCourseBlueprint({
    combinedCourseBlueprintId,
    organizationIds: request.payload['organization-ids'],
  });
  return h
    .response(
      dependencies.combinedCourseBlueprintOrganizationSerializer.serialize({ ...results, combinedCourseBlueprintId }),
    )
    .code(201);
};

const findByOrganizationId = async (request, _, dependencies = { combinedCourseBlueprintSerializer }) => {
  const combinedCourseBlueprint = await usecases.findByOrganizationId({
    organizationId: request.params.organizationId,
  });
  return dependencies.combinedCourseBlueprintSerializer.serialize(combinedCourseBlueprint);
};

const combinedCourseBlueprintController = {
  findAll,
  save,
  getById,
  detachOrganization,
  attachOrganizations,
  findByOrganizationId,
};

export { combinedCourseBlueprintController };
