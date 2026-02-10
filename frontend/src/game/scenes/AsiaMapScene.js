import BaseMapScene from './BaseMapScene.js';
import asiaImg from '../../assets/asia.png';
import tokenImg from '../../assets/redtoken.png';

class AsiaMapScene extends BaseMapScene {
    constructor() {
        super('AsiaMap', 'asiaMap', 'AASIAN MATKA');

        this.themeColor = 0xffa500;

        this.rawPoints = [
            { x: 200, y: 100 },
            { x: 600, y: 100 },
            { x: 900, y: 120 },
            { x: 850, y: 300 },
            { x: 600, y: 350 },
            { x: 500, y: 500 },
            { x: 750, y: 550 },
            { x: 1000, y: 450 },
            { x: 1150, y: 300 },
            { x: 1200, y: 600 },
            { x: 1050, y: 800 }
        ];
    }

    preload() {
        this.load.image('asiaMap', asiaImg);
        this.load.image('token', tokenImg);
    }
}

export default AsiaMapScene;
