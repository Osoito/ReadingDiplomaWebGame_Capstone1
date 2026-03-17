import BaseMapScene from './BaseMapScene.js';
import africaImg from '../../assets/africa.png';
import tokenImg from '../../assets/redtoken.png';

class AfricaMapScene extends BaseMapScene {
    constructor() {
        super('AfricaMap', 'africaMap', 'AFRIKAN SEIKKAILU');
        this.themeColor = 0xe67e22;
        this.rawPoints = [
            { x: 250, y: 150 },
            { x: 350, y: 500 },
            { x: 700, y: 550 },
            { x: 350, y: 750 },
            { x: 700, y: 700 },
            { x: 950, y: 650 },
            { x: 1000, y: 800 },
            { x: 750, y: 850 },
            { x: 650, y: 1100 },
            { x: 900, y: 1200 },
            { x: 700, y: 1400 },
        ];
    }

    preload() {
        this.load.image('africaMap', africaImg);
        this.load.image('token', tokenImg);
    }
}

export default AfricaMapScene;
