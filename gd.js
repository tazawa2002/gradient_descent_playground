// gd.js

// Rosenbrock関数
function rosenbrock(x, y) {
    return Math.pow(1 - x, 2) + 100 * Math.pow(y - x * x, 2);
}

let abortController = null; // AbortController を保持する変数

let speed = 50; // デフォルトのスピード
// スピードを設定する関数
function setSpeed(newSpeed) {
    const parsed = Number(newSpeed);
    if (Number.isFinite(parsed) && parsed > 0) {
        speed = parsed;
    }
}

let learningRate = 0.001; // 学習率
function setLearningRate(newLearningRate) {
    const parsed = Number(newLearningRate);
    if (Number.isFinite(parsed) && parsed > 0) {
        learningRate = parsed;
    }
}

let momentum = 0.9; // モーメンタム
function setMomentum(newMomentum) {
    const parsed = Number(newMomentum);
    if (Number.isFinite(parsed)) {
        momentum = parsed;
    }
}

let decayRate = 0.9; // RMSprop の減衰率
function setDecayRate(newDecayRate) {
    const parsed = Number(newDecayRate);
    if (Number.isFinite(parsed)) {
        decayRate = parsed;
    }
}

let beta1 = 0.9; // Adam の beta1
function setBeta1(newBeta1) {
    const parsed = Number(newBeta1);
    if (Number.isFinite(parsed)) {
        beta1 = parsed;
    }
}

let beta2 = 0.999; // Adam の beta2
function setBeta2(newBeta2) {
    const parsed = Number(newBeta2);
    if (Number.isFinite(parsed)) {
        beta2 = parsed;
    }
}

let temperature = 1.0; // メトロポリス法の温度
function setTemperature(newTemperature) {
    const parsed = Number(newTemperature);
    if (Number.isFinite(parsed) && parsed > 0) {
        temperature = parsed;
    }
}

let decay = 0.99; // メトロポリス法の減衰率
function setDecay(newDecay) {
    const parsed = Number(newDecay);
    if (Number.isFinite(parsed)) {
        decay = parsed;
    }
}

