const updateCampaignDetails = async function ({
  campaignId,
  name,
  title,
  customLandingPageText,
  customResultPageText,
  customResultPageButtonText,
  customResultPageButtonUrl,
  multipleSendings,
  isForAbsoluteNovice,
  isAuthorizedToUpdateIsForAbsoluteNovice,
  campaignAdministrationRepository,
}) {
  const campaign = await campaignAdministrationRepository.get(campaignId);

  campaign.updateFields(
    {
      name,
      title,
      customLandingPageText,
      customResultPageText,
      customResultPageButtonText,
      customResultPageButtonUrl,
      multipleSendings,
      isForAbsoluteNovice,
    },
    isAuthorizedToUpdateIsForAbsoluteNovice,
  );

  return campaignAdministrationRepository.update(campaign);
};

export { updateCampaignDetails };
