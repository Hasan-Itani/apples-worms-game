"use client";

export default function Jackpot({ gridSize = 4, worms = 2, bet = 5 }) {
  const totalBoxes = gridSize * gridSize;
  const apples = totalBoxes - worms;

  const jackpotValues = Array.from({ length: apples }, (_, i) => {
    return `€${(bet * (i + 2)).toFixed(2)}`;
  });

  const balanceValues = Array.from({ length: apples }, () => "€0.00");

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xl">
      <div className="text-center">
        <h2 className="text-lg font-bold tracking-widest">JACKPOT</h2>
        <div className="bg-red-700 text-white font-bold px-4 py-1 rounded">
          NOT AVAILABLE
        </div>
      </div>

      <div
        className="grid bg-orange-900 p-2 rounded-lg gap-2 w-full"
        style={{ gridTemplateColumns: `repeat(${apples}, 1fr)` }}
      >
        {jackpotValues.map((amount, i) => (
          <div
            key={i}
            className="bg-black text-white px-3 py-2 rounded-md font-bold text-center"
          >
            {amount}
          </div>
        ))}
      </div>

      <div
        className="grid bg-green-700 p-2 rounded-lg gap-2 w-full"
        style={{ gridTemplateColumns: `repeat(${apples}, 1fr)` }}
      >
        {balanceValues.map((amount, i) => (
          <div
            key={i}
            className="bg-black text-green-400 px-3 py-2 rounded-md font-bold text-center"
          >
            {amount}
          </div>
        ))}
      </div>
    </div>
  );
}
