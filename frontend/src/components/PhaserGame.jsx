import { useRef, useEffect } from 'react';
import Phaser from 'phaser';
import createGameConfig from '../game/config.js';

function PhaserGame() {
    const containerRef = useRef(null);
    const gameRef = useRef(null);

    useEffect(() => {
        if (gameRef.current) return;

        const config = createGameConfig(containerRef.current);
        gameRef.current = new Phaser.Game(config);

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{ width: '100vw', height: '100vh' }}
        />
    );
}

export default PhaserGame;
