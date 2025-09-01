"use client";

export default function GameStats({
  applesRemaining,
  chanceOfWorm,
  openedTiles,
  chanceOfApple,
  totalBoxes,
}) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 shadow-sm space-y-1">
      <p className="font-medium">
        🍎 Apples Remaining:{" "}
        <span className="font-bold">{String(applesRemaining ?? 0)}</span>
      </p>
      <p className="font-medium">
        🪱 Worm Risk:{" "}
        <span className="text-red-600 font-bold">
          {String(chanceOfWorm ?? 0)}%
        </span>
      </p>
      <p className="font-medium">
        📦 Opened Tiles:{" "}
        <span className="font-bold">{String(openedTiles ?? 0)}/{totalBoxes}</span>
      </p>
      <p className="font-medium">
        🎯 Chance of Apple:{" "}
        <span className="text-green-600 font-bold">
          {String(chanceOfApple ?? 0)}%
        </span>
      </p>
    </div>
  );
}
