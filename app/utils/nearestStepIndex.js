// app/utils/nearestStepIndex.js
export function nearestStepIndex(arr, value) {
  let bestI = 0, bestDiff = Infinity;
  for (let i = 0; i < arr.length; i++) {
    const diff = Math.abs(arr[i] - value);
    if (diff < bestDiff) { bestDiff = diff; bestI = i; }
  }
  return bestI;
}
