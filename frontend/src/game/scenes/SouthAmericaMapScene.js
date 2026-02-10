import BaseMapScene from './BaseMapScene.js';
import southamericaImg from '../../assets/southamerica.png';
import tokenImg from '../../assets/redtoken.png';

class SouthAmericaMapScene extends BaseMapScene {
    constructor() {
        super('SouthAmericaMap', 'southAmericaMap', 'ETELÄ-AMERIKAN MATKA');

        this.themeColor = 0x27ae60;

        this.rawPoints = [
            { x: 350, y: 100 },
            { x: 300, y: 200 },
            { x: 280, y: 350 },
            { x: 500, y: 400 },
            { x: 250, y: 600 },
            { x: 700, y: 650 },
            { x: 600, y: 750 },
            { x: 350, y: 850 },
            { x: 400, y: 1000 },
            { x: 350, y: 1200 },
        ];
    }

    preload() {
        this.load.image('southAmericaMap', southamericaImg);
        this.load.image('token', tokenImg);
    }
}

export default SouthAmericaMapScene;
