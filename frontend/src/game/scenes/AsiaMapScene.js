import BaseMapScene from './BaseMapScene.js';
import asiaImg from '../../assets/asia.png';

class AsiaMapScene extends BaseMapScene {
    constructor() {
        super('AsiaMap', 'asiaMap', 'AASIAN MATKA');

        this.themeColor = 0xffa500;

        this.rawPoints = [
            { x: 200, y: 100 },
            { x: 600, y: 150 },
            { x: 900, y: 200 },
            { x: 850, y: 350 },
            { x: 600, y: 250 },
            { x: 550, y: 400 },
            { x: 700, y: 500 },
            { x: 1000, y: 450 },
            { x: 1100, y: 300 },
            { x: 1100, y: 600 },
            { x: 950, y: 650 }
        ];
    }

    preload() {
        this.load.image('asiaMap', asiaImg);
        this.preloadBuddy();
    }
}

export default AsiaMapScene;
