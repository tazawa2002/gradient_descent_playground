// optimizer.js

// 数値微分を用いて勾配を計算する関数
function gradient(x, y, func) {
    const epsilon = 1e-6;
    const gradX = (func(x + epsilon, y) - func(x - epsilon, y)) / (2 * epsilon);
    const gradY = (func(x, y + epsilon) - func(x, y - epsilon)) / (2 * epsilon);
    return { gradX, gradY };
}

// 基本のOptimizerクラス
class Optimizer {
    update(x, y, gradX, gradY) {
        throw new Error("update() must be implemented in subclasses");
    }
}

// NormalOptimizer (通常の勾配降下法)
class NormalOptimizer extends Optimizer {
    constructor(learningRate) {
        super();
        this.learningRate = learningRate;
    }

    update(x, y, gradX, gradY) {
        x -= this.learningRate * gradX;
        y -= this.learningRate * gradY;
        return { x, y };
    }
}

// MomentumOptimizer (モーメンタム法)
class MomentumOptimizer extends Optimizer {
    constructor(learningRate, momentum) {
        super();
        this.learningRate = learningRate;
        this.momentum = momentum;
        this.velX = 0;
        this.velY = 0;
    }

    update(x, y, gradX, gradY) {
        this.velX = this.momentum * this.velX - this.learningRate * gradX;
        this.velY = this.momentum * this.velY - this.learningRate * gradY;
        x += this.velX;
        y += this.velY;
        return { x, y };
    }
}

// NesterovOptimizer (ネステロフの加速勾配法)
class NesterovOptimizer extends Optimizer {
    constructor(learningRate, momentum, func) {
        super();
        this.learningRate = learningRate;
        this.momentum = momentum;
        this.velX = 0;
        this.velY = 0;
        this.func = func;
    }

    update(x, y, gradX, gradY) {
        const tempX = x + this.momentum * this.velX;
        const tempY = y + this.momentum * this.velY;

        const { gradX: gradTempX, gradY: gradTempY } = gradient(tempX, tempY, this.func);

        this.velX = this.momentum * this.velX - this.learningRate * gradTempX;
        this.velY = this.momentum * this.velY - this.learningRate * gradTempY;

        x += this.velX;
        y += this.velY;
        return { x, y };
    }
}

// AdaGradOptimizer
class AdaGradOptimizer extends Optimizer {
    constructor(learningRate) {
        super();
        this.learningRate = learningRate;
        this.accumulatedGradX = 0;
        this.accumulatedGradY = 0;
    }

    update(x, y, gradX, gradY) {
        this.accumulatedGradX += gradX ** 2;
        this.accumulatedGradY += gradY ** 2;

        const adjustedLrX = this.learningRate / (Math.sqrt(this.accumulatedGradX) + 1e-8);
        const adjustedLrY = this.learningRate / (Math.sqrt(this.accumulatedGradY) + 1e-8);

        x -= adjustedLrX * gradX;
        y -= adjustedLrY * gradY;
        return { x, y };
    }
}

// RMSpropOptimizer
class RMSpropOptimizer extends Optimizer {
    constructor(learningRate, decayRate) {
        super();
        this.learningRate = learningRate;
        this.decayRate = decayRate;
        this.accumulatedGradX = 0;
        this.accumulatedGradY = 0;
    }

    update(x, y, gradX, gradY) {
        this.accumulatedGradX = this.decayRate * this.accumulatedGradX + (1 - this.decayRate) * gradX ** 2;
        this.accumulatedGradY = this.decayRate * this.accumulatedGradY + (1 - this.decayRate) * gradY ** 2;

        const adjustedLrX = this.learningRate / (Math.sqrt(this.accumulatedGradX) + 1e-8);
        const adjustedLrY = this.learningRate / (Math.sqrt(this.accumulatedGradY) + 1e-8);

        x -= adjustedLrX * gradX;
        y -= adjustedLrY * gradY;
        return { x, y };
    }
}

// AdamOptimizer
class AdamOptimizer extends Optimizer {
    constructor(learningRate, beta1, beta2) {
        super();
        this.learningRate = learningRate;
        this.beta1 = beta1;
        this.beta2 = beta2;
        this.mX = 0;
        this.mY = 0;
        this.vX = 0;
        this.vY = 0;
        this.t = 0;
    }

