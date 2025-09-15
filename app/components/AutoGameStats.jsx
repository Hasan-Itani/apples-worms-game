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
    "w-8 h-8 flex items-center justify-center rounded-lg text-xl font-bold text-white " +
    "bg-[url('/inc-dec-dark-button.png')] bg-cover bg-center " +
    "hover:bg-[url('/inc-dec-button.png')] active:scale-95 transition " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const adjust = (setter, dir) => setter((p) => Math.max(0, p + dir * 5));

  return (
    <div className="w-full p-4 bg-[url('/stats.png')] bg-cover bg-center rounded-2xl shadow-md flex flex-col gap-4">
      {/* After Win */}
      <div className="flex items-center justify-between">
        <span className="text-base text-white font-bold">
          After Win (+%):
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAfterWin(0)}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-400 rounded text-sm font-semibold text-white active:scale-95"
          >
            Reset
          </button>
          <button onClick={() => adjust(setAfterWin, -1)} className={buttonClass}>
            −
          </button>
          <span className="w-12 text-center font-bold text-lg text-white">
            {afterWin}%
          </span>
          <button onClick={() => adjust(setAfterWin, 1)} className={buttonClass}>
            +
          </button>
        </div>
      </div>

      {/* After Loss */}
      <div className="flex items-center justify-between">
        <span className="text-base text-white font-bold">
          After Loss (+%):
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAfterLoss(0)}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-400 rounded text-sm font-semibold text-white active:scale-95"
          >
            Reset
          </button>
          <button onClick={() => adjust(setAfterLoss, -1)} className={buttonClass}>
            −
          </button>
          <span className="w-12 text-center font-bold text-lg text-white">
            {afterLoss}%
          </span>
          <button onClick={() => adjust(setAfterLoss, 1)} className={buttonClass}>
            +
          </button>
        </div>
      </div>

      {/* Stop Toggles */}
      <div className="flex items-center justify-between">
        <span className="text-base text-white font-bold">Stop at Win:</span>
        <button
          onClick={() => setStopOnWin((s) => !s)}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            stopOnWin
              ? "bg-green-500 text-white shadow"
              : "bg-gray-500 hover:bg-gray-600 text-white"
          }`}
        >
          {stopOnWin ? "ON" : "OFF"}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-base text-white font-bold">Stop at Loss:</span>
        <button
          onClick={() => setStopOnLoss((s) => !s)}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            stopOnLoss
              ? "bg-red-500 text-white shadow"
              : "bg-gray-500 hover:bg-gray-600 text-white"
          }`}
        >
          {stopOnLoss ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}
