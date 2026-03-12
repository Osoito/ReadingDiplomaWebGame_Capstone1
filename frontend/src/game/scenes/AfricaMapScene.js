import BaseMapScene from './BaseMapScene.js';
import africaImg from '../../assets/africa.png';
import tokenImg from '../../assets/redtoken.png';

class AfricaMapScene extends BaseMapScene {
    constructor() {
        super('AfricaMap', 'africaMap', 'AFRIKAN SEIKKAILU');
        this.themeColor = 0xe67e22;
        this.rawPoints = [
            { x: 200, y: 100 },
            { x: 250, y: 250 },
            { x: 450, y: 300 },
            { x: 650, y: 450 },
            { x: 250, y: 450 },
            { x: 500, y: 550 },
            { x: 400, y: 600 },
            { x: 450, y: 700 },
            { x: 600, y: 750 },
            { x: 750, y: 850 },
            { x: 500, y: 950 },
        ];
    }

    preload() {
        this.load.image('africaMap', africaImg);
        this.load.image('token', tokenImg);
    }
}

export default AfricaMapScene;