function startOptimization(functionType, optimizerType, initialX, initialY) {
    // 既存の最適化を中断
    if (abortController) {
        abortController.abort(); // 前回の最適化を中断
    }

    // 新しい AbortController を作成
    abortController = new AbortController();
    const signal = abortController.signal;

    var xRange;
    var yRange;
    var resolution; // f(x,y) の範囲を指定
    var logScale = true;

    // 最適化する関数を指定
    var optim_func;
    if (functionType === 'rosenbrock') {
        optim_func = rosenbrock;
        xRange = [-2, 2];
        yRange = [-1, 3];
        resolution = [0, 2000];
    } else if (functionType === 'gaussian1') {
        optim_func = (x, y) => Math.exp(x**2 + y**2);
        xRange = [-2, 2];
        yRange = [-2, 2];
        resolution = [0, 1000];
    } else if (functionType === 'gaussian2') {
        optim_func = (x, y) => Math.exp((x/2)**2 + y**2);
        xRange = [-2, 2];
        yRange = [-2, 2];
        resolution = [0, 1000];
    } else if (functionType === 'saddle') {
        optim_func = (x, y) => x**2 - y**2;
        xRange = [-2, 2];
        yRange = [-2, 2];
        resolution = [-3, 3];
        logScale = false;
    } else if (functionType === 'beale') {
        optim_func = (x, y) => {
            return Math.pow(1.5 - x + x * y, 2) + Math.pow(2.25 - x + x * Math.pow(y, 2), 2) + Math.pow(2.625 - x + x * Math.pow(y, 3), 2);
        };
        xRange = [-4.5, 4.5];
        yRange = [-4.5, 4.5];
        resolution = [0, 2000];
    }

    // キャンバスをクリア
    const canvas = document.getElementById('heatmapCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ヒートマップを描画
    drawHeatmap('heatmapCanvas', optim_func, xRange, yRange, resolution, logScale);
    drawAxesWithTicks('heatmapCanvas', xRange, yRange, 0.5, 'white');
    drawGrid('heatmapCanvas', xRange, yRange, 0.5, 0.5, 'lightgray');

    // Optimizer の選択
    let optimizer;
    if (optimizerType === 'normal') {
        optimizer = new NormalOptimizer(learningRate);
    } else if (optimizerType === 'momentum') {
        optimizer = new MomentumOptimizer(learningRate, momentum);
    } else if (optimizerType === 'nesterov') {
        optimizer = new NesterovOptimizer(learningRate, momentum, optim_func);
    } else if (optimizerType === 'adagrad') {
        optimizer = new AdaGradOptimizer(learningRate, optim_func);
    } else if (optimizerType === 'rmsprop') {
        optimizer = new RMSpropOptimizer(learningRate, decayRate, optim_func);
    } else if (optimizerType === 'adadelta') {
        optimizer = new AdaDeltaOptimizer(decayRate, optim_func);
    } else if (optimizerType === 'adam') {
        optimizer = new AdamOptimizer(learningRate, beta1, beta2, optim_func);
    } else if (optimizerType === 'metropolis') {
        optimizer = new MetropolisOptimizer(temperature, decay, optim_func);
    } else if (optimizerType === 'newtonraphson') {
        optimizer = new NewtonRaphsonOptimizer(optim_func);
    }


    // 初期値の設定
    let x = initialX;
    let y = initialY;

    let canvas_id = 'heatmapCanvas'; // canvasのid
    let point_color = 'white'; // 点の色
    let point_size = 3; // 点のサイズ
    drawPoint(canvas_id, x, y, xRange, yRange, point_color, point_size);

    // step x y の要素
    var step_container = document.getElementById('stepCount');
    var x_container = document.getElementById('x');
    var y_container = document.getElementById('y');

    // 最適化ループ
    (async () => {
        try {
            for (let step = 1; step < 10000; step++) {
                // 中断が要求された場合は例外をスロー
                if (signal.aborted) {
                    throw new Error('Optimization aborted');
                }

                const { gradX, gradY } = gradient(x, y, optim_func);
                const result = optimizer.update(x, y, gradX, gradY);
                x = result.x;
                y = result.y;
                drawPoint(canvas_id, x, y, xRange, yRange, point_color, point_size);

                const step_txt = document.createElement('p');
                step_txt.textContent = `Step: ${step}`;
                step_container.innerHTML = ''; // 既存のテキストをクリア
                step_container.appendChild(step_txt);

                const x_txt = document.createElement('p');
                x_txt.textContent = `x: ${x.toFixed(6)}`;
                x_container.innerHTML = ''; // 既存のテキストをクリア
                x_container.appendChild(x_txt);

                const y_txt = document.createElement('p');
                y_txt.textContent = `y: ${y.toFixed(6)}`;
                y_container.innerHTML = ''; // 既存のテキストをクリア
                y_container.appendChild(y_txt);

                // 収束判定
                if (Math.abs(gradX) < 1e-6 && Math.abs(gradY) < 1e-6) {
                    console.log(`Converged at step ${step}`);
                    console.log(`x: ${x}, y: ${y}`);
                    console.log(`f(x, y): ${optim_func(x, y)}`);
                    console.log(`Gradient: (${gradX}, ${gradY})`);
                    break;
                }

                const waitTime = 1000 / speed;
                await sleep(waitTime); // ユーザー指定のスピードで待機
            }
        } catch (error) {
            if (error.message === 'Optimization aborted') {
                console.log('Optimization was aborted.');
            } else {
                console.error(error);
            }
        }
    })();
}

function stopOptimization() {
    if (abortController) {
        abortController.abort(); // 現在の最適化を中断
        console.log('Optimization stopped.');
    }
}
