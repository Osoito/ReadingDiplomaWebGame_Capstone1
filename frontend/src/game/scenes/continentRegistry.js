import arcticImg from '../../assets/arctic.png';
import europeImg from '../../assets/europe.png';
import asiaImg from '../../assets/asia.png';
import northamericaImg from '../../assets/northamerica.png';
import southamericaImg from '../../assets/southamerica.png';
import africaImg from '../../assets/africa.png';
import oceaniaImg from '../../assets/oceania.png';
import antarcticaImg from '../../assets/antarctica.png';
import buddyIdleImg from '../../assets/buddyAvatar/panda/panda_idle.png';
import buddyIdleJson from '../../assets/buddyAvatar/panda/panda_idle.json';

const continentRegistry = [
    {
        key: 'ArcticMap',
        assetKey: 'arcticMap',
        assetPath: arcticImg,
        title: 'POHJOISNAVON TUTKIMUSMATKA',
        themeColor: 0x00ffff,
        rawPoints: [
            { x: 200, y: 300 }, { x: 1000, y: 400 }, { x: 800, y: 500 },
            { x: 300, y: 550 }, { x: 550, y: 650 }, { x: 750, y: 650 },
            { x: 600, y: 750 }, { x: 900, y: 770 }, { x: 700, y: 900 },
            { x: 300, y: 900 }, { x: 350, y: 1100 }
        ]
    },
    {
        key: 'EuropeMap',
        assetKey: 'europeMap',
        assetPath: europeImg,
        title: 'EUROOPAN SEIKKAILU',
        themeColor: 0x9b59b6,
        rawPoints: [
            { x: 200, y: 100 }, { x: 425, y: 450 }, { x: 200, y: 600 },
            { x: 550, y: 550 }, { x: 800, y: 550 }, { x: 650, y: 450 },
            { x: 950, y: 450 }, { x: 850, y: 350 }, { x: 1000, y: 250 },
            { x: 850, y: 200 }, { x: 650, y: 200 }
        ]
    },
    {
        key: 'AsiaMap',
        assetKey: 'asiaMap',
        assetPath: asiaImg,
        title: 'AASIAN MATKA',
        themeColor: 0xffa500,
        rawPoints: [
            { x: 200, y: 100 }, { x: 600, y: 150 }, { x: 900, y: 200 },
            { x: 850, y: 350 }, { x: 600, y: 250 }, { x: 550, y: 400 },
            { x: 700, y: 500 }, { x: 1000, y: 450 }, { x: 1100, y: 300 },
            { x: 1100, y: 600 }, { x: 950, y: 650 }
        ]
    },
    {
        key: 'NorthAmericaMap',
        assetKey: 'northAmericaMap',
        assetPath: northamericaImg,
        title: 'POHJOIS-AMERIKAN MATKA',
        themeColor: 0xe74c3c,
        rawPoints: [
            { x: 200, y: 200 }, { x: 200, y: 450 }, { x: 350, y: 650 },
            { x: 550, y: 550 }, { x: 450, y: 800 }, { x: 650, y: 650 },
            { x: 1000, y: 850 }, { x: 800, y: 1000 }, { x: 400, y: 1000 },
            { x: 550, y: 1200 }, { x: 650, y: 1350 }
        ]
    },
    {
        key: 'SouthAmericaMap',
        assetKey: 'southAmericaMap',
        assetPath: southamericaImg,
        title: 'ETELÄ-AMERIKAN MATKA',
        themeColor: 0x27ae60,
        rawPoints: [
            { x: 250, y: 100 }, { x: 300, y: 300 }, { x: 300, y: 450 },
            { x: 650, y: 400 }, { x: 300, y: 650 }, { x: 1000, y: 650 },
            { x: 800, y: 750 }, { x: 950, y: 900 }, { x: 500, y: 1000 },
            { x: 450, y: 1300 }, { x: 400, y: 1600 }
        ]
    },
    {
        key: 'AfricaMap',
        assetKey: 'africaMap',
        assetPath: africaImg,
        title: 'AFRIKAN SEIKKAILU',
        themeColor: 0xe67e22,
        rawPoints: [
            { x: 250, y: 150 }, { x: 350, y: 500 }, { x: 700, y: 550 },
            { x: 350, y: 750 }, { x: 700, y: 700 }, { x: 950, y: 650 },
            { x: 1000, y: 800 }, { x: 750, y: 850 }, { x: 650, y: 1100 },
            { x: 900, y: 1200 }, { x: 700, y: 1400 }
        ]
    },
    {
        key: 'OceaniaMap',
        assetKey: 'oceaniaMap',
        assetPath: oceaniaImg,
        title: 'OSEANIAN MATKA',
        themeColor: 0x3498db,
        rawPoints: [
            { x: 200, y: 100 }, { x: 450, y: 150 }, { x: 250, y: 300 },
            { x: 200, y: 450 }, { x: 500, y: 400 }, { x: 550, y: 500 },
            { x: 800, y: 600 }, { x: 900, y: 750 }, { x: 900, y: 400 },
            { x: 980, y: 200 }, { x: 900, y: 100 }
        ]
    },
    {
        key: 'AntarcticaMap',
        assetKey: 'antarcticaMap',
        assetPath: antarcticaImg,
        title: 'ETELÄMANNER: SUURI JÄÄRETKI',
        themeColor: 0x2c3e50,
        rawPoints: [
            { x: 200, y: 100 }, { x: 250, y: 280 }, { x: 550, y: 250 },
            { x: 550, y: 350 }, { x: 400, y: 450 }, { x: 700, y: 450 },
            { x: 850, y: 550 }, { x: 900, y: 450 }, { x: 750, y: 350 },
            { x: 1000, y: 350 }, { x: 950, y: 200 }
        ]
    }
];

export { buddyIdleImg, buddyIdleJson };
export default continentRegistry;
