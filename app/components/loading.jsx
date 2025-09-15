"use client";
import Image from "next/image";
import { useState } from "react";

export default function Loading({ onStart }) {
  const [hovered, setHovered] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center">
      <Image
        src="/landscape_background.jpg"
        alt="Background"
        fill
        priority
        className="object-cover z-0"
      />

      <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-center">
        <div className="flex-1 flex justify-center items-center px-4">
        <Image
            src="/logo_main.png"
            alt="Logo"
            width={1200}
            height={800}
            className="w-[90%] max-w-[400px] md:max-w-[1200px] h-auto"
            priority
        />
        </div>

        <div className="flex flex-col items-center md:items-end md:justify-center md:w-[300px] md:mr-80 mt-auto mb-16 md:mt-0 md:mb-0">
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
