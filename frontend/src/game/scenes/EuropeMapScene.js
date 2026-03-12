import BaseMapScene from './BaseMapScene.js';
import europeImg from '../../assets/europe.png';
import tokenImg from '../../assets/redtoken.png';

class EuropeMapScene extends BaseMapScene {
    constructor() {
        super('EuropeMap', 'europeMap', 'EUROOPAN SEIKKAILU');

        this.themeColor = 0x9b59b6;

        this.rawPoints = [
            { x: 200, y: 100 },
            { x: 425, y: 450 },
            { x: 200, y: 600 },
            { x: 550, y: 550 },
            { x: 800, y: 550 },
            { x: 650, y: 450 },
            { x: 950, y: 450 },
            { x: 850, y: 350 },
            { x: 1000, y: 250 },
            { x: 850, y: 200 },
            { x: 650, y: 200 }
        ];
    }

    preload() {
        this.load.image('europeMap', europeImg);
        this.load.image('token', tokenImg);
    }
}

export default EuropeMapScene;
