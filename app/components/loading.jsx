"use client";
import Image from "next/image";
import { useState } from "react";

export default function Loading({ onStart }) {
  const [hovered, setHovered] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center">
      {/* Фон */}
      <Image
        src="/landscape_background.jpg"
        alt="Background"
        fill
        priority
        className="object-cover z-0"
      />

      {/* Контент */}
      <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-center">
        {/* Логотип */}
        <div className="flex-1 flex justify-center items-center">
          <Image
            src="/logo_main.png"
            alt="Logo"
            width={800}
            height={600}
            className="w-[80%] max-w-[800px] h-auto"
            priority
          />
        </div>

        {/* Кнопка Play */}
        <div className="flex flex-col items-center md:items-end md:justify-center md:w-[300px] md:mr-10 mr-20">
          <button
            onClick={onStart}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="flex items-center justify-center w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full bg-no-repeat bg-center bg-contain"
            style={{
              backgroundImage: `url(${
                hovered ? "/bg_hovered.png" : "/bg_pressed.png"
              })`,
            }}
          >
            <Image
              src="/start_icon.png"
              alt="Start"
              width={50}
              height={50}
              className="z-20"
            />
          </button>

          {/* Чекбокс */}
          <label className="flex items-center gap-2 mt-4 text-white font-bold text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={() => setDontShow(!dontShow)}
              className="w-5 h-5"
            />
            DON&apos;T SHOW NEXT TIME
          </label>
        </div>
      </div>
    </div>
  );
}
