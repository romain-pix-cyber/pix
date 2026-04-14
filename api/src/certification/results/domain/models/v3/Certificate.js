/**
 * @typedef {import ('../../read-models/CertifiedBadge.js').CertifiedBadge} CertifiedBadge
 */
import { MAX_REACHABLE_SCORE } from '../../../../../shared/domain/constants.js';
import { CORE_CERTIFICATE_LEVELS } from '../../../../shared/domain/constants/mesh-configuration.js';
import { GlobalCertificationLevel } from './GlobalCertificationLevel.js';

export class Certificate {
  /**
   * @param {object} props
   * @param {number} props.id - certification course id
   * @param {string} props.firstName
   * @param {string} props.lastName
   * @param {Date} props.birthdate
   * @param {string} props.birthplace
   * @param {string} props.certificationCenter - center name
   * @param {string} props.pixScore
   * @param {GlobalCertificationLevel} props.[globalLevel] - auto calculated
   * @param {string} props.verificationCode
   * @param {Array<ResultCompetenceTree>} props.resultCompetenceTree
   * @param {AlgorithmEngineVersion} props.algorithmEngineVersion
   * @param {Date} props.certificationDate - date of certification
   * @param {CertifiedBadge} props.acquiredComplementaryCertification
   */
  constructor({
    id,
    firstName,
    lastName,
    birthdate,
    birthplace,
    certificationCenter,
    deliveredAt,
    pixScore,
    reachedMeshIndex,
    verificationCode,
    resultCompetenceTree,
    algorithmEngineVersion,
    certificationDate,
    certificationFramework,
    acquiredComplementaryCertification,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = birthdate;
    this.birthplace = birthplace;
    this.deliveredAt = deliveredAt;
    this.certificationCenter = certificationCenter;
    this.pixScore = pixScore;
    this.globalLevel = this.#findLevel(reachedMeshIndex, certificationFramework);
    this.verificationCode = verificationCode;
    this.maxReachableScore = MAX_REACHABLE_SCORE;
    this.resultCompetenceTree = this.globalLevel?.meshLevel && this.pixScore ? resultCompetenceTree : null;
    this.algorithmEngineVersion = algorithmEngineVersion;
    this.certificationDate = certificationDate;
    this.acquiredComplementaryCertification = acquiredComplementaryCertification;
    this.certificationFramework = certificationFramework;
  }

  #findLevel(reachedMeshIndex, certificationFramework) {
    const globalCertificationLevel = new GlobalCertificationLevel({ reachedMeshIndex, certificationFramework });

    return globalCertificationLevel.meshLevel === CORE_CERTIFICATE_LEVELS.preBeginner ? null : globalCertificationLevel;
  }
}
