import React, { useState, useEffect, useRef } from 'react';
import { useInterval } from '../../hooks/useInterval';
import './SnakeGame.css';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 2;

const SnakeGame = () => {
  // --- State ---
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState('RIGHT');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem('snakeHighScore')) || 0
  );
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  const directionRef = useRef('RIGHT');

  // --- Logic: Direction Handler ---
  // This ensures both Keyboard and Mobile buttons follow the same rules
  const changeDirection = (newDir) => {
    const currentDir = directionRef.current;
    
    if (newDir === 'UP' && currentDir === 'DOWN') return;
    if (newDir === 'DOWN' && currentDir === 'UP') return;
    if (newDir === 'LEFT' && currentDir === 'RIGHT') return;
    if (newDir === 'RIGHT' && currentDir === 'LEFT') return;

    directionRef.current = newDir;
  };

  // --- Effects: Keyboard ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      if (e.code === 'Space') {
        setIsPaused((prev) => !prev);
      }
      switch (e.key) {
        case 'ArrowUp': changeDirection('UP'); break;
        case 'ArrowDown': changeDirection('DOWN'); break;
        case 'ArrowLeft': changeDirection('LEFT'); break;
        case 'ArrowRight': changeDirection('RIGHT'); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  // --- Game Loop ---
  const gameLoop = () => {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    const currentDir = directionRef.current;
    setDirection(currentDir); 

    switch (currentDir) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
      default: break;
    }

    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || 
        newSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
      handleGameOver();
      return;
    }

    newSnake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      setScore((s) => s + 1);
      setSpeed((s) => Math.max(50, s - SPEED_INCREMENT));
      generateFood(newSnake);
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
  };

  useInterval(gameLoop, !gameOver && !isPaused ? speed : null);

  // --- Helpers ---
  const generateFood = (snakeBody) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = snakeBody.some(seg => seg.x === newFood.x && seg.y === newFood.y);
      if (!isOnSnake) break;
    }
    setFood(newFood);
  };

  const handleGameOver = () => {
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score);
    }
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    setIsPaused(false);
    generateFood([{ x: 10, y: 10 }]);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => console.log(e));
    } else {
      document.exitFullscreen().catch((e) => console.log(e));
    }
  };

  return (
    <div className="snake-wrapper">
      <button className="fullscreen-btn" onClick={toggleFullScreen}>⛶</button>

      <div className="game-header">
        <div className="score-box">
          <span className="label">SCORE</span>
          <span className="value">{score}</span>
        </div>
        <div className="score-box">
          <span className="label">HIGH SCORE</span>
          <span className="value">{highScore}</span>
        </div>
      </div>

      <div className="game-board" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnakeHead = snake[0].x === x && snake[0].y === y;
          const isSnakeBody = snake.some((seg, idx) => idx !== 0 && seg.x === x && seg.y === y);
          const isFood = food.x === x && food.y === y;
          let classes = 'cell';
          if (isSnakeHead) classes += ' snake-head';
          else if (isSnakeBody) classes += ' snake-body';
          if (isFood) classes += ' food';
          return <div key={`${x}-${y}`} className={classes} />;
        })}

        {gameOver && (
          <div className="overlay">
            <h2>GAME OVER</h2>
            <button className="btn-restart" onClick={resetGame}>RESTART SYSTEM</button>
          </div>
        )}
        {isPaused && !gameOver && (
          <div className="overlay paused">
            <h2>PAUSED</h2>
            <button className="btn-restart" onClick={() => setIsPaused(false)}>RESUME</button>
          </div>
        )}
      </div>

      {/* MOBILE CONTROLS */}
      <div className="mobile-controls">
        <button className="d-pad up" onPointerDown={() => changeDirection('UP')}>▲</button>
        <button className="d-pad left" onPointerDown={() => changeDirection('LEFT')}>◀</button>
        <button className="d-pad right" onPointerDown={() => changeDirection('RIGHT')}>▶</button>
        <button className="d-pad down" onPointerDown={() => changeDirection('DOWN')}>▼</button>
      </div>

      <div className="controls-hint">Desktop: Use Arrows • Mobile: Tap Buttons</div>
    </div>
  );
};

export default SnakeGame;