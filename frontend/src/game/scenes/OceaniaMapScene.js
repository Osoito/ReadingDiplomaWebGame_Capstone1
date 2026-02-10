import BaseMapScene from './BaseMapScene.js';
import oceaniaImg from '../../assets/oceania.png';
import tokenImg from '../../assets/redtoken.png';

class OceaniaMapScene extends BaseMapScene {
    constructor() {
        super('OceaniaMap', 'oceaniaMap', 'OSEANIAN MATKA');

        this.themeColor = 0x3498db;

        this.rawPoints = [
            { x: 200, y: 100 },
            { x: 450, y: 150 },
            { x: 300, y: 300 },
            { x: 250, y: 400 },
            { x: 500, y: 400 },
            { x: 600, y: 500 },
            { x: 600, y: 600 },
            { x: 950, y: 750 },
            { x: 1000, y: 500 },
            { x: 1150, y: 300 },
            { x: 1000, y: 200 }
        ];
    }

    preload() {
        this.load.image('oceaniaMap', oceaniaImg);
        this.load.image('token', tokenImg);
    }
}

export default OceaniaMapScene;
