import hashInt from 'hash-int';

import { fallbackChallengeLocales } from '../../../shared/domain/services/locale-service.js';

const NON_EXISTING_ITEM = null;
const VALIDATED_STATUS = 'validé';

const pickChallenge = ({ skills, randomSeed, locale }) => {
  if (skills.length === 0) {
    return NON_EXISTING_ITEM;
  }
  const keyForSkill = Math.abs(hashInt(randomSeed));
  const keyForChallenge = Math.abs(hashInt(randomSeed + 1));
  const chosenSkill = skills[keyForSkill % skills.length];

  return pickLocaleChallengeAtIndex(chosenSkill.challenges, locale, keyForChallenge);
};

export const pickChallengeService = { pickChallenge };

const pickLocaleChallengeAtIndex = (challenges, locale, index) => {
  const locales = fallbackChallengeLocales(locale);
  const localeChallenges = challenges.filter((challenge) =>
    challenge.locales.some((locale) => locales.includes(locale)),
  );
  const possibleChallenges = findPreferablyValidatedChallengesWithLocale(localeChallenges, locale);
  return possibleChallenges.length ? pickChallengeAtIndex(possibleChallenges, index) : null;
};

const pickChallengeAtIndex = (challenges, index) => challenges[index % challenges.length];

const findPreferablyValidatedChallengesWithLocale = (localeChallenges, locale) => {
  const validatedChallenges = localeChallenges.filter((challenge) => challenge.status === VALIDATED_STATUS);
  const preferablyValidatedChallenges = validatedChallenges.length > 0 ? validatedChallenges : localeChallenges;
  const challengesWithGivenLocale = preferablyValidatedChallenges.filter((challenge) => {
    challenge.locales.includes(locale);
  });
  return challengesWithGivenLocale.length > 0 ? challengesWithGivenLocale : preferablyValidatedChallenges;
};
