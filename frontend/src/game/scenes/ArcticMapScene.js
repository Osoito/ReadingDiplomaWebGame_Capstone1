import BaseMapScene from './BaseMapScene.js';
import arcticImg from '../../assets/arctic.png';
import tokenImg from '../../assets/redtoken.png';

class ArcticMapScene extends BaseMapScene {
    constructor() {
        super('ArcticMap', 'arcticMap', 'POHJOISNAVON TUTKIMUSMATKA');

        this.themeColor = 0x00ffff;

        this.rawPoints = [
            { x: 100, y: 200 },
            { x: 700, y: 350 },
            { x: 600, y: 400 },
            { x: 250, y: 450 },
            { x: 350, y: 500 },
            { x: 540, y: 500 },
            { x: 490, y: 600 },
            { x: 300, y: 750 },
            { x: 600, y: 800 },
            { x: 750, y: 900 },
            { x: 900, y: 850 }
        ];
    }

    preload() {
        this.load.image('arcticMap', arcticImg);
        this.load.image('token', tokenImg);
    }
}

export default ArcticMapScene;
