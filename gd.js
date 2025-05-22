// gd.js

// Rosenbrock関数
function rosenbrock(x, y) {
    return Math.pow(1 - x, 2) + 100 * Math.pow(y - x * x, 2);
}

let abortController = null; // AbortController を保持する変数

let speed = 50; // デフォルトのスピード
// スピードを設定する関数
function setSpeed(newSpeed) {
    speed = newSpeed;
}

let learningRate = 0.001; // 学習率
function setLearningRate(newLearningRate) {
    learningRate = newLearningRate;
}

let momentum = 0.9; // モーメンタム
function setMomentum(newMomentum) {
    momentum = newMomentum;
}

function startOptimization(functionType, optimizerType, initialX, initialY) {
    // 既存の最適化を中断
    if (abortController) {
        abortController.abort(); // 前回の最適化を中断
        sleep(speed*1.5); // 中断後の待機時間
    }

    // 新しい AbortController を作成
    abortController = new AbortController();
    const signal = abortController.signal;

    var xRange;
    var yRange;
    var resolution;

    // 最適化する関数を指定
    var optim_func;
    if (functionType === 'rosenbrock') {
        optim_func = rosenbrock;
        xRange = [-2, 2];
        yRange = [-1, 3];
        resolution = [0, 2000];
    }

    // キャンバスをクリア
    const canvas = document.getElementById('heatmapCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ヒートマップを描画
    drawHeatmap('heatmapCanvas', optim_func, xRange, yRange, resolution);
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
    } else if (optimizerType === 'metropolis') {
        optimizer = new MetropolisOptimizer(20, 0.9, optim_func);
    } else if (optimizerType === 'newtonraphson') {
        optimizer = new NewtonRaphsonOptimizer(optim_func);
    }

    // 初期値
    let x = initialX;
    let y = initialY;
    drawPoint('heatmapCanvas', x, y, xRange, yRange, 'white', 3);

    // 最適化ループ
    (async () => {
        try {
            for (let step = 0; step < 10000; step++) {
                // 中断が要求された場合は例外をスロー
                if (signal.aborted) {
                    throw new Error('Optimization aborted');
                }

                const { gradX, gradY } = gradient(x, y, optim_func);
                const result = optimizer.update(x, y, gradX, gradY);
                x = result.x;
                y = result.y;
                drawPoint('heatmapCanvas', x, y, xRange, yRange, 'white', 3);

                step_txt = document.createElement('p');
                step_txt.textContent = `Step: ${step}`;
                document.getElementById('stepCount').innerHTML = ''; // 既存のテキストをクリア
                document.getElementById('stepCount').appendChild(step_txt);

                // 収束判定
                if (Math.abs(gradX) < 1e-6 && Math.abs(gradY) < 1e-6) {
                    console.log(`Converged at step ${step}`);
                    console.log(`x: ${x}, y: ${y}`);
                    console.log(`f(x, y): ${optim_func(x, y)}`);
                    console.log(`Gradient: (${gradX}, ${gradY})`);
                    break;
                }

                let waitTime = 1000 / speed;;
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