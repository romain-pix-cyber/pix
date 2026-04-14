export const CORE_CERTIFICATE_LEVELS = {
  preBeginner: 'LEVEL_PRE_BEGINNER',
  beginner1: 'LEVEL_BEGINNER_1',
  beginner2: 'LEVEL_BEGINNER_2',
  independent3: 'LEVEL_INDEPENDENT_3',
  independent4: 'LEVEL_INDEPENDENT_4',
  advanced5: 'LEVEL_ADVANCED_5',
  advanced6: 'LEVEL_ADVANCED_6',
  expert7: 'LEVEL_EXPERT_7',
  expert8: 'LEVEL_EXPERT_8',
};

export const CORE_MESH_CONFIGURATION = new Map([
  [CORE_CERTIFICATE_LEVELS.preBeginner, { weight: 64, coefficient: 0 }],
  [CORE_CERTIFICATE_LEVELS.beginner1, { weight: 64, coefficient: 1 }],
  [CORE_CERTIFICATE_LEVELS.beginner2, { weight: 128, coefficient: 1 }],
  [CORE_CERTIFICATE_LEVELS.independent3, { weight: 128, coefficient: 2 }],
  [CORE_CERTIFICATE_LEVELS.independent4, { weight: 128, coefficient: 3 }],
  [CORE_CERTIFICATE_LEVELS.advanced5, { weight: 128, coefficient: 4 }],
  [CORE_CERTIFICATE_LEVELS.advanced6, { weight: 128, coefficient: 5 }],
  [CORE_CERTIFICATE_LEVELS.expert7, { weight: 128, coefficient: 6 }],
  [CORE_CERTIFICATE_LEVELS.expert8, { weight: 128, coefficient: 7 }],
]);

export const PIX_PLUS_EDU_EXTERNAL_LEVELS = {
  ADVANCED: 'ADVANCED',
  EXPERT: 'EXPERT',
};
