"use client";

export default function AutoGameStats({
  afterWin,
  setAfterWin,
  afterLoss,
  setAfterLoss,
  stopOnWin,
  setStopOnWin,
  stopOnLoss,
  setStopOnLoss,
}) {
  const adjust = (setter, dir) => setter((p) => p + dir * 5);

  return (
    <div className="p-4 border rounded-lg bg-gray-50 shadow-sm space-y-4">
      {/* After Win */}
      <div className="flex items-center justify-between">
        <span className="font-medium">After Win:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAfterWin(0)}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Reset
          </button>
          <button
            onClick={() => adjust(setAfterWin, -1)}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            -
          </button>
          <span className="font-bold">{afterWin}</span>
          <button
            onClick={() => adjust(setAfterWin, 1)}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            +
          </button>
        </div>
      </div>

      {/* After Loss */}
      <div className="flex items-center justify-between">
        <span className="font-medium">After Loss:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAfterLoss(0)}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Reset
          </button>
          <button
            onClick={() => adjust(setAfterLoss, -1)}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            -
          </button>
          <span className="font-bold">{afterLoss}</span>
          <button
            onClick={() => adjust(setAfterLoss, 1)}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            +
          </button>
        </div>
      </div>

      {/* Stop Toggles */}
      <div className="flex items-center justify-between">
        <span>Stop at Any Win:</span>
        <button
          onClick={() => setStopOnWin((s) => !s)}
          className={`px-3 py-1 rounded ${
            stopOnWin ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
        >
          {stopOnWin ? "ON" : "OFF"}
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span>Stop at Any Loss:</span>
        <button
          onClick={() => setStopOnLoss((s) => !s)}
          className={`px-3 py-1 rounded ${
            stopOnLoss ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
        >
          {stopOnLoss ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}