import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

// Типы игровых объектов
type GameMode = "cube" | "wave" | "ship";
type ObjectType = "block" | "spike" | "portal";

interface GameObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  gameMode?: GameMode;
}

interface Level {
  id: string;
  name: string;
  objects: GameObject[];
  background: string;
}

// Предустановленные уровни
const defaultLevels: Level[] = [
  {
    id: "ytty",
    name: "ytty",
    objects: [
      { id: "1", type: "block", x: 300, y: 350, width: 50, height: 50 },
      { id: "2", type: "spike", x: 450, y: 370, width: 30, height: 30 },
      { id: "3", type: "block", x: 600, y: 300, width: 50, height: 50 },
      {
        id: "4",
        type: "portal",
        x: 750,
        y: 320,
        width: 40,
        height: 60,
        gameMode: "wave",
      },
    ],
    background: "bg-gradient-to-r from-blue-400 to-purple-500",
  },
  {
    id: "undertale",
    name: "undertale",
    objects: [
      { id: "1", type: "block", x: 200, y: 350, width: 50, height: 50 },
      { id: "2", type: "block", x: 350, y: 300, width: 50, height: 50 },
      { id: "3", type: "spike", x: 500, y: 370, width: 30, height: 30 },
      {
        id: "4",
        type: "portal",
        x: 650,
        y: 320,
        width: 40,
        height: 60,
        gameMode: "ship",
      },
    ],
    background: "bg-gradient-to-r from-purple-600 to-pink-500",
  },
  {
    id: "gd",
    name: "gd",
    objects: [
      { id: "1", type: "spike", x: 250, y: 370, width: 30, height: 30 },
      { id: "2", type: "block", x: 400, y: 320, width: 50, height: 50 },
      { id: "3", type: "spike", x: 550, y: 370, width: 30, height: 30 },
      { id: "4", type: "block", x: 700, y: 280, width: 50, height: 50 },
    ],
    background: "bg-gradient-to-r from-green-400 to-blue-500",
  },
  {
    id: "gfd",
    name: "gfd",
    objects: [
      { id: "1", type: "block", x: 300, y: 350, width: 50, height: 50 },
      { id: "2", type: "block", x: 400, y: 300, width: 50, height: 50 },
      {
        id: "3",
        type: "portal",
        x: 500,
        y: 320,
        width: 40,
        height: 60,
        gameMode: "wave",
      },
      { id: "4", type: "spike", x: 650, y: 370, width: 30, height: 30 },
    ],
    background: "bg-gradient-to-r from-red-400 to-orange-500",
  },
];

