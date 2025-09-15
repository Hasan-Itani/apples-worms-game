"use client";

export default function GameStats({
  applesRemaining,
  chanceOfWorm,
  chanceOfApple,
  openedTiles,
  totalBoxes,
}) {
  return (
    <div className="w-full p-4 bg-[url('/stats.png')] bg-cover bg-center rounded-2xl shadow-md flex flex-col gap-2">
      {/* Apples Remaining */}
      <div className="flex justify-between items-center">
        <span className="text-base text-white font-semibold">
          Apples Remaining
        </span>
        <span className="font-bold text-lg text-yellow-300">
          {applesRemaining}
        </span>
      </div>

      {/* Worm Risk */}
      <div className="flex justify-between items-center">
        <span className="text-base text-white font-semibold">Worm Risk</span>
        <span className="text-red-400 font-bold text-lg">
          {chanceOfWorm}%
        </span>
      </div>

      {/* Opened Tiles */}
      <div className="flex justify-between items-center">
        <span className="text-base text-white font-semibold">
          Opened Tiles
        </span>
        <span className="font-bold text-lg text-blue-300">
          {openedTiles}/{totalBoxes}
        </span>
      </div>

      {/* Chance of Apple */}
      <div className="flex justify-between items-center">
        <span className="text-base text-white font-semibold">
          Chance of Apple on Next Pick
        </span>
        <span className="text-green-400 font-bold text-lg">
          {chanceOfApple}%
        </span>
      </div>
    </div>
  );
}
