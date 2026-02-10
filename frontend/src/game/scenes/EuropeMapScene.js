import BaseMapScene from './BaseMapScene.js';
import europeImg from '../../assets/europe.png';
import tokenImg from '../../assets/redtoken.png';

class EuropeMapScene extends BaseMapScene {
    constructor() {
        super('EuropeMap', 'europeMap', 'EUROOPAN SEIKKAILU');

        this.themeColor = 0x9b59b6;

        this.rawPoints = [
            { x: 200, y: 100 },
            { x: 425, y: 400 },
            { x: 350, y: 750 },
            { x: 550, y: 600 },
            { x: 1000, y: 700 },
            { x: 775, y: 560 },
            { x: 1150, y: 500 },
            { x: 850, y: 400 },
            { x: 1200, y: 300 },
            { x: 1050, y: 200 },
            { x: 790, y: 245 }
        ];
    }

    preload() {
        this.load.image('europeMap', europeImg);
        this.load.image('token', tokenImg);
    }
}

export default EuropeMapScene;
