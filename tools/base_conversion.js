class BaseConversion {
    constructor() {
        this.baseLimit = 512n;
        let inputsBase = document.querySelectorAll("#base-conversion .base");
        let inputsNumber = document.querySelectorAll("#base-conversion .number");
        let inputsSequence = document.querySelectorAll("#base-conversion .sequence");
        let textError = document.querySelector("#base-conversion .error");
        let execute = () => {
            try {
                inputsNumber[1].value = this.main(inputsNumber[0].value, BigInt(inputsBase[0].value), BigInt(inputsBase[1].value), inputsSequence[0].value, inputsSequence[1].value);
                textError.innerText = "";
            }
            catch (error) {
                textError.innerText = error;
            }
        };
        inputsBase.forEach((e, i) => {
            e.oninput = () => {
                let value = BigInt(e.value.split("").filter(i => i >= "0" && i <= "9").join(""));
                e.value = value;
                if (value >= 2n && value <= this.baseLimit && inputsSequence[i].value.length != value) inputsSequence[i].value = this.getSequence(value);
                execute();
            };
            e.onchange = () => {
                let value = BigInt(e.value);
                if (value < 2n) value = 2n;
                if (value > this.baseLimit) value = this.baseLimit;
                e.value = value;
                if (inputsSequence[i].value.length != value) inputsSequence[i].value = this.getSequence(value);
                execute();
            };
        }, this);
        [inputsNumber[0], ...inputsSequence].forEach(e => e.oninput = execute);
        document.querySelector(".swap").onclick = this.swap;
    }
    getSequence(base) {
        const sequence = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/" + new Array(448).fill(0).map((item, i) => String.fromCharCode(i + 192)).join("");
        switch (base) {
            case 26n:
                return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            case 32n:
                return "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
            case 52n:
                return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            case 58n:
                return "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
            default:
                return sequence.slice(0, Number(base));
        }
    }
    swap() {
        let inputsBase = document.querySelectorAll("#base-conversion .base");
        let inputsNumber = document.querySelectorAll("#base-conversion .number");
        let inputsSequence = document.querySelectorAll("#base-conversion .sequence");
        [inputsBase[0].value, inputsBase[1].value] = [inputsBase[1].value, inputsBase[0].value];
        [inputsNumber[0].value, inputsNumber[1].value] = [inputsNumber[1].value, inputsNumber[0].value];
        [inputsSequence[0].value, inputsSequence[1].value] = [inputsSequence[1].value, inputsSequence[0].value];
    }
    gcd(a, b) {
        if (a === 0n && b === 0n) return 1n;
        if (a < b) [a, b] = [b, a];
        while (b !== 0n) [a, b] = [b, a % b];
        return a;
    }
    parse(n, base) {
        let result = 0n;
        for (let i of n) result = result * base + i;
        return result;
    }
    convert(n, base1, base2) {
        // convert n to m + p / q
        let m = this.parse(n.intPart, base1);
        let p = this.parse(n.fracPart, base1);
        let q = base1 ** BigInt(n.repetend.length) - 1n || 1n;
        p = p * q + this.parse(n.repetend, base1);
        q *= base1 ** BigInt(n.fracPart.length);
        if (p === q) {
            ++m;
            p = 0n;
            q = 1n;
        }
        else {
            let d = this.gcd(p, q);
            p /= d;
            q /= d;
        }
        
        // convert to result
        let result = {intPart: [], fracPart: [], repetend: []};
        let remainders = [p];
        do {
            result.intPart.unshift(m % base2);
            m /= base2;
        }
        while (m > 0n);
        while (p > 0n) {
            p *= base2;
            result.fracPart.push(p / q);
            p %= q;
            let index = remainders.indexOf(p);
            if (index !== -1) {
                result.repetend = result.fracPart.slice(index);
                result.fracPart = result.fracPart.slice(0, index);
                break;
            }
            remainders.push(p);
        }
        return result;
    }
    main(input, base1, base2, sequence1, sequence2) {
        if (base1 < 2n || base1 > this.baseLimit) throw "无效的进制：" + base1;
        if (base2 < 2n || base2 > this.baseLimit) throw "无效的进制：" + base2;
        if (sequence1.length != base1 || new Set(sequence1).size != base1) throw "无效的序列：" + sequence1;
        if (sequence2.length != base2 || new Set(sequence2).size != base2) throw "无效的序列：" + sequence2;
        if (/[\.\[\]]/.test(sequence1 + sequence2)) throw "序列不能包含点或方括号";
        if (input.length === 0) return "";
        if (!/[a-z]/.test(sequence1)) input = input.toUpperCase();
        if (!/[A-Z]/.test(sequence1)) input = input.toLowerCase();
        
        let n = {intPart: [], fracPart: [], repetend: []};
        let status = 0; // 0.1[2]
        for (let i of input) {
            if (!(sequence1 + ".[]").includes(i)) throw "无效的字符：" + i;
            switch (status) {
                case 0:
                    if (i === "[" || i === "]") throw "语法错误";
                    if (i === ".") ++status;
                    else n.intPart.push(BigInt(sequence1.indexOf(i)));
                    break;
                case 1:
                    if (i === "." || i === "]") throw "语法错误";
                    if (i === "[") ++status;
                    else n.fracPart.push(BigInt(sequence1.indexOf(i)));
                    break;
                case 2:
                    if (i === "." || i === "[") throw "语法错误";
                    if (i === "]") ++status;
                    else n.repetend.push(BigInt(sequence1.indexOf(i)));
                    break;
                default:
                    throw "语法错误";
            }
        }
        
        let result = this.convert(n, base1, base2);
        let output = result.intPart.map(i => sequence2[i]).join("");
        if (result.fracPart.length > 0 || result.repetend.length > 0) output += "." + result.fracPart.map(i => sequence2[i]).join("");
        if (result.repetend.length > 0) output += `[${result.repetend.map(i => sequence2[i]).join("")}]`;
        return output;
    }
}