const RandomMessageGame = () => {
  // Состояния экранов
  const [currentScreen, setCurrentScreen] = useState<
    "menu" | "levelSelect" | "game" | "editor" | "pause"
  >("menu");

  // Состояния игры
  const [currentLevel, setCurrentLevel] = useState(0);
  const [levels, setLevels] = useState<Level[]>(defaultLevels);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>("cube");

  // Позиция игрока
  const [playerX, setPlayerX] = useState(50);
  const [playerY, setPlayerY] = useState(350);
  const [velocityY, setVelocityY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Состояния редактора
  const [editorObjects, setEditorObjects] = useState<GameObject[]>([]);
  const [selectedTool, setSelectedTool] = useState<
    "block" | "spike" | "portal" | "select" | "delete"
  >("block");
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [draggedObject, setDraggedObject] = useState<GameObject | null>(null);

  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Физика игры
  const updatePhysics = useCallback(() => {
    if (!isPlaying) return;

    const gravity = gameMode === "cube" ? 0.8 : gameMode === "wave" ? 0.3 : 0.4;
    const jumpForce =
      gameMode === "cube" ? -15 : gameMode === "wave" ? -8 : -10;
    const maxVelocity = gameMode === "wave" ? 8 : 12;

    setPlayerY((prev) => {
      let newY = prev;
      let newVelocityY = velocityY;

      if (gameMode === "cube") {
        if (isPressed && !isJumping && prev >= 350) {
          newVelocityY = jumpForce;
          setIsJumping(true);
        }
        newVelocityY += gravity;
        newY = Math.max(0, Math.min(380, prev + newVelocityY));

        if (newY >= 350) {
          newY = 350;
          newVelocityY = 0;
          setIsJumping(false);
        }
      } else {
        // Режимы wave и ship
        if (isPressed) {
          newVelocityY += jumpForce * 0.3;
        } else {
          newVelocityY += gravity;
        }

        newVelocityY = Math.max(
          -maxVelocity,
          Math.min(maxVelocity, newVelocityY),
        );
        newY = Math.max(0, Math.min(380, prev + newVelocityY));
      }

      setVelocityY(newVelocityY);
      return newY;
    });

    // Движение вперед
    setPlayerX((prev) => prev + 2);

    // Проверка коллизий
    checkCollisions();
  }, [isPlaying, isPressed, isJumping, velocityY, gameMode, playerX, playerY]);

  // Проверка коллизий
  const checkCollisions = () => {
    const currentLevelData = levels[currentLevel];
    if (!currentLevelData) return;

    currentLevelData.objects.forEach((obj) => {
      const playerRect = { x: playerX, y: playerY, width: 30, height: 30 };
      const objRect = {
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
      };

      if (
        playerRect.x < objRect.x + objRect.width &&
        playerRect.x + playerRect.width > objRect.x &&
        playerRect.y < objRect.y + objRect.height &&
        playerRect.y + playerRect.height > objRect.y
      ) {
        if (obj.type === "spike") {
          // Игрок умер - перезапуск уровня
          resetLevel();
        } else if (obj.type === "portal" && obj.gameMode) {
          setGameMode(obj.gameMode);
        }
      }
    });
  };

  // Сброс уровня
  const resetLevel = () => {
    setPlayerX(50);
    setPlayerY(350);
    setVelocityY(0);
    setIsJumping(false);
    setGameMode("cube");
  };

  // Игровой цикл
  useEffect(() => {
    if (isPlaying) {
      const gameLoop = () => {
        updatePhysics();
        animationRef.current = requestAnimationFrame(gameLoop);
      };
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, updatePhysics]);

  // Обработка нажатий
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        setIsPressed(true);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsPressed(false);
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Функции редактора
  const addObject = (x: number, y: number) => {
    if (selectedTool === "select" || selectedTool === "delete") return;

    const newObject: GameObject = {
      id: Date.now().toString(),
      type: selectedTool,
      x: x - 25,
      y: y - 25,
      width:
        selectedTool === "portal" ? 40 : selectedTool === "spike" ? 30 : 50,
      height:
        selectedTool === "portal" ? 60 : selectedTool === "spike" ? 30 : 50,
      gameMode: selectedTool === "portal" ? "wave" : undefined,
    };

    setEditorObjects((prev) => [...prev, newObject]);
  };

  const deleteObject = (id: string) => {
    setEditorObjects((prev) => prev.filter((obj) => obj.id !== id));
    setSelectedObjects((prev) => prev.filter((objId) => objId !== id));
  };

  // Компоненты экранов
  const MenuScreen = () => (
    <div className="gd-menu min-h-screen flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-white drop-shadow-lg animate-pulse">
          Geometry Dash
        </h1>
        <p className="text-xl text-blue-100">Прыгай, избегай препятствий!</p>
      </div>

      <div className="flex flex-col space-y-4">
        <Button
          onClick={() => setCurrentScreen("levelSelect")}
          className="bg-green-500 hover:bg-green-600 text-white px-12 py-4 text-xl font-bold rounded-xl shadow-xl transform hover:scale-105 transition-all"
        >
          🎮 Играть
        </Button>

        <Button
          onClick={() => {
            setCurrentScreen("editor");
            setEditorObjects([]);
          }}
          className="bg-purple-500 hover:bg-purple-600 text-white px-12 py-4 text-xl font-bold rounded-xl shadow-xl transform hover:scale-105 transition-all"
        >
          🛠️ Редактор
        </Button>
      </div>
    </div>
  );

  const LevelSelectScreen = () => (
    <div className="gd-menu min-h-screen flex flex-col items-center justify-center space-y-8">
      <h2 className="text-4xl font-bold text-white mb-8">Выбор уровня</h2>

      <div className="flex items-center space-x-8">
        <Button
          onClick={() => setCurrentLevel(Math.max(0, currentLevel - 1))}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full"
          disabled={currentLevel === 0}
        >
          <Icon name="ChevronLeft" size={24} />
        </Button>

        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-8 min-w-[200px] text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            {levels[currentLevel]?.name || "Уровень"}
          </h3>
          <div className="text-blue-100 text-lg">
            {currentLevel + 1} / {levels.length}
          </div>
        </div>

        <Button
          onClick={() =>
            setCurrentLevel(Math.min(levels.length - 1, currentLevel + 1))
          }
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full"
          disabled={currentLevel === levels.length - 1}
        >
          <Icon name="ChevronRight" size={24} />
        </Button>
      </div>

      <div className="flex space-x-4">
        <Button
          onClick={() => {
            resetLevel();
            setCurrentScreen("game");
            setIsPlaying(true);
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-xl font-bold rounded-xl"
        >
          ▶️ Начать
        </Button>

        <Button
          onClick={() => setCurrentScreen("menu")}
          className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 text-xl font-bold rounded-xl"
        >
          ↩️ Назад
        </Button>
      </div>
    </div>
  );

  const GameScreen = () => (
    <div
      className={`min-h-screen ${levels[currentLevel]?.background || "bg-blue-500"} relative overflow-hidden`}
    >
      {/* UI */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          onClick={() => {
            setIsPlaying(false);
            setCurrentScreen("pause");
          }}
          className="bg-black bg-opacity-50 text-white p-2 rounded"
        >
          ⏸️
        </Button>
      </div>

      <div className="absolute top-4 right-4 z-10 text-white font-bold">
        Режим: {gameMode === "cube" ? "🟦" : gameMode === "wave" ? "〰️" : "🚀"}
      </div>

      {/* Игровая область */}
      <div className="relative w-full h-screen" ref={gameRef}>
        {/* Игрок */}
        <div
          className={`absolute transition-all duration-75 ${
            gameMode === "cube"
              ? "bg-yellow-400 w-8 h-8"
              : gameMode === "wave"
                ? "bg-cyan-400 w-6 h-6 rounded-full"
                : "bg-orange-400 w-10 h-6"
          } border-2 border-white shadow-lg`}
          style={{
            left: `${playerX}px`,
            top: `${playerY}px`,
            transform:
              gameMode === "cube" ? `rotate(${velocityY * 3}deg)` : "none",
          }}
        />

        {/* Объекты уровня */}
        {levels[currentLevel]?.objects.map((obj) => (
          <div
            key={obj.id}
            className={`absolute ${
              obj.type === "block"
                ? "bg-gray-700 border-2 border-gray-500"
                : obj.type === "spike"
                  ? "bg-red-500 border-2 border-red-700"
                  : "bg-purple-500 border-2 border-purple-700 rounded-lg"
            }`}
            style={{
              left: `${obj.x}px`,
              top: `${obj.y}px`,
              width: `${obj.width}px`,
              height: `${obj.height}px`,
              clipPath:
                obj.type === "spike"
                  ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                  : "none",
            }}
          >
            {obj.type === "portal" && (
              <div className="flex items-center justify-center h-full text-white font-bold">
                {obj.gameMode === "wave"
                  ? "〰️"
                  : obj.gameMode === "ship"
                    ? "🚀"
                    : "🟦"}
              </div>
            )}
          </div>
        ))}

        {/* Земля */}
        <div className="absolute bottom-0 w-full h-20 bg-green-600 border-t-4 border-green-500" />
      </div>
    </div>
  );

  const EditorScreen = () => (
    <div className="min-h-screen bg-gray-800 relative">
      {/* Панель инструментов */}
      <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-75 rounded-lg p-4">
        <div className="flex flex-col space-y-2">
          {[
            { tool: "block" as const, icon: "🟫", label: "Блок" },
            { tool: "spike" as const, icon: "🔺", label: "Шип" },
            { tool: "portal" as const, icon: "🚪", label: "Портал" },
            { tool: "select" as const, icon: "👆", label: "Выбрать" },
            { tool: "delete" as const, icon: "🗑️", label: "Удалить" },
          ].map(({ tool, icon, label }) => (
            <Button
              key={tool}
              onClick={() => setSelectedTool(tool)}
              className={`${
                selectedTool === tool ? "bg-blue-600" : "bg-gray-600"
              } hover:bg-blue-500 text-white px-3 py-2 text-sm`}
            >
              {icon} {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <Button
          onClick={() => {
            resetLevel();
            setLevels((prev) => {
              const newLevels = [...prev];
              newLevels[newLevels.length - 1] = {
                ...newLevels[newLevels.length - 1],
                objects: editorObjects,
              };
              return newLevels;
            });
            setCurrentLevel(levels.length - 1);
            setCurrentScreen("game");
            setIsPlaying(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
        >
          ▶️ Тест
        </Button>

        <Button
          onClick={() => setCurrentScreen("menu")}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
        >
          ↩️ Выход
        </Button>
      </div>

      {/* Область редактирования */}
      <div
        className="w-full h-screen cursor-crosshair"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          if (selectedTool === "delete") {
            const clickedObject = editorObjects.find(
              (obj) =>
                x >= obj.x &&
                x <= obj.x + obj.width &&
                y >= obj.y &&
                y <= obj.y + obj.height,
            );
            if (clickedObject) {
              deleteObject(clickedObject.id);
            }
          } else {
            addObject(x, y);
          }
        }}
      >
        {/* Объекты редактора */}
        {editorObjects.map((obj) => (
          <div
            key={obj.id}
            className={`absolute cursor-move ${
              obj.type === "block"
                ? "bg-gray-700 border-2 border-gray-500"
                : obj.type === "spike"
                  ? "bg-red-500 border-2 border-red-700"
                  : "bg-purple-500 border-2 border-purple-700 rounded-lg"
            } ${selectedObjects.includes(obj.id) ? "ring-2 ring-yellow-400" : ""}`}
            style={{
              left: `${obj.x}px`,
              top: `${obj.y}px`,
              width: `${obj.width}px`,
              height: `${obj.height}px`,
              clipPath:
                obj.type === "spike"
                  ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                  : "none",
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (selectedTool === "select") {
                setSelectedObjects((prev) =>
                  prev.includes(obj.id)
                    ? prev.filter((id) => id !== obj.id)
                    : [...prev, obj.id],
                );
              }
            }}
          >
            {obj.type === "portal" && (
              <div className="flex items-center justify-center h-full text-white font-bold text-xs">
                {obj.gameMode === "wave"
                  ? "〰️"
                  : obj.gameMode === "ship"
                    ? "🚀"
                    : "🟦"}
              </div>
            )}
          </div>
        ))}

        {/* Земля */}
        <div className="absolute bottom-0 w-full h-20 bg-green-600 border-t-4 border-green-500" />
      </div>
    </div>
  );

  const PauseScreen = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Пауза</h2>

        <div className="flex flex-col space-y-4">
          <Button
            onClick={() => {
              setCurrentScreen("game");
              setIsPlaying(true);
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg font-bold rounded-xl"
          >
            ▶️ Продолжить
          </Button>

          <Button
            onClick={() => {
              setIsPlaying(false);
              setCurrentScreen("menu");
              resetLevel();
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 text-lg font-bold rounded-xl"
          >
            🚪 Выход
          </Button>
        </div>
      </div>
    </div>
  );

  // Рендер текущего экрана
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "menu":
        return <MenuScreen />;
      case "levelSelect":
        return <LevelSelectScreen />;
      case "game":
        return <GameScreen />;
      case "editor":
        return <EditorScreen />;
      case "pause":
        return <PauseScreen />;
      default:
        return <MenuScreen />;
    }
  };

  return (
    <div className="relative w-full">
      {renderCurrentScreen()}

      {/* Инструкции для игры */}
      {isPlaying && currentScreen === "game" && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
          Нажмите ПРОБЕЛ для прыжка/полета
        </div>
      )}
    </div>
  );
};

export default RandomMessageGame;
