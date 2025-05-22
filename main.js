// URLクエリパラメータを取得
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const queryParams = {};
    for (const [key, value] of params.entries()) {
        queryParams[key] = value;
    }
    return queryParams;
}

document.addEventListener('DOMContentLoaded', () => {
    const queryParams = getQueryParams();

    // 各パラメータをフォームに適用
    if (queryParams.functionType) {
        document.getElementById('functionType').value = queryParams.functionType;
    }
    if (queryParams.optimizer) {
        document.getElementById('optimizer').value = queryParams.optimizer;
    }
    if (queryParams.learningRate) {
        document.getElementById('learningRate').value = queryParams.learningRate;
    }
    if (queryParams.momentum) {
        document.getElementById('momentum').value = queryParams.momentum;
    }
    if (queryParams.initialX) {
        document.getElementById('initialX').value = queryParams.initialX;
        document.getElementById('initXValue').textContent = queryParams.initialX;
    }
    if (queryParams.initialY) {
        document.getElementById('initialY').value = queryParams.initialY;
        document.getElementById('initYValue').textContent = queryParams.initialY;
    }
    if (queryParams.speed) {
        document.getElementById('speedRange').value = queryParams.speed;
        document.getElementById('speedValue').textContent = queryParams.speed;
    }
});

// 最適化
document.getElementById('startButton').addEventListener('click', () => {
    // ユーザー入力を取得
    const functionType = document.getElementById('functionType').value;
    const optimizerType = document.getElementById('optimizer').value;
    const learningRate = parseFloat(document.getElementById('learningRate').value);
    const momentum = parseFloat(document.getElementById('momentum').value);
    const initialX = parseFloat(document.getElementById('initialX').value);
    const initialY = parseFloat(document.getElementById('initialY').value);
    const speed = parseInt(document.getElementById('speedRange').value, 10);

    // gd.js の関数を呼び出して最適化を開始
    startOptimization(functionType, optimizerType, initialX, initialY, speed);
});

document.getElementById('stopButton').addEventListener('click', () => {
    // gd.js の関数を呼び出して最適化を停止
    stopOptimization();
});

document.getElementById('initialX').addEventListener('input', (event) => {
    const XValue = event.target.value;
    document.getElementById('initXValue').textContent = XValue;
});

document.getElementById('initialY').addEventListener('input', (event) => {
    const YValue = event.target.value;
    document.getElementById('initYValue').textContent = YValue;
});

document.getElementById('speedRange').addEventListener('input', (event) => {
    const speedValue = event.target.value;
    document.getElementById('speedValue').textContent = speedValue;
    setSpeed(speedValue);
});

document.getElementById('learningRate').addEventListener('input', (event) => {
    const learningRate = event.target.value;
    setLearningRate(learningRate);
});
document.getElementById('momentum').addEventListener('input', (event) => {
    const momentum = event.target.value;
    setMomentum(momentum);
});

function generateURL() {
    const baseUrl = window.location.origin + window.location.pathname;

    // 各フォームの値を取得
    const functionType = document.getElementById('functionType').value;
    const optimizer = document.getElementById('optimizer').value;
    const learningRate = document.getElementById('learningRate').value;
    const momentum = document.getElementById('momentum').value;
    const initialX = document.getElementById('initialX').value;
    const initialY = document.getElementById('initialY').value;
    const speed = document.getElementById('speedRange').value;

    // クエリパラメータを作成
    const params = new URLSearchParams({
        functionType,
        optimizer,
        learningRate,
        momentum,
        initialX,
        initialY,
        speed,
    });

    // 完成したURLを返す
    return `${baseUrl}?${params.toString()}`;
}

// 画像の取得
function getCanvasImage() {
    const canvas = document.getElementById('heatmapCanvas');
    return canvas.toDataURL('image/png'); // PNG形式のデータURLを取得
}

// クリップボードに画像をコピー
async function copyCanvasToClipboard(imageDataUrl) {
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();

    await navigator.clipboard.write([
        new ClipboardItem({
            'image/png': blob,
        }),
    ]);
}

// Xの投稿ボタンのクリックイベント
document.getElementById('tweetButton').addEventListener('click', async () => {
    const url = generateURL(); // 現在の設定からURLを生成
    const text = "Gradient Descent Playgroundで勾配法の結果を共有します。"; // 投稿するテキスト
    const hashtags = "gradient_descent_playground"; // ハッシュタグ（カンマ区切り）
    const twitterUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}&hashtags=${encodeURIComponent(hashtags)}`;
    
    // 画像を取得してクリップボードにコピー
    const imageDataUrl = getCanvasImage();
    try {
        await copyCanvasToClipboard(imageDataUrl);
        alert('画像をクリップボードにコピーしました！投稿に貼り付けることができます。');
    } catch (err) {
        console.error('Failed to copy canvas image to clipboard:', err);
        alert('画像をクリップボードにコピーできませんでした。');
    }

    // 新しいタブでTwitterの投稿画面を開く
    window.open(twitterUrl, '_blank');
});