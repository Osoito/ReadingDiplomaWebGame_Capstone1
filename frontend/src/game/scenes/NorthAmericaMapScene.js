import BaseMapScene from './BaseMapScene.js';
import northamericaImg from '../../assets/northamerica.png';
import tokenImg from '../../assets/redtoken.png';

class NorthAmericaMapScene extends BaseMapScene {
    constructor() {
        super('NorthAmericaMap', 'northAmericaMap', 'POHJOIS-AMERIKAN MATKA');

        this.themeColor = 0xe74c3c;

        this.rawPoints = [
            { x: 200, y: 200 },
            { x: 200, y: 450 },
            { x: 350, y: 650 },
            { x: 550, y: 550 },
            { x: 450, y: 800 },
            { x: 650, y: 650 },
            { x: 1000, y: 850 },
            { x: 800, y: 1000 },
            { x: 400, y: 1000 },
            { x: 550, y: 1200 },
            { x: 650, y: 1350 }
        ];
    }

    preload() {
        this.load.image('northAmericaMap', northamericaImg);
        this.load.image('token', tokenImg);
    }
}

export default NorthAmericaMapScene;
