// src/components/PhaserGame.jsx

import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Phaser from 'phaser';
import createGameConfig from '../game/config.js';

export default function PhaserGame() {
  const containerRef = useRef(null);
  const gameRef      = useRef(null);
  const navigate    = useNavigate();
  const { user }    = useAuth();

  useEffect(() => {
    if (gameRef.current) return;  // 防止重复初始化

    const parentEl = containerRef.current;
    if (!parentEl) return;

    // 1. 取初始尺寸
    const initW = parentEl.clientWidth;
    const initH = parentEl.clientHeight;

    // 2. 创建 Phaser 配置并实例化
    const config = createGameConfig(parentEl, initW, initH);
    const game   = new Phaser.Game(config);

    // Pass selected buddy to Phaser scenes
    game.registry.set('buddyId', user?.avatar || 'buddy_1');

    // 注入返回逻辑
    game.handleBackNavigation = () => {
      if (user?.role === 'teacher') navigate('/teacher/dashboard');
      else                                navigate('/student/dashboard');
    };

    gameRef.current = game;

    // 3. 用 ResizeObserver 监听容器尺寸变化
    const ro = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        // 通知 Phaser 重新调整并分发 resize 事件
        game.scale.resize(Math.floor(width), Math.floor(height));
      }
    });
    ro.observe(parentEl);

    // 清理
    return () => {
      ro.disconnect();
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [navigate, user]);

  return (
    <div
      ref={containerRef}
      style={{
        width:  '100vw',
        height: '100vh',
        position: 'fixed',
        top:    0,
        left:   0,
      }}
    />
  );
}
