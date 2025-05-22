// カラーパレットの定義
const palette = [
    { value: 0, color: [253, 231, 37] },   // "#FDE725"
    { value: 0.2, color: [34, 168, 132] }, // "#22A884"
    { value: 0.4, color: [42, 120, 142] }, // "#2A788E"
    { value: 0.6, color: [62, 74, 137] },  // "#3E4A89"
    { value: 0.8, color: [72, 40, 120] },  // "#482878"
    { value: 1, color: [68, 1, 84] }       // "#440154"
];

// 値に基づいて色を線形補間する関数
function interpolateColor(value) {
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
    return palette[palette.length - 1].color; // デフォルトで最後の色
}

// 値を 0〜1 に正規化 (対数スケールを適用)
function normalizeLogScale(value, min, max) {
    if (value <= min) return 0;
    if (value >= max) return 1;
    const logMin = Math.log(min + 1); // +1 を加えて log(0) を回避
    const logMax = Math.log(max + 1);
    const logValue = Math.log(value + 1);
    return (logValue - logMin) / (logMax - logMin);
}

// ヒートマップを描画する関数
function drawHeatmap(canvasId, f, xRange, yRange, resolution) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas with id "${canvasId}" not found.`);
        return;
    }
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            // x, y の値を計算 (Y 軸を反転)
            const x = xRange[0] + (i / width) * (xRange[1] - xRange[0]);
            const y = yRange[1] - (j / height) * (yRange[1] - yRange[0]); // Y 軸を反転

            // f(x, y) の値を計算
            const value = f(x, y);

            // 値を 0〜1 に正規化
            // const normalizedValue = Math.min(1, Math.max(0, (value - resolution[0]) / (resolution[1] - resolution[0])));
            const normalizedValue = normalizeLogScale(value, resolution[0], resolution[1]);
            

            // カラーパレットから色を取得
            const [r, g, b] = interpolateColor(normalizedValue);

            const index = (j * width + i) * 4;
            data[index] = r;     // R
            data[index + 1] = g; // G
            data[index + 2] = b; // B
            data[index + 3] = 255; // A
        }
    }

    ctx.putImageData(imgData, 0, 0);
}

// ヒートマップに目盛りを描画する関数
function drawAxesWithTicks(canvasId, xRange, yRange, tickInterval = 1, color = 'black') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas with id "${canvasId}" not found.`);
        return;
    }
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1;

    // X軸の目盛り
    for (let x = xRange[0]+tickInterval; x <= xRange[1]-tickInterval; x += tickInterval) {
        const canvasX = ((x - xRange[0]) / (xRange[1] - xRange[0])) * width;

        // 目盛り線
        ctx.beginPath();
        ctx.moveTo(canvasX, height - 5); // 下端に目盛り
        ctx.lineTo(canvasX, height);    // 目盛りの長さ
        ctx.stroke();

        // ラベル
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(x.toFixed(1), canvasX, height - 10); // ラベルを少し上に配置
    }

    // Y軸の目盛り
    for (let y = yRange[0]+tickInterval; y <= yRange[1]-tickInterval; y += tickInterval) {
        const canvasY = height - ((y - yRange[0]) / (yRange[1] - yRange[0])) * height;

        // 目盛り線
        ctx.beginPath();
        ctx.moveTo(0, canvasY); // 左端に目盛り
        ctx.lineTo(5, canvasY); // 目盛りの長さ
        ctx.stroke();

        // ラベル
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(y.toFixed(1), 25, canvasY+4); // ラベルを少し右に配置
    }
}

function drawGrid(canvasId, xRange, yRange, xInterval = 1, yInterval = 1, color = 'lightgray') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas with id "${canvasId}" not found.`);
        return;
    }
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([5, 5]); // 点線を設定

    // 垂直線 (X軸方向)
    for (let x = xRange[0]; x <= xRange[1]; x += xInterval) {
        const canvasX = ((x - xRange[0]) / (xRange[1] - xRange[0])) * width;
        ctx.beginPath();
        ctx.moveTo(canvasX, 0);
        ctx.lineTo(canvasX, height);
        ctx.stroke();
    }

    // 水平線 (Y軸方向)
    for (let y = yRange[0]; y <= yRange[1]; y += yInterval) {
        const canvasY = height - ((y - yRange[0]) / (yRange[1] - yRange[0])) * height;
        ctx.beginPath();
        ctx.moveTo(0, canvasY);
        ctx.lineTo(width, canvasY);
        ctx.stroke();
    }

    ctx.setLineDash([]); // 点線を解除
}

// ヒートマップに点を描画する関数
function drawPoint(canvasId, x, y, xRange, yRange, color = 'red', size = 5) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas with id "${canvasId}" not found.`);
        return;
    }
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // x, y をキャンバス座標に変換
    const canvasX = ((x - xRange[0]) / (xRange[1] - xRange[0])) * width;
    const canvasY = height - ((y - yRange[0]) / (yRange[1] - yRange[0])) * height; // Y 軸を反転

    // 点を描画
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, size, 0, 2 * Math.PI);
    ctx.fill();
}

// sleep 関数を定義
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



// 使用例
document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'heatmapCanvas';
    canvas.width = 500;
    canvas.height = 500;
    document.getElementById("heatmap").appendChild(canvas);

    const xRange = [-2, 2];
    const yRange = [-1, 3];
    const resolution = [0, 2000];

    // ヒートマップ
    drawHeatmap(canvas.id, rosenbrock, xRange, yRange, resolution);

    // 目盛り
    drawAxesWithTicks('heatmapCanvas', xRange, yRange, 0.5, 'white');

    // グリッド
    drawGrid('heatmapCanvas', xRange, yRange, 0.5, 0.5, 'lightgray');
});