    update(x, y, gradX, gradY) {
        this.t++;

        this.mX = this.beta1 * this.mX + (1 - this.beta1) * gradX;
        this.mY = this.beta1 * this.mY + (1 - this.beta1) * gradY;

        this.vX = this.beta2 * this.vX + (1 - this.beta2) * gradX ** 2;
        this.vY = this.beta2 * this.vY + (1 - this.beta2) * gradY ** 2;

        const mXHat = this.mX / (1 - Math.pow(this.beta1, this.t));
        const mYHat = this.mY / (1 - Math.pow(this.beta1, this.t));
        const vXHat = this.vX / (1 - Math.pow(this.beta2, this.t));
        const vYHat = this.vY / (1 - Math.pow(this.beta2, this.t));

        x -= this.learningRate * mXHat / (Math.sqrt(vXHat) + 1e-8);
        y -= this.learningRate * mYHat / (Math.sqrt(vYHat) + 1e-8);
        return { x, y };
    }
}

// AdaDeltaOptimizer
class AdaDeltaOptimizer extends Optimizer {
    constructor(decayRate) {
        super();
        this.decayRate = decayRate;
        this.accumulatedGradX = 0;
        this.accumulatedGradY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
    }

    update(x, y, gradX, gradY) {
        this.accumulatedGradX = this.decayRate * this.accumulatedGradX + (1 - this.decayRate) * gradX ** 2;
        this.accumulatedGradY = this.decayRate * this.accumulatedGradY + (1 - this.decayRate) * gradY ** 2;

        const deltaX = Math.sqrt(this.deltaX + 1e-8) / Math.sqrt(this.accumulatedGradX + 1e-8) * gradX;
        const deltaY = Math.sqrt(this.deltaY + 1e-8) / Math.sqrt(this.accumulatedGradY + 1e-8) * gradY;

        x -= deltaX;
        y -= deltaY;

        this.deltaX = this.decayRate * this.deltaX + (1 - this.decayRate) * deltaX ** 2;
        this.deltaY = this.decayRate * this.deltaY + (1 - this.decayRate) * deltaY ** 2;

        return { x, y };
    }
}

// MetropolisOptimizer
class MetropolisOptimizer extends Optimizer {
    constructor(temperature, decayRate, energyFunction) {
        super();
        this.temperature = temperature;
        this.decayRate = decayRate;
        this.energyFunction = energyFunction;
        this.rng = Math.random; // JavaScriptの乱数生成
    }

    generateNormalRandom(mean, stddev) {
        // Box-Muller法で正規分布乱数を生成
        const u1 = this.rng();
        const u2 = this.rng();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return z0 * stddev + mean;
    }

    update(x, y, gradX, gradY) {
        const newX = x + this.generateNormalRandom(0, 0.1);
        const newY = y + this.generateNormalRandom(0, 0.1);

        const currentEnergy = this.energyFunction(x, y);
        const newEnergy = this.energyFunction(newX, newY);

        if (newEnergy < currentEnergy || Math.exp((currentEnergy - newEnergy) / this.temperature) > this.rng()) {
            x = newX;
            y = newY;
        }

        this.temperature *= this.decayRate; // 温度を減衰
        return { x, y };
    }
}

// NewtonRaphsonOptimizer
class NewtonRaphsonOptimizer extends Optimizer {
    constructor(func) {
        super();
        this.func = func;
    }

    calcGradientX(x, y, func) {
        const epsilon = 1e-6;
        return (func(x + epsilon, y) - func(x - epsilon, y)) / (2 * epsilon);
    }

    calcGradientY(x, y, func) {
        const epsilon = 1e-6;
        return (func(x, y + epsilon) - func(x, y - epsilon)) / (2 * epsilon);
    }

    calcHessianXX(x, y, func) {
        const epsilon = 1e-6;
        return (func(x + epsilon, y) - 2 * func(x, y) + func(x - epsilon, y)) / (epsilon ** 2);
    }

    calcHessianYY(x, y, func) {
        const epsilon = 1e-6;
        return (func(x, y + epsilon) - 2 * func(x, y) + func(x, y - epsilon)) / (epsilon ** 2);
    }

    calcHessianXY(x, y, func) {
        const epsilon = 1e-6;
        return (func(x + epsilon, y + epsilon) - func(x + epsilon, y - epsilon) - func(x - epsilon, y + epsilon) + func(x - epsilon, y - epsilon)) / (4 * epsilon ** 2);
    }

    update(x, y, gradX, gradY) {
        const hXX = this.calcHessianXX(x, y, this.func);
        const hYY = this.calcHessianYY(x, y, this.func);
        const hXY = this.calcHessianXY(x, y, this.func);

        const det = hXX * hYY - hXY * hXY;

        if (Math.abs(det) < 1e-8) {
            throw new Error("Hessian matrix is singular or nearly singular");
        }

        const invHXX = hYY / det;
        const invHYY = hXX / det;
        const invHXY = -hXY / det;

        const deltaX = invHXX * gradX + invHXY * gradY;
        const deltaY = invHXY * gradX + invHYY * gradY;

        x -= deltaX;
        y -= deltaY;

        return { x, y };
    }
}