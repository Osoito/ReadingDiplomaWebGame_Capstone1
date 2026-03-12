import BaseMapScene from './BaseMapScene.js';
import antarcticaImg from '../../assets/antarctica.png';
import tokenImg from '../../assets/redtoken.png';

class AntarcticaMapScene extends BaseMapScene {
    constructor() {
        super('AntarcticaMap', 'antarcticaMap', 'ETELÄMANNER: SUURI JÄÄRETKI');

        this.themeColor = 0x2c3e50;

        this.rawPoints = [
            { x: 200, y: 100 },
            { x: 250, y: 280 },
            { x: 550, y: 250 },
            { x: 550, y: 350 },
            { x: 400, y: 450 },
            { x: 700, y: 450 },
            { x: 850, y: 550 },
            { x: 900, y: 450 },
            { x: 750, y: 350 },
            { x: 1000, y: 350 },
            { x: 950, y: 200 }
        ];
    }

    preload() {
        this.load.image('antarcticaMap', antarcticaImg);
        this.load.image('token', tokenImg);
    }
}

export default AntarcticaMapScene;
