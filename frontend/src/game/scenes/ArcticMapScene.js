import BaseMapScene from './BaseMapScene.js';
import arcticImg from '../../assets/arctic.png';
import tokenImg from '../../assets/redtoken.png';

class ArcticMapScene extends BaseMapScene {
    constructor() {
        super('ArcticMap', 'arcticMap', 'POHJOISNAVON TUTKIMUSMATKA');

        this.themeColor = 0x00ffff;

        this.rawPoints = [
            { x: 100, y: 200 },
            { x: 650, y: 300 },
            { x: 400, y: 400 },
            { x: 200, y: 400 },
            { x: 350, y: 500 },
            { x: 500, y: 450 },
            { x: 600, y: 550 },    
            { x: 450, y: 620 },
            { x: 250, y: 700 },
            { x: 750, y: 700 },
            { x: 600, y: 800 }
        ];
    }

    preload() {
        this.load.image('arcticMap', arcticImg);
        this.load.image('token', tokenImg);
    }
}

export default ArcticMapScene;
