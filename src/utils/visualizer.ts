// src/utils/visualizer.ts

// カラーパレットの定義 (Viridis-like)
const palette = [
    { value: 0, color: [253, 231, 37] },   // "#FDE725"
    { value: 0.2, color: [34, 168, 132] }, // "#22A884"
    { value: 0.4, color: [42, 120, 142] }, // "#2A788E"
    { value: 0.6, color: [62, 74, 137] },  // "#3E4A89"
    { value: 0.8, color: [72, 40, 120] },  // "#482878"
    { value: 1, color: [68, 1, 84] }       // "#440154"
];

// 値に基づいて色を線形補間する関数
export function interpolateColor(value: number): [number, number, number] {
    if (isNaN(value) || value <= palette[0].value) return palette[0].color as [number, number, number];
    if (value >= palette[palette.length - 1].value) return palette[palette.length - 1].color as [number, number, number];

    for (let i = 0; i < palette.length - 1; i++) {
        const start = palette[i];
        const end = palette[i + 1];
        if (value >= start.value && value <= end.value) {
            const t = (value - start.value) / (end.value - start.value);
            return [
                Math.round(start.color[0] + t * (end.color[0] - start.color[0])),
                Math.round(start.color[1] + t * (end.color[1] - start.color[1])),
                Math.round(start.color[2] + t * (end.color[2] - start.color[2]))
            ];
        }
    }
    return palette[palette.length - 1].color as [number, number, number];
}

// 値を 0〜1 に正規化 (対数スケールを適用)
export function normalizeLogScale(value: number, min: number, max: number): number {
    if (value <= min) return 0;
    if (value >= max) return 1;
    const logMin = Math.log(min + 1); // +1 を加えて log(0) を回避
    const logMax = Math.log(max + 1);
    const logValue = Math.log(value + 1);
    return (logValue - logMin) / (logMax - logMin);
}

// グリッドを描画する関数
export function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, xRange: [number, number], yRange: [number, number], interval = 0.5, color = 'rgba(220, 220, 220, 0.4)') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([5, 5]);

    // Vertical lines
    for (let x = Math.ceil(xRange[0] / interval) * interval; x <= xRange[1]; x += interval) {
        const canvasX = ((x - xRange[0]) / (xRange[1] - xRange[0])) * width;
        ctx.beginPath();
        ctx.moveTo(canvasX, 0);
        ctx.lineTo(canvasX, height);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = Math.ceil(yRange[0] / interval) * interval; y <= yRange[1]; y += interval) {
        const canvasY = height - ((y - yRange[0]) / (yRange[1] - yRange[0])) * height;
        ctx.beginPath();
        ctx.moveTo(0, canvasY);
        ctx.lineTo(width, canvasY);
        ctx.stroke();
    }

    ctx.setLineDash([]);
}

// 目盛りを描画する関数
export function drawAxesWithTicks(ctx: CanvasRenderingContext2D, width: number, height: number, xRange: [number, number], yRange: [number, number], interval = 0.5, color = 'white') {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';

    // X-axis ticks (Corrected loop)
    for (let x = Math.ceil(xRange[0] / interval) * interval; x <= xRange[1]; x += interval) {
        if (x > xRange[0] && x < xRange[1]) { // Avoid drawing on the very edges
            const canvasX = ((x - xRange[0]) / (xRange[1] - xRange[0])) * width;
            ctx.textAlign = 'center';
            ctx.fillText(x.toFixed(1), canvasX, height - 10);
        }
    }

    // Y-axis ticks (Corrected loop)
    for (let y = Math.ceil(yRange[0] / interval) * interval; y <= yRange[1]; y += interval) {
        if (y > yRange[0] && y < yRange[1]) { // Avoid drawing on the very edges
            const canvasY = height - ((y - yRange[0]) / (yRange[1] - yRange[0])) * height;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(y.toFixed(1), 25, canvasY);
        }
    }
}

// 点を描画する関数
export function drawPoint(ctx: CanvasRenderingContext2D, width: number, height: number, x: number, y: number, xRange: [number, number], yRange: [number, number], color = 'red', size = 3) {
    const canvasX = ((x - xRange[0]) / (xRange[1] - xRange[0])) * width;
    const canvasY = height - ((y - yRange[0]) / (yRange[1] - yRange[0])) * height; // Y軸を反転

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, size, 0, 2 * Math.PI);
    ctx.fill();
}

// 軌跡を描画する関数
export function drawPath(ctx: CanvasRenderingContext2D, width: number, height: number, history: {x: number, y: number}[], xRange: [number, number], yRange: [number, number], color = 'white') {
    if (history.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const startX = ((history[0].x - xRange[0]) / (xRange[1] - xRange[0])) * width;
    const startY = height - ((history[0].y - yRange[0]) / (yRange[1] - yRange[0])) * height;
    ctx.moveTo(startX, startY);

    for (let i = 1; i < history.length; i++) {
        const canvasX = ((history[i].x - xRange[0]) / (xRange[1] - xRange[0])) * width;
        const canvasY = height - ((history[i].y - yRange[0]) / (yRange[1] - yRange[0])) * height;
        ctx.lineTo(canvasX, canvasY);
    }
    ctx.stroke();
}