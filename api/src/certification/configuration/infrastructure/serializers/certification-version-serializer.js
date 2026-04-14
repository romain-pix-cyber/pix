import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export const serialize = (certificationVersion) => {
  const attributes = [
    'scope',
    'startDate',
    'expirationDate',
    'assessmentDuration',
    'globalScoringConfiguration',
    'competencesScoringConfiguration',
    'challengesConfiguration',
  ];

  return new Serializer('certification-versions', {
    attributes,
  }).serialize(certificationVersion);
};
