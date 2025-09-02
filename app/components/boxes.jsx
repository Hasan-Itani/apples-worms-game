import { useBoxesGame } from "../hooks/useBoxesGame";
import Jackpot from "./JackpotBar";
import Image from "next/image";

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
            className="relative flex items-center justify-center cursor-pointer"
          >
            <Image
              src="/box.png"
              alt="Box"
              fill
              className="object-contain select-none pointer-events-none"
            />

            {cell !== "❓" && (
              <div className="absolute w-3/4 h-3/4">
                {cell === "🍎" && (
                  <Image
                    src="/apple.png"
                    alt="Apple"
                    fill
                    className="object-contain"
                  />
                )}
                {cell === "💣" && (
                  <Image
                    src="/worm.png"
                    alt="Worm"
                    fill
                    className="object-contain"
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}