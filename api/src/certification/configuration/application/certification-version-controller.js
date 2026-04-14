import { usecases } from '../domain/usecases/index.js';
import * as certificationVersionSerializer from '../infrastructure/serializers/certification-version-serializer.js';

const getActiveVersionByScope = async function (request) {
  const scope = request.params.scope;

  const activeCertificationVersion = await usecases.getActiveVersionByScope({ scope });

  return certificationVersionSerializer.serialize(activeCertificationVersion);
};

const certificationVersionController = {
  getActiveVersionByScope,
};

export { certificationVersionController };
