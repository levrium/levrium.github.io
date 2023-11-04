class MonadicEquation {
    constructor() {
        var button = document.querySelector("#monadic-equation button");
        var input = document.querySelector("#monadic-equation input");
        var output = document.querySelector("#monadic-equation textarea");
        button.onclick = () => {
            if (input.value === "") {
                return;
            }
            var params = input.value.split(" ").filter(a => a).map(Number);
            if (params.includes(NaN)) {
                alert("参数错误");
                return;
            }
            while (params[0] === 0) {
                params.shift();
            }
            if (params.length <= 1) {
                alert("参数过少");
            }
            else {
                var result;
                switch (params.length) {
                    case 2 :
                        result = this.solveLinear(...params);
                        break;
                    case 3 :
                        result = this.solveQuadratic(...params);
                        break;
                    case 4 :
                        result = this.solveCubic(...params);
                        break;
                    case 5 :
                        result = this.solveQuartic(...params);
                        break;
                    default :
                        alert("不支持解该方程");
                        return;
                }
                result = result.map(item => {
                    if (typeof item === "object") {
                        return item[1] > 0 ? `${item[0]} + ${item[1]} i` : item[1] < 0 ? `${item[0]} - ${-item[1]} i` : item[0];
                    }
                    else {
                        return item;
                    }
                });
                output.value = result.map((item, i) => `x_${i + 1} = ${item}`).join("\n");
            }
        };
    }
    solveLinear(a, b) {
        return [-b / a];
    }
    solveQuadratic(a, b, c) {
        var Δ = b ** 2 - 4 * a * c;
        let m = -b / (2 * a);
        let n = Math.abs(Δ) ** 0.5 / (2 * a);
        return Δ >= 0 ? [m + n, m - n] : [[m, n], [m, -n]];
    }
    solveCubic(a, b, c, d) { // Fan Shengjin's formula
        var A = b ** 2 - 3 * a * c;
        var B = b * c - 9 * a * d;
        var C = c ** 2 - 3 * b * d;
        var Δ = B ** 2 - 4 * A * C;
        if (A === 0 && B === 0) {
            let x = -b / (3 * a);
            return [x, x, x];
        }
        else if (Δ === 0) {
            let k = B / A;
            let x = -k / 2;
            return [k - b / a, x, x];
        }
        else if (Δ > 0) {
            let root = (a, b) => a >= 0 ? a ** (1 / b) : -((-a) ** (1 / b));
            let y = A * b + 1.5 * a * (-B + Δ ** 0.5);
            let z = A * b + 1.5 * a * (-B - Δ ** 0.5);
            let m = root(y, 3) + root(z, 3);
            let n = root(y, 3) - root(z, 3);
            let p = (-b + 0.5 * m) / (3 * a);
            let q = (3 ** 0.5 * n) / (6 * a);
            return [(-b - m) / (3 * a), [p, q], [p, -q]];
        }
        else {
            let θ = Math.acos(b / A ** 0.5 - 3 * a * B / (2 * A ** 1.5)) / 3;
            let m = Math.sin(θ);
            let n = Math.cos(θ);
            let p = A ** 0.5;
            return [-b - 2 * p * n, -b + p * (n + 3 ** 0.5 * m), -b + p * (n - 3 ** 0.5 * m)].map(item => item / (3 * a));
        }
    }
    solveQuartic(a, b, c, d, e) { // Shen Tianheng's formula
        var D = 3 * b ** 2 - 8 * a * c;
        var E = -(b ** 3) + 4 * a * b * c - 8 * a ** 2 * d;
        var F = 3 * b ** 4 + 16 * a ** 2 * c ** 2 - 16 * a * b ** 2 * c + 16 * a ** 2 * b * d - 64 * a ** 3 * e;
        var A = D ** 2 - 3 * F;
        var B = D * F - 9 * E ** 2;
        var C = F ** 2 - 3 * D * E ** 2;
        var Δ = B ** 2 - 4 * A * C;
        if (D === 0 && E === 0 && F === 0) {
            let x = -b / (4 * a);
            return [x, x, x, x];
        }
        else if (D !== 0 && E !== 0 && F !== 0 && A === 0 && B === 0 && C === 0) {
            let m = -b / (4 * a);
            let n = (3 * E) / (4 * a * D);
            let x = m - n;
            return [m + 3 * n, x, x, x];
        }
        else if (D !== 0 && E === 0 && F === 0) {
            let m = -b / (4 * a);
            let n = Math.abs(D) ** 0.5 / (4 * a);
            return D >= 0 ? [m + n, m + n, m - n, m - n] : [[m, n], [m, n], [m, -n], [m, -n]];
        }
        else if (A !== 0 && B !== 0 && C !== 0 && Δ === 0) {
            let m = 2 * A * E / B;
            let n = 2 * B / A;
            let p = (m - b) / (4 * a);
            let q = Math.abs(n) ** 0.5 / (4 * a);
            let x = (-b - m) / (4 * a);
            return n >= 0 ? [p + q, p - q, x, x] : [[p, q], [p, -q], x, x];
        }
        else if (Δ > 0) {
            let root = (a, b) => a >= 0 ? a ** (1 / b) : -((-a) ** (1 / b));
            let z_1 = A * D + 1.5 * (-B + Δ ** 0.5);
            let z_2 = A * D + 1.5 * (-B - Δ ** 0.5);
            let m = root(z_1, 3) + root(z_2, 3);
            let z = D ** 2 - D * m + m ** 2 - 3 * A;
            let n = E > 0 ? 1 : E < 0 ? -1 : 0;
            let p = (-b + n * ((D + m) / 3) ** 0.5) / (4 * a);
            let q = ((2 * D - m + 2 * z ** 0.5) / 3) ** 0.5 / (4 * a);
            let r = (-b - n * ((D + m) / 3) ** 0.5) / (4 * a);
            let s = ((-2 * D + m + 2 * z ** 0.5) / 3) ** 0.5 / (4 * a);
            return [p + q, p - q, [r, s], [r, -s]];
        }
        else {
            let θ = Math.acos((3 * B) / (2 * A ** 1.5) - D / A ** 0.5) / 3;
            let y_1 = (D - 2 * A ** 0.5 * Math.cos(θ)) / 3;
            let y_2 = (D + A ** 0.5 * (Math.cos(θ) + 3 ** 0.5 * Math.sin(θ))) / 3;
            let y_3 = (D + A ** 0.5 * (Math.cos(θ) - 3 ** 0.5 * Math.sin(θ))) / 3;
            let m = -b / (4 * a);
            if (E === 0) {
                if (F > 0) {
                    let n = (Math.abs(D) + 2 * F ** 0.5) ** 0.5 / (4 * a);
                    let p = (Math.abs(D) - 2 * F ** 0.5) ** 0.5 / (4 * a);
                    return D > 0 ? [m + n, m - n, m + p, m - p] : [[m, n], [m, -n], [m, p], [m, -p]];
                }
                else {
                    let n = (2 * (D + (A - F) ** 0.5)) ** 0.5 / (8 * a);
                    let p = (2 * (-D + (A - F) ** 0.5)) ** 0.5 / (8 * a);
                    return [[m + n, p], [m + n, -p], [m - n, p], [m - n, -p]];
                }
            }
            else {
                let k = E > 0 ? 1 : E < 0 ? -1 : 0;
                if (D > 0 && F > 0) {
                    let n = k * y_1 ** 0.5 / (4 * a);
                    let p = (y_2 ** 0.5 + y_3 ** 0.5) / (4 * a);
                    let q = (y_2 ** 0.5 - y_3 ** 0.5) / (4 * a);
                    return [m + n + p, m + n - p, m - n + q, m - n - q];
                }
                else {
                    let n = y_2 ** 0.5 / (4 * a);
                    let p = (k * (-y_1) ** 0.5 + (-y_3) ** 0.5) / (4 * a);
                    let q = (k * (-y_1) ** 0.5 - (-y_3) ** 0.5) / (4 * a);
                    return [[m - n, p], [m - n, -p], [m + n, q], [m + n, -q]];
                }
            }
        }
    }
}

