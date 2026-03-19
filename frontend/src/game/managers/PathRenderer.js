export default class PathRenderer {
    draw(graphics, pointPositions, targetIndex, themeColor) {
        graphics.clear();
        if (targetIndex < 1) return;

        graphics.lineStyle(4, themeColor || 0xffffff, 0.4);
        graphics.beginPath();
        graphics.moveTo(pointPositions[0].x, pointPositions[0].y);
        for (let i = 1; i <= targetIndex; i++) {
            graphics.lineTo(pointPositions[i].x, pointPositions[i].y);
        }
        graphics.strokePath();
    }

    clear(graphics) {
        graphics.clear();
    }
}
