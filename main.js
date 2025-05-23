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
        setLearningRate(queryParams.learningRate);
    }
    if (queryParams.momentum) {
        document.getElementById('momentum').value = queryParams.momentum;
        setMomentum(queryParams.momentum);
    }
    if (queryParams.decayrate) {
        document.getElementById('decayrate').value = queryParams.decayrate;
        setDecayRate(queryParams.decayrate);
    }
    if (queryParams.beta1) {
        document.getElementById('beta1').value = queryParams.beta1;
        setBeta1(queryParams.beta1);
    }
    if (queryParams.beta2) {
        document.getElementById('beta2').value = queryParams.beta2;
        setBeta2(queryParams.beta2);
    }
    if (queryParams.temperature) {
        document.getElementById('temperature').value = queryParams.temperature;
        document.getElementById('tempValue').textContent = queryParams.temperature;
        setTemperature(queryParams.temperature);
    }
    if (queryParams.decay) {
        document.getElementById('decay').value = queryParams.decay;
        document.getElementById('decayValue').textContent = queryParams.decay;
        setDecay(queryParams.decay);
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
        setSpeed(queryParams.speed);
    }

    // 変更イベントを手動でトリガー
    document.getElementById('functionType').dispatchEvent(new Event('change'));
    document.getElementById('optimizer').dispatchEvent(new Event('change'));
    document.getElementById('initialX').dispatchEvent(new Event('input'));
    document.getElementById('initialY').dispatchEvent(new Event('input'));
    document.getElementById('speedRange').dispatchEvent(new Event('input'));
    document.getElementById('learningRate').dispatchEvent(new Event('input'));
    document.getElementById('momentum').dispatchEvent(new Event('input'));
    document.getElementById('decayrate').dispatchEvent(new Event('input'));
    document.getElementById('beta1').dispatchEvent(new Event('input'));
    document.getElementById('beta2').dispatchEvent(new Event('input'));
    document.getElementById('temperature').dispatchEvent(new Event('input'));
    document.getElementById('decay').dispatchEvent(new Event('input'));
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

document.getElementById('decayrate').addEventListener('input', (event) => {
    const decayRate = event.target.value;
    setDecayRate(decayRate);
});

document.getElementById('beta1').addEventListener('input', (event) => {
    const beta1 = event.target.value;
    setBeta1(beta1);
});

document.getElementById('beta2').addEventListener('input', (event) => {
    const beta2 = event.target.value;
    setBeta2(beta2);
});

document.getElementById('temperature').addEventListener('input', (event) => {
    const temperature = event.target.value;
    document.getElementById('tempValue').textContent = temperature;
    setTemperature(temperature);
});

document.getElementById('decay').addEventListener('input', (event) => {
    const decay = event.target.value;
    document.getElementById('decayValue').textContent = decay;
    setDecay(decay);
});

document.getElementById('functionType').addEventListener('change', (event) => {
    const functionType = event.target.value;

    const initialX = document.getElementById('initialX');
    const initialY = document.getElementById('initialY');

    let xRange, yRange, xValue, yValue;

    if (functionType === 'rosenbrock') {
        xRange = [-2.0, 2.0];
        yRange = [-1.0, 3.0];
        xValue = -1.5;
        yValue = 1.5;
    } else if (functionType === 'gaussian1' || functionType === 'gaussian2') {
        xRange = [-2.0, 2.0];
        yRange = [-2.0, 2.0];
        xValue = -1.5;
        yValue = 1.5;
    } else if (functionType === 'saddle') {
        xRange = [-2.0, 2.0];
        yRange = [-2.0, 2.0];
        xValue = -1.5;
        yValue = 0.0;
    } else if (functionType === 'beale') {
        xRange = [-4.5, 4.5];
        yRange = [-4.5, 4.5];
        xValue = -0.5;
        yValue = -2.0;
    }

    setInitialValues(initialX, initialY, xRange, yRange, xValue, yValue);
});

function setInitialValues(initialX, initialY, xRange, yRange, xValue, yValue) {
    initialX.min = xRange[0];
    initialX.max = xRange[1];
    initialX.value = xValue;
    document.getElementById('initXValue').textContent = xValue;

    initialY.min = yRange[0];
    initialY.max = yRange[1];
    initialY.value = yValue;
    document.getElementById('initYValue').textContent = yValue;
}

