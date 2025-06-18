import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const RandomMessageGame = () => {
  const messages = ["а фиг тебе", "выходи", "абвгдее", "пшло"];
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);

  const playGame = () => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    const randomMessage = messages[randomIndex];

    setIsVisible(false);
    setTimeout(() => {
      setCurrentMessage(randomMessage);
      setIsVisible(true);
    }, 200);
  };

  const resetGame = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentMessage("");
    }, 300);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent font-rubik">
          Игра случайных фраз
        </h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto">
          Нажми "Играть" и получи случайную фразу!
        </p>
      </div>

      <div className="min-h-[120px] flex items-center justify-center">
        {currentMessage && (
          <div
            className={`
            text-4xl font-bold text-center p-8 rounded-2xl
            bg-gradient-to-br from-purple-100 to-orange-100
            border-2 border-purple-200 shadow-lg
            transition-all duration-500 transform
            ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
          `}
          >
            <span className="text-purple-700">{currentMessage}</span>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          onClick={playGame}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 
                     text-white px-8 py-4 text-xl font-semibold rounded-xl shadow-lg
                     transform hover:scale-105 transition-all duration-200"
        >
          <Icon name="Play" className="mr-2" size={24} />
          Играть
        </Button>

        {currentMessage && (
          <Button
            onClick={resetGame}
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50 
                       px-8 py-4 text-xl font-semibold rounded-xl shadow-lg
                       transform hover:scale-105 transition-all duration-200"
          >
            <Icon name="RotateCcw" className="mr-2" size={24} />
            Выходи
          </Button>
        )}
      </div>
    </div>
  );
};

export default RandomMessageGame;
