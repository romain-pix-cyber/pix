export async function updateEduV3ExternalJuryResult({
  certificationCourseId,
  eduV3ExternalJuryResult,
  juryCertificationRepository,
}) {
  const juryCertification = await juryCertificationRepository.get({ certificationCourseId });
  juryCertification.updateEduV3ExternalJuryResult(eduV3ExternalJuryResult);

  await juryCertificationRepository.update(juryCertification);

  return juryCertification;
}
