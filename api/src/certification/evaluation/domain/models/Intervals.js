export class Intervals {
  constructor({ intervals }) {
    this.intervals = intervals;
  }

  length() {
    return this.intervals.length;
  }

  min(intervalIndex) {
    return this.intervals[intervalIndex].bounds.min;
  }

  max(intervalIndex) {
    return this.intervals[intervalIndex].bounds.max;
  }

  intervalWidth(intervalIndex) {
    return this.intervals[intervalIndex].bounds.max - this.intervals[intervalIndex].bounds.min;
  }

  toIntervalMax(intervalIndex, capacity) {
    return capacity - this.intervals[intervalIndex].bounds.max;
  }

  findIntervalIndexFromCapacity(capacity) {
    if (capacity < this.intervals[0].bounds.min) {
      return null;
    }

    for (const [index, { bounds }] of this.intervals.entries()) {
      if (this._isCapacityInInterval(capacity, bounds)) {
        return index;
      }
    }

    return this.intervals.length - 1;
  }

  isCapacityAboveMaximum(capacity) {
    return capacity >= this.intervals.at(-1).bounds.max;
  }

  _isCapacityInInterval(capacity, bounds) {
    return capacity >= bounds.min && capacity < bounds.max;
  }
}
