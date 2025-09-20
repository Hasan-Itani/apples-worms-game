// app/utils/nearestStepIndex.js

/**
 * Returns the index of the element in `arr` that is numerically closest to `value`.
 *
 * @param {number[]} arr - Array of numeric steps to compare against.
 * @param {number} value - Target value to find the nearest step for.
 * @returns {number} Index of the closest element in `arr`.
 *
 * Example:
 * nearestStepIndex([0, 10, 20, 30], 13) → 1 (closest is 10)
 */
export function nearestStepIndex(arr, value) {
  let bestI = 0;
  let bestDiff = Infinity;

  for (let i = 0; i < arr.length; i++) {
    const diff = Math.abs(arr[i] - value);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestI = i;
    }
  }

  return bestI;
}
