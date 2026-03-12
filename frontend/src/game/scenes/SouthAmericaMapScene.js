import BaseMapScene from './BaseMapScene.js';
import southamericaImg from '../../assets/southamerica.png';
import tokenImg from '../../assets/redtoken.png';

class SouthAmericaMapScene extends BaseMapScene {
    constructor() {
        super('SouthAmericaMap', 'southAmericaMap', 'ETELÄ-AMERIKAN MATKA');

        this.themeColor = 0x27ae60;

        this.rawPoints = [
            { x: 350, y: 100 },
            { x: 300, y: 250 },
            { x: 200, y: 350 },
            { x: 650, y: 400 },
            { x: 600, y: 550 },
            { x: 350, y: 650 },
            { x: 500, y: 750 },
            { x: 250, y: 850 },
            { x: 260, y: 1000 },
            { x: 550, y: 1100 },
        ];
    }

    preload() {
        this.load.image('southAmericaMap', southamericaImg);
        this.load.image('token', tokenImg);
    }
}

export default SouthAmericaMapScene;
