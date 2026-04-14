export function updateEduV3ExternalJuryResult(schema, request) {
  const certificationId = request.params.id;
  const body = JSON.parse(request.requestBody);
  const juryResult = body.data.attributes['edu-v3-external-jury-result'];
  const certification = schema.certifications.find(certificationId);
  certification.update({
    reachedResultKey: `EDU_1ER_DEGRE.${juryResult}`,
  });

  return certification;
}
