import { useBoxesGame } from "../hooks/useBoxesGame";
import Jackpot from "./JackpotBar";

export default function Boxes({ gridSize, worms, bet }) {
  const { grid, handleClick } = useBoxesGame(gridSize, worms);
  const totalBoxes = gridSize * gridSize;
  const apples = totalBoxes - worms;

  return (
    <div className="flex flex-col items-center gap-6 align-center">
      {/* Send dynamic values */}
      <Jackpot gridSize={gridSize} worms={worms} bet={bet} />

      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          width: "400px",
          height: "400px",
        }}
      >
        {grid.map((cell, index) => (
          <div
            key={index}
            onClick={() => handleClick(index)}
            className={`flex items-center justify-center border-2 border-gray-700 rounded-lg text-3xl cursor-pointer transition
              ${cell === "❓" ? "bg-gray-300 hover:bg-gray-400" : "bg-white"}`}
          >
            {cell}
          </div>
        ))}
      </div>
    </div>
  );
}
