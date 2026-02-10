import BaseMapScene from './BaseMapScene.js';
import northamericaImg from '../../assets/northamerica.png';
import tokenImg from '../../assets/redtoken.png';

class NorthAmericaMapScene extends BaseMapScene {
    constructor() {
        super('NorthAmericaMap', 'northAmericaMap', 'POHJOIS-AMERIKAN MATKA');

        this.themeColor = 0xe74c3c;

        this.rawPoints = [
            { x: 200, y: 100 },
            { x: 150, y: 350 },
            { x: 300, y: 400 },
            { x: 500, y: 450 },
            { x: 800, y: 550 },
            { x: 650, y: 600 },
            { x: 450, y: 650 },
            { x: 300, y: 600 },
            { x: 250, y: 750 },
            { x: 450, y: 850 },
            { x: 450, y: 1000 }
        ];
    }

    preload() {
        this.load.image('northAmericaMap', northamericaImg);
        this.load.image('token', tokenImg);
    }
}

export default NorthAmericaMapScene;
