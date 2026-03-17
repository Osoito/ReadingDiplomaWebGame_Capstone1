import BaseMapScene from './BaseMapScene.js';
import arcticImg from '../../assets/arctic.png';

class ArcticMapScene extends BaseMapScene {
    constructor() {
        super('ArcticMap', 'arcticMap', 'POHJOISNAVON TUTKIMUSMATKA');

        this.themeColor = 0x00ffff;

        this.rawPoints = [
            { x: 200, y: 300 },
            { x: 1000, y: 400 },
            { x: 800, y: 500 },
            { x: 300, y: 550 },
            { x: 550, y: 650 },
            { x: 750, y: 650 },
            { x: 600, y: 750 },    
            { x: 900, y: 770 },
            { x: 700, y: 900 },
            { x: 300, y: 900 },
            { x: 350, y: 1100 }
        ];
    }

    preload() {
        this.load.image('arcticMap', arcticImg);
        this.preloadBuddy();
    }
}

export default ArcticMapScene;
