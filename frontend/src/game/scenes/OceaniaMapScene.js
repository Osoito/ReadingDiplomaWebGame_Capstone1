import BaseMapScene from './BaseMapScene.js';
import oceaniaImg from '../../assets/oceania.png';

class OceaniaMapScene extends BaseMapScene {
    constructor() {
        super('OceaniaMap', 'oceaniaMap', 'OSEANIAN MATKA');

        this.themeColor = 0x3498db;

        this.rawPoints = [
            { x: 200, y: 100 },
            { x: 450, y: 150 },
            { x: 250, y: 300 },
            { x: 200, y: 450 },
            { x: 500, y: 400 },
            { x: 550, y: 500 },
            { x: 800, y: 600 },
            { x: 900, y: 750 },
            { x: 900, y: 400 },
            { x: 980, y: 200 },
            { x: 900, y: 100 }
        ];
    }

    preload() {
        this.load.image('oceaniaMap', oceaniaImg);
        this.preloadBuddy();
    }
}

export default OceaniaMapScene;
