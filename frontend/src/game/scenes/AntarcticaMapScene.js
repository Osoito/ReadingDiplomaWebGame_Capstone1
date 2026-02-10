import BaseMapScene from './BaseMapScene.js';
import antarcticaImg from '../../assets/antarctica.png';
import tokenImg from '../../assets/redtoken.png';

class AntarcticaMapScene extends BaseMapScene {
    constructor() {
        super('AntarcticaMap', 'antarcticaMap', 'ETELÄMANNER: SUURI JÄÄRETKI');

        this.themeColor = 0x2c3e50;

        this.rawPoints = [
            { x: 200, y: 100 },
            { x: 300, y: 280 },
            { x: 550, y: 400 },
            { x: 450, y: 500 },
            { x: 700, y: 500 },
            { x: 900, y: 600 },
            { x: 1000, y: 700 },
            { x: 1100, y: 550 },
            { x: 900, y: 400 },
            { x: 1100, y: 250 },
            { x: 700, y: 300 }
        ];
    }

    preload() {
        this.load.image('antarcticaMap', antarcticaImg);
        this.load.image('token', tokenImg);
    }
}

export default AntarcticaMapScene;
