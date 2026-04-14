// TODO: bounded context violation
import { CORE_MESH_CONFIGURATION } from '../../../shared/domain/constants/mesh-configuration.js';
import { findIntervalIndexFromScore } from '../../../shared/domain/services/mesh-service.js';
import { Intervals } from './Intervals.js';
import { ScoringAndCapacitySimulatorReport } from './ScoringAndCapacitySimulatorReport.js';

// TODO change CapacitySimulator model to a service
export class CapacitySimulator {
  static compute({ certificationScoringIntervals, competencesForScoring, score, maxReachableLevel }) {
    const scoringIntervals = new Intervals({ intervals: certificationScoringIntervals });

    const meshes = Array.from(CORE_MESH_CONFIGURATION.values());
    const intervalIndex = findIntervalIndexFromScore({ score, maxReachableLevel });

    const intervalMaxValue = scoringIntervals.max(intervalIndex);
    const intervalMinValue = scoringIntervals.min(intervalIndex);

    const intervalWeight = meshes[intervalIndex].weight;
    const intervalCoefficient = meshes[intervalIndex].coefficient;

    const capacity =
      (score / intervalWeight - intervalCoefficient) * (intervalMaxValue - intervalMinValue) + intervalMinValue;

    const competences = competencesForScoring.map(({ intervals, competenceCode }) => {
      const competenceIntervals = new Intervals({ intervals });
      return {
        competenceCode,
        level: intervals[competenceIntervals.findIntervalIndexFromCapacity(capacity)].competenceLevel,
      };
    });

    return new ScoringAndCapacitySimulatorReport({
      score,
      capacity,
      competences,
    });
  }
}
