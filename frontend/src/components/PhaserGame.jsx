// src/components/PhaserGame.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Phaser from 'phaser';
import createGameConfig from '../game/config.js';
import ReactQuiz from './ReactQuiz'; 

export default function PhaserGame() {
  const containerRef = useRef(null);
  const gameRef      = useRef(null);
  const navigate    = useNavigate();
  const { user }    = useAuth();

  // ⭐ New feature: Control the display of the Quiz pop-up and pass the map key.
  const [quizInfo, setQuizInfo] = useState({ visible: false, mapKey: null });

  useEffect(() => {
    if (gameRef.current) return;

    const parentEl = containerRef.current;
    if (!parentEl) return;

    const initW = parentEl.clientWidth;
    const initH = parentEl.clientHeight;

    const config = createGameConfig(parentEl, initW, initH);
    const game   = new Phaser.Game(config);

    // return logic
    game.handleBackNavigation = () => {
      if (user?.role === 'teacher') navigate('/teacher/dashboard');
      else                          navigate('/student/dashboard');
    };

    // ⭐ React wake-up logic: Attach a method to the window so that Phaser scripts can call it.
    window.openReactQuiz = (mapKey) => {
      setQuizInfo({ visible: true, mapKey: mapKey });
    };

    gameRef.current = game;

    const ro = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        game.scale.resize(Math.floor(width), Math.floor(height));
      }
    });
    ro.observe(parentEl);

    return () => {
      ro.disconnect();
      window.openReactQuiz = null; 
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [navigate, user]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      {/* 1. Phaser game layer - kept at the bottom layer */}
      <div
        id="game-container"
        ref={containerRef}
        style={{ width: '100%', height: '100%', backgroundColor: '#000', zIndex: 1 }}
      />

      {/* 2. React UI layer - must be outside the Phaser container, and have a higher zIndex. */}
      {quizInfo.visible && (
        <ReactQuiz 
          mapKey={quizInfo.mapKey} 
          onClose={() => {
            setQuizInfo({ visible: false, mapKey: null });
            // Restore Phaser interaction
            if (gameRef.current) {
                // The logic here is to ensure that the isDoingQuiz state in Phaser is synchronized.
                const activeScenes = gameRef.current.scene.getScenes(true);
                if (activeScenes.length > 0) activeScenes[0].isDoingQuiz = false;
            }
          }} 
        />
      )}
    </div>
  );
}
