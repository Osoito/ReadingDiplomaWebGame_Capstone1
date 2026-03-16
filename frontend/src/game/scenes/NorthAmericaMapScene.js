import BaseMapScene from './BaseMapScene.js';
import northamericaImg from '../../assets/northamerica.png';

class NorthAmericaMapScene extends BaseMapScene {
    constructor() {
        super('NorthAmericaMap', 'northAmericaMap', 'POHJOIS-AMERIKAN MATKA');

        this.themeColor = 0xe74c3c;

        this.rawPoints = [
            { x: 200, y: 100 },
            { x: 150, y: 350 },
            { x: 300, y: 400 },
            { x: 450, y: 450 },
            { x: 650, y: 550 },
            { x: 550, y: 660 },
            { x: 350, y: 650 },
            { x: 300, y: 500 },
            { x: 250, y: 700 },
            { x: 400, y: 800 },
            { x: 500, y: 880 }
        ];
    }

    preload() {
        this.load.image('northAmericaMap', northamericaImg);
        this.preloadBuddy();
    }
}

export default NorthAmericaMapScene;
