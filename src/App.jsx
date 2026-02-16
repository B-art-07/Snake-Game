import React from 'react';
import SnakeGame from './components/SnakeGame/SnakeGame';
import './index.css'; // Ensure global reset is imported

function App() {
  return (
    <div className="App">
      <SnakeGame />
    </div>
  );
}

export default App;