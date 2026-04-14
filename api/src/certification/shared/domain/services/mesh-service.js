import { CORE_MESH_CONFIGURATION } from '../constants/mesh-configuration.js';

/**
 * @returns {{key: string, value: Mesh}}
 */
export function findMeshFromScore({ score, maxReachableLevel }) {
  const configuration = CORE_MESH_CONFIGURATION.entries();
  let currentMesh = configuration.next();
  let cumulativeSumOfWeights = currentMesh.value[1].weight;
  let currentScoringInterval = 0;

  while (hasNextScoringInterval(score, cumulativeSumOfWeights, currentScoringInterval, maxReachableLevel)) {
    currentScoringInterval++;
    currentMesh = configuration.next();
    cumulativeSumOfWeights += currentMesh.value[1].weight;
  }

  return { key: currentMesh.value[0], value: currentMesh.value[1] };
}

/**
 * @deprecated please use {@link MeshConfiguration#findMeshFromScore}
 */
export function findIntervalIndexFromScore({ score, maxReachableLevel }) {
  const configuration = CORE_MESH_CONFIGURATION.values();
  let cumulativeSumOfWeights = configuration.next().value.weight;
  let currentScoringInterval = 0;

  while (hasNextScoringInterval(score, cumulativeSumOfWeights, currentScoringInterval, maxReachableLevel)) {
    currentScoringInterval++;
    cumulativeSumOfWeights += configuration.next().value.weight;
  }

  return currentScoringInterval;
}

function hasNextScoringInterval(score, nextIntervalMinimumScore, currentInterval, maxReachableLevel) {
  return score >= nextIntervalMinimumScore && currentInterval < maxReachableLevel;
}