class LinearEquation {
    constructor() {
        var button = document.querySelector("#linear-equation button");
        var [input, output] = document.querySelectorAll("#linear-equation textarea");
        button.onclick = () => {
            if (input.value === "") {
                return;
            }
            try {
                var params = input.value.split("\n").filter(a => a).map(item => item.split(" ").filter(a => a).map(Number));
                var result = this.solve(params);
                if (result === null) {
                    output.value = "无解";
                }
                else if (result === undefined) {
                    output.value = "有无数个解";
                }
                else {
                    output.value = result.map((item, i) => `x_${i + 1} = ${item}`).join("\n");
                }
            }
            catch {
                alert("参数错误");
            }
        };
    }
    det(det) { // calculate determinants
        if (!det.every(item => item.length === det.length)) {
            throw RangeError;
        }
        var n = det.length;
        switch (n) {
            case 1 :
                return det[0][0];
            case 2 :
                return det[0][0] * det[1][1] - det[0][1] * det[1][0];
            case 3 :
                return det[0][0] * det[1][1] * det[2][2] - det[0][0] * det[1][2] * det[2][1] - det[0][1] * det[1][0] * det[2][2] + det[0][1] * det[1][2] * det[2][0] + det[0][2] * det[1][0] * det[2][1] - det[0][2] * det[1][1] * det[2][0];
        }
        var result = 0;
        for (let col = 0; col < n; col++) {
            let matrix = new Array(n - 1).fill(0).map(() => new Array(n - 1).fill(0));
            for (let i = 0; i < n - 1; i++) {
                for (let j = 0; j < n - 1; j++) {
                    matrix[i][j] = det[i + 1][j < col ? j : j + 1];
                }
            }
            result += (-1) ** (col % 2) * det[0][col] * this.det(matrix);
        }
        return result;
    }
    cutOut(array, n) { // cut out column n of array
        return array.map(item => item.filter((item, i) => i !== n));
    }
    solve(a) {
        if (!a.every(item => item.every(item => !isNaN(item)) && item.length === a.length + 1)) {
            throw TypeError;
        }
        var p = a.map((item, i) => ((-1) ** (a.length + i)) * this.det(this.cutOut(a, i)));
        var q = this.det(this.cutOut(a, a.length));
        if (q === 0) {
            return p[0] ? null : undefined; // null: no solution, undefined: infinite solutions
        }
        else {
            return p.map(item => item / q);
        }
    }
}