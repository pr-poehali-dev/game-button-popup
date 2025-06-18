import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const RandomMessageGame = () => {
  const [showGreeting, setShowGreeting] = useState(false);
  const [showCube, setShowCube] = useState(false);
  const [cubeState, setCubeState] = useState(0);

  // Разные состояния кубика Geometry Dash
  const cubeStates = [
    { color: "bg-blue-500", shadow: "shadow-blue-300" },
    { color: "bg-green-500", shadow: "shadow-green-300" },
    { color: "bg-red-500", shadow: "shadow-red-300" },
    { color: "bg-purple-500", shadow: "shadow-purple-300" },
    { color: "bg-yellow-500", shadow: "shadow-yellow-300" },
    { color: "bg-pink-500", shadow: "shadow-pink-300" },
  ];

  const handleGreetingClick = () => {
    setShowGreeting(true);
    setShowCube(false);
  };

  const handlePlayClick = () => {
    setShowCube(true);
    setShowGreeting(false);
    setCubeState(0);
  };

  const handleCubeClick = () => {
    setCubeState((prev) => (prev + 1) % cubeStates.length);
  };

  const handleSimpleButtonClick = () => {
    // Просто кнопка - ничего не делает
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Мини Игра
        </h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto">
          Выбери одну из трех кнопок!
        </p>
      </div>

      {/* Область для контента */}
      <div className="min-h-[200px] flex items-center justify-center">
        {showGreeting && (
          <div className="animate-fade-in text-center p-8 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-200 shadow-lg max-w-md">
            <p className="text-2xl font-semibold text-gray-800 leading-relaxed">
              привет это я создатель мини сайта. я тебе ничем не помогу сорри
            </p>
          </div>
        )}

        {showCube && (
          <div className="animate-scale-in flex flex-col items-center space-y-4">
            <p className="text-lg text-gray-600 font-medium">
              Кликни на кубик!
            </p>
            <div
              onClick={handleCubeClick}
              className={`
                w-20 h-20 cursor-pointer transition-all duration-300 transform hover:scale-110
                ${cubeStates[cubeState].color} ${cubeStates[cubeState].shadow}
                rounded-lg shadow-lg border-2 border-white
                flex items-center justify-center
                animate-pulse hover:animate-none
              `}
            >
              <div className="w-4 h-4 bg-white rounded-full opacity-80"></div>
            </div>
            <p className="text-sm text-gray-500">
              Состояние: {cubeState + 1}/6
            </p>
          </div>
        )}
      </div>

      {/* Три кнопки */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleGreetingClick}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                     text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg
                     transform hover:scale-105 transition-all duration-200"
        >
          👋 Привет
        </Button>

        <Button
          onClick={handlePlayClick}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 
                     text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg
                     transform hover:scale-105 transition-all duration-200"
        >
          🎮 Играть
        </Button>

        <Button
          onClick={handleSimpleButtonClick}
          variant="outline"
          className="border-pink-300 text-pink-600 hover:bg-pink-50 
                     px-8 py-4 text-lg font-semibold rounded-xl shadow-lg
                     transform hover:scale-105 transition-all duration-200"
        >
          🤷 Просто кнопка
        </Button>
      </div>
    </div>
  );
};

export default RandomMessageGame;
