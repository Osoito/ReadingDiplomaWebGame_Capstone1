// src/components/PhaserGame.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Phaser from 'phaser';
import createGameConfig from '../game/config.js';
import ReadingState from '../game/state.js';
import ReactQuiz from './ReactQuiz';

export default function PhaserGame() {
  const containerRef = useRef(null);
  const gameRef      = useRef(null);
  const navigate     = useNavigate();
  const { user }     = useAuth();

  const [quizInfo, setQuizInfo] = useState({ visible: false, mapKey: null });

  useEffect(() => {
    if (gameRef.current) return;

    const parentEl = containerRef.current;
    if (!parentEl) return;

    let cancelled = false;

    const init = async () => {
      // Load progress from backend before Phaser starts
      await ReadingState.loadFromBackend();
      if (cancelled) return;

      const initW = parentEl.clientWidth;
      const initH = parentEl.clientHeight;

      const config = createGameConfig(parentEl, initW, initH);
      const game   = new Phaser.Game(config);

      // Pass userId for backend API calls in Phaser scenes
      game.registry.set('userId', user?.id);
      game.registry.set('buddyId', user?.avatar || 'buddy_1');

      // Return navigation logic
      game.handleBackNavigation = () => {
        if (user?.role === 'teacher') navigate('/teacher/dashboard');
        else                          navigate('/student/dashboard');
      };

      // React wake-up logic for quiz overlay
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

      // Store for cleanup
      game._resizeObserver = ro;
    };

    init();

    return () => {
      cancelled = true;
      window.openReactQuiz = null;
      if (gameRef.current) {
        if (gameRef.current._resizeObserver) {
          gameRef.current._resizeObserver.disconnect();
        }
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [navigate, user]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <div
        id="game-container"
        ref={containerRef}
        style={{ width: '100%', height: '100%', backgroundColor: '#000', zIndex: 1 }}
      />

      {quizInfo.visible && (
        <ReactQuiz
          mapKey={quizInfo.mapKey}
          onClose={() => {
            setQuizInfo({ visible: false, mapKey: null });
            if (gameRef.current) {
              const activeScenes = gameRef.current.scene.getScenes(true);
              if (activeScenes.length > 0) activeScenes[0].isDoingQuiz = false;
            }
          }}
        />
      )}
    </div>
  );
}
