class BaseConversion {
    constructor() {
        document.querySelectorAll("#base-conversion .base").forEach((e, i) => e.oninput = () => {
            var base = Number(document.querySelectorAll("#base-conversion .base")[i].value);
            var sequence = document.querySelectorAll("#base-conversion .sequence")[i];
            if (!isNaN(base) && base >= 2 && base <= 256 && base % 1 === 0) {
                sequence.value = this.getText(base);
            }
            this.main();
        }, this);
        document.querySelector("#base-conversion .number").oninput = () => this.main();
        document.querySelectorAll("#base-conversion .sequence").forEach(e => e.oninput = () => this.main());
        document.querySelector("#swap").onclick = () => this.swap();
    }
    plus(a, b, base) {
        if (a.length < b.length) {
            [a, b] = [b, a];
        }
        var c = 0;
        for (let i = a.length - 1; i >= 0; i--) {
            let d = i < a.length - b.length ? 0 : b[i - a.length + b.length];
            a[i] += c + d;
            c = ~~(a[i] / base);
            a[i] %= base;
        }
        if (c > 0) {
            a.unshift(c);
        }
        return a;
    }
    multiple(a, b, base) {
        var r = [];
        for (let j = 0; j < b.length; j++) {
            for (let i = 0; i < a.length; i++) {
                r.push([a[i] * b[j]].concat(new Array(a.length + b.length - i - j - 2).fill(0)));
            }
        }
        var result = [];
        for (let i = 0; i < r.length; i++) {
            result = this.plus(result, r[i], base);
        }
        return result;
    }
    power(a, b, base) {
        var result = a;
        if (b === 0) {
            return [1];
        }
        for (let i = 1; i < b; i++) {
            result = this.multiple(result, a, base);
        }
        return result;
    }
    getText(base) {
        var text = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſ";
        switch (base) {
            case 26 :
                return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            case 32 :
                return "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
            case 52 :
                return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            case 58 :
                return "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
            default :
                return text.slice(0, base);
        }
    }
    swap() {
        var inputBase = document.querySelectorAll("#base-conversion .base");
        var inputNumber = document.querySelectorAll("#base-conversion .number");
        var inputSequence = document.querySelectorAll("#base-conversion .sequence");
        var base = inputBase[0].value;
        var sequence = inputSequence[0].value;
        inputBase[0].value = inputBase[1].value;
        inputBase[1].value = base;
        inputNumber[0].value = inputNumber[1].value;
        inputSequence[0].value = inputSequence[1].value;
        inputSequence[1].value = sequence;
        this.main();
    }
    main() {
        var base1 = Number(document.querySelectorAll("#base-conversion .base")[0].value);
        var num1 = document.querySelectorAll("#base-conversion .number")[0].value;
        var text1 = document.querySelectorAll("#base-conversion .sequence")[0].value;
        var base2 = Number(document.querySelectorAll("#base-conversion .base")[1].value);
        var inputNumber = document.querySelectorAll("#base-conversion .number")[1];
        var text2 = document.querySelectorAll("#base-conversion .sequence")[1].value;
        var error = document.querySelector("#base-conversion .error");
        error.innerText = "";
        if (isNaN(base1) || base1 < 2 || base1 > 256 || base1 % 1 !== 0) {
            error.innerText = "无效的初始进制";
            return;
        }
        if (!num1) {
            error.innerText = "初始数字为空";
            return;
        }
        if (text1.length !== base1) {
            error.innerText = "无效的初始序列";
            return;
        }
        if (isNaN(base2) || base2 < 2 || base2 > 256 || base2 % 1 !== 0) {
            error.innerText = "无效的目标进制";
            return;
        }
        if (text2.length !== base2) {
            error.innerText = "无效的目标序列";
            return;
        }
        if (!/[a-z]/.test(text1)) {
            num1 = num1.toUpperCase();
        }
        if (!/[A-Z]/.test(text1)) {
            num1 = num1.toLowerCase();
        }
        var n = [];
        for (let i = 0; i < num1.length; i++) {
            let d = text1.indexOf(num1.charAt(i));
            if (d === -1) {
                error.innerText = "初始数字中有未定义的位";
                return;
            }
            else {
                n.push(d);
            }
        }
        var result = [];
        for (let i = 0; i < n.length; i++) {
            result = this.plus(result, this.multiple([n[i]], this.power([base1], n.length - i - 1, base2), base2), base2);
        }
        while (result.length > 1 && result[0] === 0) {
            result.shift();
        }
        for (let i = 0; i < result.length; i++) {
            result[i] = text2.charAt(result[i]);
        }
        inputNumber.value = result.join("");
    }
}