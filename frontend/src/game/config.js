// game/config.js

import Phaser from 'phaser';
import WorldMapScene from './scenes/WorldMapScene.js';
import ReadingScene from './scenes/ReadingScene.js';
import continentRegistry from './scenes/continentRegistry.js';
import createContinentScene from './scenes/createContinentScene.js';

// Generate all 8 continent scenes from registry
const continentScenes = continentRegistry.map(config => createContinentScene(config));

export default function createGameConfig(parent, width, height) {
  return {
    type: Phaser.AUTO,
    parent,
    dom: {
      createContainer: true
    },
    render: {
      antialias: true,
      roundPixels: true
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width,
      height,
      resolution: window.devicePixelRatio || 1
    },
    scene: [
      WorldMapScene,
      ...continentScenes,
      ReadingScene
    ]
  };
}
