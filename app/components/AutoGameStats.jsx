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
  const buttonClass =
    "w-6 h-6 flex items-center justify-center rounded-lg text-lg font-bold text-white " +
    "bg-[url('/inc-dec-dark-button.png')] bg-cover bg-center " +
    "hover:bg-[url('/inc-dec-button.png')] active:scale-95 transition " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const adjust = (setter, dir) => setter((p) => p + dir * 5);

  return (
    <div className="w-full h-40 p-3 border rounded-lg bg-gradient-to-b from-blue-400 to-blue-200 shadow-md flex flex-col justify-between">
      {/* After Win */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600 font-medium">After Win:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAfterWin(0)}
            className="px-2 py-0.5 bg-blue-500 hover:bg-blue-300 rounded text-xs active:scale-95"
          >
            Reset
          </button>
          <button onClick={() => adjust(setAfterWin, -1)} className={buttonClass}>
            −
          </button>
          <span className="w-8 text-center font-bold text-sm">{afterWin}</span>
          <button onClick={() => adjust(setAfterWin, 1)} className={buttonClass}>
            +
          </button>
        </div>
      </div>

      {/* After Loss */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600 font-medium">After Loss:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAfterLoss(0)}
            className="px-2 py-0.5 bg-blue-500 hover:bg-blue-400 rounded text-xs active:scale-95"
          >
            Reset
          </button>
          <button onClick={() => adjust(setAfterLoss, -1)} className={buttonClass}>
            −
          </button>
          <span className="w-8 text-center font-bold text-sm">{afterLoss}</span>
          <button onClick={() => adjust(setAfterLoss, 1)} className={buttonClass}>
            +
          </button>
        </div>
      </div>

      {/* Stop Toggles */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600 font-medium">Stop at Win:</span>
        <button
          onClick={() => setStopOnWin((s) => !s)}
          className={`px-2 py-0.5 rounded text-xs font-medium ${
            stopOnWin ? "bg-blue-500 text-white shadow" : "bg-blue-500 hover:bg-blue-400"
          }`}
        >
          {stopOnWin ? "ON" : "OFF"}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600 font-medium">Stop at Loss:</span>
        <button
          onClick={() => setStopOnLoss((s) => !s)}
          className={`px-2 py-0.5 rounded text-xs font-medium ${
            stopOnLoss ? "bg-blue-500 text-white shadow" : "bg-blue-500 hover:bg-blue-400"
          }`}
        >
          {stopOnLoss ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}
