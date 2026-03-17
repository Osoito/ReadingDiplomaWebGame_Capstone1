// src/components/PhaserGame.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Phaser from 'phaser';
import createGameConfig from '../game/config.js';
import ReactQuiz from './ReactQuiz'; // 我们稍后创建这个组件

export default function PhaserGame() {
  const containerRef = useRef(null);
  const gameRef      = useRef(null);
  const navigate    = useNavigate();
  const { user }    = useAuth();

  // ⭐ 新增状态：控制 Quiz 弹窗显示，并传递地图 key
  const [quizInfo, setQuizInfo] = useState({ visible: false, mapKey: null });

  useEffect(() => {
    if (gameRef.current) return;

    const parentEl = containerRef.current;
    if (!parentEl) return;

    const initW = parentEl.clientWidth;
    const initH = parentEl.clientHeight;

    const config = createGameConfig(parentEl, initW, initH);
    const game   = new Phaser.Game(config);

    // 注入返回逻辑
    game.handleBackNavigation = () => {
      if (user?.role === 'teacher') navigate('/teacher/dashboard');
      else                          navigate('/student/dashboard');
    };

    // ⭐ 注入 React 唤起逻辑：给 window 挂载一个方法，让 Phaser 脚本能调用
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
      window.openReactQuiz = null; // 清理全局变量
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [navigate, user]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      {/* 1. Phaser 游戏层 - 保持在底层 */}
      <div
        id="game-container"
        ref={containerRef}
        style={{ width: '100%', height: '100%', backgroundColor: '#000', zIndex: 1 }}
      />

      {/* 2. React UI 层 - 必须在 Phaser 容器外面，且 zIndex 更高 */}
      {quizInfo.visible && (
        <ReactQuiz 
          mapKey={quizInfo.mapKey} 
          onClose={() => {
            setQuizInfo({ visible: false, mapKey: null });
            // 恢复 Phaser 交互
            if (gameRef.current) {
                // 这里的逻辑是确保 Phaser 里的 isDoingQuiz 状态同步
                const activeScenes = gameRef.current.scene.getScenes(true);
                if (activeScenes.length > 0) activeScenes[0].isDoingQuiz = false;
            }
          }} 
        />
      )}
    </div>
  );
}
