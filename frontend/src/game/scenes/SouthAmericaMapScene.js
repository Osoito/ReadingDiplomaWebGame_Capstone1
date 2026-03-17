import BaseMapScene from './BaseMapScene.js';
import southamericaImg from '../../assets/southamerica.png';
import tokenImg from '../../assets/redtoken.png';

class SouthAmericaMapScene extends BaseMapScene {
    constructor() {
        super('SouthAmericaMap', 'southAmericaMap', 'ETELÄ-AMERIKAN MATKA');

        this.themeColor = 0x27ae60;

        this.rawPoints = [
            { x: 250, y: 100 },
            { x: 300, y: 300 },
            { x: 300, y: 450 },
            { x: 650, y: 400 },
            { x: 300, y: 650 },
            { x: 1000, y: 650 },
            { x: 800, y: 750 },
            { x: 950, y: 900 },
            { x: 500, y: 1000 },
            { x: 450, y: 1300 },
            { x: 400, y: 1600 },
        ];
    }

    preload() {
        this.load.image('southAmericaMap', southamericaImg);
        this.load.image('token', tokenImg);
    }
}

export default SouthAmericaMapScene;
