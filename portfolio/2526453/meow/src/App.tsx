import { useEffect, useState } from 'react';

interface Obstacle {
  id: number;
  x: number;
}

function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState(80);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [nextObstacleId, setNextObstacleId] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      setSize((prev) => {
        const newSize = prev + (e.deltaY > 0 ? -5 : 5);
        return Math.max(40, Math.min(150, newSize));
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleScroll, { passive: false });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isGameOver) return;

    const gameLoop = setInterval(() => {
      setObstacles((prev) => {
        const updated = prev.map((obs) => ({ ...obs, x: obs.x - 8 }));
        const filtered = updated.filter((obs) => obs.x > -50);

        filtered.forEach((obs) => {
          const dinosaurRadius = size / 2;
          const obstacleRadius = 30;
          const distance = Math.sqrt(
            Math.pow(position.x - obs.x, 2) + Math.pow(position.y - 200, 2)
          );

          if (distance < dinosaurRadius + obstacleRadius) {
            setIsGameOver(true);
          }

          if (obs.x < -50 && !prev.find((p) => p.id === obs.id && p.x >= -50)) {
            setScore((s) => s + 1);
          }
        });

        return filtered;
      });
    }, 30);

    return () => clearInterval(gameLoop);
  }, [isGameOver, position, size]);

  useEffect(() => {
    if (isGameOver) return;

    const spawnObstacle = setInterval(() => {
      setObstacles((prev) => [...prev, { id: nextObstacleId, x: window.innerWidth }]);
      setNextObstacleId((prev) => prev + 1);
    }, 2000);

    return () => clearInterval(spawnObstacle);
  }, [isGameOver, nextObstacleId]);

  const handleReset = () => {
    setIsGameOver(false);
    setScore(0);
    setObstacles([]);
    setSize(80);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
          animation: isGameOver ? 'none' : 'rainbow 10s ease infinite',
          filter: isGameOver ? 'brightness(0.3)' : 'brightness(1)',
          transition: 'filter 0.3s ease',
        }}
      />

      <div className="fixed top-8 left-8 z-20 text-white text-4xl font-bold drop-shadow-lg">
        Score: {score}
      </div>

      <div className="fixed top-8 right-8 z-20 text-white text-lg drop-shadow-lg">
        Scroll to change size
      </div>

      {obstacles.map((obs) => (
        <div
          key={obs.id}
          className="fixed pointer-events-none"
          style={{
            left: `${obs.x}px`,
            top: '200px',
            fontSize: '50px',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
          }}
        >
          🌵
        </div>
      ))}

      <div
        className="fixed pointer-events-none transition-all duration-100 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
          fontSize: `${size}px`,
          filter: isGameOver ? 'drop-shadow(0 4px 8px rgba(255,0,0,0.8)) hue-rotate(300deg)' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          transition: isGameOver ? 'filter 0.3s ease' : 'none',
        }}
      >
        🦕
      </div>

      {isGameOver && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70">
          <div className="text-center">
            <div className="text-9xl font-black text-red-600 drop-shadow-lg mb-6">
              WASTED
            </div>
            <div className="text-5xl text-white font-bold mb-8">
              Final Score: {score}
            </div>
            <button
              onClick={handleReset}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-2xl font-bold rounded-lg transition-colors duration-200"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(180deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
