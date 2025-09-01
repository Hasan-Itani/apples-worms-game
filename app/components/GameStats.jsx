"use client";

export default function GameStats({
  applesRemaining,
  chanceOfWorm,
  chanceOfApple,
  openedTiles,
  totalBoxes,
}) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 shadow-sm space-y-1">
      <p className="font-medium">
        🍎 Apples Remaining:{" "}
        <span className="font-bold">{applesRemaining}</span>
      </p>
      <p className="font-medium">
        🪱 Worm Risk:{" "}
        <span className="text-red-600 font-bold">{chanceOfWorm}%</span>
      </p>
      <p className="font-medium">
        📦 Opened Tiles:{" "}
        <span className="font-bold">
          {openedTiles} / {totalBoxes}
        </span>
      </p>
      <p className="font-medium">
        🎯 Chance of Apple:{" "}
        <span className="text-green-600 font-bold">{chanceOfApple}%</span>
      </p>
    </div>
  );
}
