import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

const IntuitionTrainer = () => {
  const loadGameState = () => {
    const savedState = localStorage.getItem("intuitionTrainerState");
    if (savedState) {
      return JSON.parse(savedState);
    }
    return {
      correct: 0,
      incorrect: 0,
      attempts: 0,
      currentColor: "bg-gray-300",
      gameHistory: [],
      gameCompleted: false,
      maxAttempts: 200,
    };
  };

  const [gameState, setGameState] = useState(loadGameState());
  const [leftActive, setLeftActive] = useState(false);
  const [rightActive, setRightActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [attemptsSetting, setAttemptsSetting] = useState(200);

  const {
    correct,
    incorrect,
    attempts,
    currentColor,
    gameHistory,
    gameCompleted,
    maxAttempts,
  } = gameState;

  useEffect(() => {
    localStorage.setItem("intuitionTrainerState", JSON.stringify(gameState));
  }, [gameState]);

  const getRandomColor = () => {
    return Math.random() < 0.5 ? "bg-blue-500" : "bg-red-500";
  };

  const updateAccuracy = () => {
    const total = correct + incorrect;
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  const handleGuess = (userGuess) => {
    if (attempts >= maxAttempts) return;

    setLeftActive(false);
    setRightActive(false);

    if (userGuess === "blue") {
      setLeftActive(true);
    } else {
      setRightActive(true);
    }

    const newColor = getRandomColor();
    const isCorrect =
      (userGuess === "blue" && newColor === "bg-blue-500") ||
      (userGuess === "red" && newColor === "bg-red-500");

    const newAttempts = attempts + 1;
    const newCompleted = newAttempts >= maxAttempts;

    setGameState((prev) => ({
      ...prev,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
      attempts: newAttempts,
      currentColor: newColor,
      gameCompleted: newCompleted,
    }));

    setTimeout(() => {
      setLeftActive(false);
      setRightActive(false);
    }, 300);

    if (newCompleted) {
      setTimeout(() => {
        setShowModal(true);
      }, 500);
    }
  };

  const resetGame = () => {
    setGameState((prev) => ({
      ...prev,
      correct: 0,
      incorrect: 0,
      attempts: 0,
      currentColor: "bg-gray-300",
      gameCompleted: false,
      maxAttempts: attemptsSetting,
    }));
    setShowModal(false);
    setShowStats(false);
  };

  useEffect(() => {
    if (gameCompleted) {
      setShowModal(true);
    }
  }, [gameCompleted]);

  const renderStatsChart = () => {
    if (gameHistory.length === 0 && !gameCompleted) {
      return <p className="text-gray-500 mt-4">Нет данных для отображения</p>;
    }

    let chartData = [...gameHistory];

    if (
      gameCompleted &&
      (gameHistory.length === 0 ||
        gameHistory[gameHistory.length - 1].correct !== correct)
    ) {
      chartData.push({
        accuracy: updateAccuracy(),
        correct: correct,
        incorrect: incorrect,
        date: new Date().toLocaleString(),
      });
    }

    return (
      <div className="w-full h-full landscape:rotate-90 landscape:origin-bottom-left landscape:fixed landscape:top-0 landscape:left-full landscape:w-screen landscape:h-screen landscape:overflow-auto">
        <div className="h-[80vh] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis yAxisId="left" domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "Точность (%)") return [`${value}%`, name];
                  return [value, name];
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="accuracy"
                stroke="#3b82f6"
                name="Точность (%)"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="correct"
                stroke="#10b981"
                name="Верно"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="incorrect"
                stroke="#ef4444"
                name="Неверно"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full overflow-hidden">
      <div className="flex w-full h-full relative">
        {/* Левая кнопка */}
        <button
          className={`flex-1 h-full cursor-pointer border-none bg-transparent z-20 relative overflow-hidden ${
            leftActive ? "active-left" : ""
          }`}
          onClick={() => handleGuess("blue")}
          disabled={attempts >= maxAttempts}
        >
          <div
            className={`absolute inset-0 opacity-0 transition-opacity duration-200 ${
              leftActive ? "opacity-100" : ""
            } bg-gradient-to-r from-blue-500/30 to-transparent`}
          ></div>
        </button>

        {/* Центральная карточка */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div
            className={`w-52 h-80 p-3 text-white flex justify-end items-end rounded-xl transition-colors duration-300 ${currentColor}`}
          >
            <div className="w-full text-right text-xs">
              <span>{attempts}</span>/{maxAttempts}
              {attempts >= maxAttempts && (
                <div className="text-xs mt-1">Игра завершена!</div>
              )}
            </div>
          </div>

          <div className="w-52 pt-8 pr-3 flex flex-col items-center text-xs">
            <div className="w-full text-right">
              Верно: <span className="text-green-700 font-bold">{correct}</span>
            </div>
            <div className="w-full text-right">
              Не верно:{" "}
              <span className="text-red-700 font-bold">{incorrect}</span>
            </div>
            <div className="w-full text-right">
              Точность:{" "}
              <span className="text-blue-500 font-bold">
                {updateAccuracy()}%
              </span>
            </div>
          </div>
        </div>

        {/* Правая кнопка */}
        <button
          className={`flex-1 h-full cursor-pointer border-none bg-transparent z-20 relative overflow-hidden ${
            rightActive ? "active-right" : ""
          }`}
          onClick={() => handleGuess("red")}
          disabled={attempts >= maxAttempts}
        >
          <div
            className={`absolute inset-0 opacity-0 transition-opacity duration-200 ${
              rightActive ? "opacity-100" : ""
            } bg-gradient-to-l from-red-500/30 to-transparent`}
          ></div>
        </button>
      </div>

      {/* Модальное окно с итогами */}
      {showModal && !showStats && (
        <div className="fixed inset-0 bg-black/70 z-50">
          <div className="bg-white p-6 rounded-xl flex flex-col items-center justify-center text-center w-full h-screen overflow-auto">
            <div>
              <h2 className="text-xl font-bold mb-4">Итоги</h2>
              <p className="mb-2">
                Верно: <span className="font-bold">{correct}</span>
              </p>
              <p className="mb-2">
                Не верно: <span className="font-bold">{incorrect}</span>
              </p>
              <p className="mb-2">
                Точность: <span className="font-bold">{updateAccuracy()}%</span>
              </p>

              <div className="mb-6 mt-4">
                <label className="block mb-2 text-sm font-medium">
                  Попыток: {attemptsSetting}
                </label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  value={attemptsSetting}
                  onChange={(e) => setAttemptsSetting(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50</span>
                  <span>300</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  className="px-8 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    setShowStats(true);
                    setShowModal(false);
                  }}
                >
                  Статистика
                </button>
                <button
                  className="px-8 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  onClick={resetGame}
                >
                  Играть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Окно статистики */}
      {showStats && (
        <div className="fixed inset-0 bg-white z-50">
          <div className="w-full h-full">
            <div className="flex text-sm justify-center gap-4 py-4">
              <button
                className="px-5 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                onClick={() => {
                  setShowStats(false);
                  setShowModal(true); // Возвращаем в модальное окно с настройками
                }}
              >
                Назад
              </button>
              <button
                className="px-5 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                onClick={() => {
                  resetGame();
                  setShowStats(false);
                }}
              >
                Играть
              </button>
            </div>
            {renderStatsChart()}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntuitionTrainer;
