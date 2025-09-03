"use client";

export default function GameStats({
  applesRemaining,
  chanceOfWorm,
  chanceOfApple,
  openedTiles,
  totalBoxes,
}) {
  return (
    <div className="w-full h-40 p-3 border rounded-lg bg-gradient-to-b from-slate-100 to-slate-200 shadow-md flex flex-col justify-between">
      <p className="text-xs text-gray-600 font-medium">
        🍎 Apples Remaining:{" "}
        <span className="font-bold text-slate-800">{applesRemaining}</span>
      </p>
      <p className="text-xs text-gray-600 font-medium">
        🪱 Worm Risk:{" "}
        <span className="text-red-600 font-bold">{chanceOfWorm}%</span>
      </p>
      <p className="text-xs text-gray-600 font-medium">
        📦 Opened Tiles:{" "}
        <span className="font-bold text-slate-800">
          {openedTiles} / {totalBoxes}
        </span>
      </p>
      <p className="text-xs text-gray-600 font-medium">
        🎯 Chance of Apple:{" "}
        <span className="text-green-600 font-bold">{chanceOfApple}%</span>
      </p>
    </div>
  );
}
