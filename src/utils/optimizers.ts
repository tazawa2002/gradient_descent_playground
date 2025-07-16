// src/utils/optimizers.ts

// A small step for numerical differentiation
const h = 1e-5;

/**
 * Creates a numerical gradient function for a given 2D function using the central difference method.
 * @param f The function to differentiate, f(x, y).
 * @returns A function that computes the gradient {gx, gy} at a point (x, y).
 */
function createNumericalGradient(f: (x: number, y: number) => number): (x: number, y: number) => { gx: number; gy: number } {
    return (x: number, y: number) => {
        const gx = (f(x + h, y) - f(x - h, y)) / (2 * h);
        const gy = (f(x, y + h) - f(x, y - h)) / (2 * h);
        return { gx, gy };
    };
}

export interface OptimizableFunction {
    name: string;
    f: (x: number, y: number) => number;
    gradient: (x: number, y: number) => { gx: number; gy: number };
    range: { x: [number, number], y: [number, number] };
}

// --- Function Definitions ---

const rosenbrockFunc = (x: number, y: number) => {
    const a = 1;
    const b = 100;
    return (a - x) ** 2 + b * (y - x ** 2) ** 2;
};

const bealeFunc = (x: number, y: number) => {
    return (1.5 - x + x * y) ** 2 + (2.25 - x + x * y ** 2) ** 2 + (2.625 - x + x * y ** 3) ** 2;
};

const gaussian = (x: number, y: number, A: number, x0: number, y0: number, sx: number, sy: number) => {
    return A * Math.exp(
        -(((x - x0) ** 2) / (2 * sx ** 2) + ((y - y0) ** 2) / (2 * sy ** 2))
    );
};

const gaussian1Func = (x: number, y: number) => {
    // Sum of two Gaussians, creating two minima
    return -gaussian(x, y, 2, 1, 1, 0.5, 0.5) - gaussian(x, y, 1.5, -1, -0.5, 0.4, 0.4);
};

const gaussian2Func = (x: number, y: number) => {
    // A single Gaussian, creating one minimum
    return -gaussian(x, y, 3, 0, 0, 1, 1);
};

const saddleFunc = (x: number, y: number) => {
    return x ** 2 - y ** 2;
};


// --- Constructing the FUNCTIONS object ---

export const FUNCTIONS: { [key: string]: OptimizableFunction } = {
    rosenbrock: {
        name: "Rosenbrock",
        f: rosenbrockFunc,
        gradient: createNumericalGradient(rosenbrockFunc),
        range: { x: [-2, 2], y: [-1, 3] },
    },
    beale: {
        name: "Beale",
        f: bealeFunc,
        gradient: createNumericalGradient(bealeFunc),
        range: { x: [-4.5, 4.5], y: [-4.5, 4.5] },
    },
    gaussian1: {
        name: "Gaussian (2 Peaks)",
        f: gaussian1Func,
        gradient: createNumericalGradient(gaussian1Func),
        range: { x: [-3, 3], y: [-3, 3] },
    },
    gaussian2: {
        name: "Gaussian (1 Peak)",
        f: gaussian2Func,
        gradient: createNumericalGradient(gaussian2Func),
        range: { x: [-3, 3], y: [-3, 3] },
    },
    saddle: {
        name: "Saddle Point",
        f: saddleFunc,
        gradient: createNumericalGradient(saddleFunc),
        range: { x: [-2, 2], y: [-2, 2] },
    },
};

// --- Optimizer Types ---
export interface OptimizerState {
    [key: string]: any;
}

export interface OptimizerHyperparams {
    learningRate: number;
    [key: string]: any;
}

export interface Optimizer {
    name: string;
    createState: () => OptimizerState;
    update: (
        params: { x: number; y: number },
        grad: { gx: number; gy: number },
        state: OptimizerState,
        hyperparams: OptimizerHyperparams
    ) => {
        newParams: { x: number; y: number };
        newState: OptimizerState;
    };
}

// --- Optimizer Definitions ---
export const OPTIMIZERS: { [key: string]: Optimizer } = {
    sgd: {
        name: "SGD",
        createState: () => ({}),
        update: (params, grad, state, hyperparams) => {
            const newParams = {
                x: params.x - hyperparams.learningRate * grad.gx,
                y: params.y - hyperparams.learningRate * grad.gy,
            };
            return { newParams, newState: state };
        },
    },
    momentum: {
        name: "Momentum",
        createState: () => ({ vx: 0, vy: 0 }),
        update: (params, grad, state, hyperparams) => {
            const vx = hyperparams.momentum * state.vx - hyperparams.learningRate * grad.gx;
            const vy = hyperparams.momentum * state.vy - hyperparams.learningRate * grad.gy;
            const newParams = { x: params.x + vx, y: params.y + vy };
            return { newParams, newState: { vx, vy } };
        },
    },
    adam: {
        name: "Adam",
        createState: () => ({ m: { x: 0, y: 0 }, v: { x: 0, y: 0 }, t: 0 }),
        update: (params, grad, state, hyperparams) => {
            const beta1 = hyperparams.beta1 || 0.9;
            const beta2 = hyperparams.beta2 || 0.999;
            const epsilon = hyperparams.epsilon || 1e-8;
            const t = state.t + 1;

            const m_x = beta1 * state.m.x + (1 - beta1) * grad.gx;
            const m_y = beta1 * state.m.y + (1 - beta1) * grad.gy;

            const v_x = beta2 * state.v.x + (1 - beta2) * (grad.gx ** 2);
            const v_y = beta2 * state.v.y + (1 - beta2) * (grad.gy ** 2);

            const m_hat_x = m_x / (1 - beta1 ** t);
            const m_hat_y = m_y / (1 - beta1 ** t);

            const v_hat_x = v_x / (1 - beta2 ** t);
            const v_hat_y = v_y / (1 - beta2 ** t);

            const new_x = params.x - hyperparams.learningRate * m_hat_x / (Math.sqrt(v_hat_x) + epsilon);
            const new_y = params.y - hyperparams.learningRate * m_hat_y / (Math.sqrt(v_hat_y) + epsilon);

            return {
                newParams: { x: new_x, y: new_y },
                newState: { m: { x: m_x, y: m_y }, v: { x: v_x, y: v_y }, t },
            };
        },
    },
};