// optimizerの選択に応じて表示を切り替える
document.getElementById('optimizer').addEventListener('change', (event) => {
    const optimizerType = event.target.value;

    // 全てのハイパーパラメータを非表示にする
    document.getElementById('learningRateContainer').style.display = 'none';
    document.getElementById('momentumContainer').style.display = 'none';
    document.getElementById('decayContainer').style.display = 'none';
    document.getElementById('adamContainer').style.display = 'none';
    document.getElementById('metropolisContainer').style.display = 'none';

    // 選択されたオプティマイザに応じて表示を切り替える
    if (optimizerType === 'normal') {
        document.getElementById('learningRateContainer').style.display = 'block';
        document.getElementById('learningRate').value = 0.001;
        setLearningRate(0.001);
    } else if (optimizerType === 'momentum' || optimizerType === 'nesterov') {
        document.getElementById('learningRateContainer').style.display = 'block';
        document.getElementById('momentumContainer').style.display = 'block';
        document.getElementById('learningRate').value = 0.001;
        document.getElementById('momentum').value = 0.9;
        setLearningRate(0.001);
        setMomentum(0.9);
    } else if (optimizerType === 'adagrad') {
        document.getElementById('learningRateContainer').style.display = 'block';
        document.getElementById('learningRate').value = 0.1;
        setLearningRate(0.1);
    } else if (optimizerType === 'rmsprop') {
        document.getElementById('learningRateContainer').style.display = 'block';
        document.getElementById('decayContainer').style.display = 'block';
        document.getElementById('learningRate').value = 0.01;
        document.getElementById('decayrate').value = 0.9;
        setLearningRate(0.01);
        setDecayRate(0.9);
    } else if (optimizerType === 'adadelta') {
        document.getElementById('decayContainer').style.display = 'block';
        document.getElementById('decayrate').value = 0.95;
        setDecayRate(0.95);
    } else if (optimizerType === 'adam') {
        document.getElementById('learningRateContainer').style.display = 'block';
        document.getElementById('adamContainer').style.display = 'block';
        document.getElementById('learningRate').value = 0.001;
        document.getElementById('beta1').value = 0.9;
        document.getElementById('beta2').value = 0.999;
        setLearningRate(0.001);
        setBeta1(0.9);
        setBeta2(0.999);
    } else if (optimizerType === 'metropolis') {
        document.getElementById('metropolisContainer').style.display = 'block';
        document.getElementById('temperature').value = 1.0;
        document.getElementById('tempValue').textContent = 1.0;
        setTemperature(1.0);
        document.getElementById('decay').value = 0.99;
        document.getElementById('decayValue').textContent = 0.99;
        setDecay(0.99);
    }
});

function generateURL() {
    const baseUrl = window.location.origin + window.location.pathname;

    // 各フォームの値を取得
    const functionType = document.getElementById('functionType').value;
    const optimizer = document.getElementById('optimizer').value;
    const learningRate = document.getElementById('learningRate').value;
    const momentum = document.getElementById('momentum').value;
    const decayRate = document.getElementById('decayrate').value;
    const beta1 = document.getElementById('beta1').value;
    const beta2 = document.getElementById('beta2').value;
    const temperature = document.getElementById('temperature').value;
    const decay = document.getElementById('decay').value;
    const initialX = document.getElementById('initialX').value;
    const initialY = document.getElementById('initialY').value;
    const speed = document.getElementById('speedRange').value;

    // クエリパラメータを作成
    const params = new URLSearchParams({
        functionType,
        optimizer,
        learningRate,
        momentum,
        decayRate,
        beta1,
        beta2,
        temperature,
        decay,
        initialX,
        initialY,
        speed,
    });

    // 完成したURLを返す
    return `${baseUrl}?${params.toString()}`;
}

// URLをクリップボードにコピー
async function copyURLToClipboard() {
    const url = generateURL(); // 現在の設定からURLを生成
    try {
        await navigator.clipboard.writeText(url);
        alert('URLをクリップボードにコピーしました！');
    } catch (err) {
        console.error('Failed to copy URL to clipboard:', err);
        alert('URLをクリップボードにコピーできませんでした。');
    }
}

// ボタンを押された時にURLをコピー
document.getElementById('copyUrlButton').addEventListener('click', copyURLToClipboard);

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
    const functionType = document.getElementById('functionType').value;
    const optimizer = document.getElementById('optimizer').value;

    // 投稿するURLとテキストを生成
    const text = `Gradient Descent Playgroundで「${functionType}」を「${optimizer}」で最適化しました！`;
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

// 画像のダウンロードボタンのクリックイベント
document.getElementById('downloadButton').addEventListener('click', () => {
    const canvas = document.getElementById('heatmapCanvas'); // ヒートマップのキャンバスを取得
    const link = document.createElement('a'); // ダウンロード用のリンクを作成
    link.download = 'gradient_descent_result.png'; // 保存するファイル名を指定
    link.href = canvas.toDataURL('image/png'); // `canvas` を画像データURLに変換
    link.click(); // リンクをクリックしてダウンロードを実行
});