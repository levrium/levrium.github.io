class Factorization {
    constructor() {
        var button = document.querySelector("#factorization button");
        var input = document.querySelector('#factorization input[type="text"]');
        button.onclick = () => {
            if (input.value === "") {
                return;
            }
            try {
                var n = BigInt(input.value);
                if (n < 0n) {
                    throw RangeError;
                }
                this.factorize(n);
            }
            catch (e) {
                alert("无效的数字");
            }
        };
    }
    factorize(n) {
        function sqrt(n) {
            if (n <= Number.MAX_SAFE_INTEGER) {
                return BigInt(~~(Number(n) ** 0.5));
            }
            var array = String(n).split("").map(Number);
            if (array.length % 2 === 1) {
                array.unshift(0);
            }
            var length = array.length / 2;
            var remainder = 0n;
            var result = [];
            for (let i = 0; i < length; i++) {
                remainder = remainder * 100n + BigInt(array.shift()) * 10n + BigInt(array.shift());
                let a = BigInt(result.join("")) * 20n;
                let j = 0n;
                for (; j < 10n && j * (a + j) <= remainder; j++) {}
                result.push(--j);
                remainder -= j * (a + j);
            }
            return BigInt(result.join(""));
        }
        function* Calc(n) {
            if (n === 0n || n === 1n) {
                return [n];
            }
            var factors = {};
            while (n % 2n === 0n) {
                factors[2n] = (factors[2n] || 0) + 1;
                n /= 2n;
            }
            while (n % 3n === 0n) {
                factors[3n] = (factors[3n] || 0) + 1;
                n /= 3n;
            }
            var limit = sqrt(n);
            for (let i = 5n; i <= limit; ) {
                while (n % i === 0n) {
                    factors[i] = (factors[i] || 0) + 1;
                    n /= i;
                    limit = sqrt(n);
                }
                i += 2n;
                while (n % i === 0n) {
                    factors[i] = (factors[i] || 0) + 1;
                    n /= i;
                    limit = sqrt(n);
                }
                i += 4n;
                yield [factors, n, i, limit];
            }
            if (n > 1n) {
                factors[n] = (factors[n] || 0) + 1;
            }
            return [factors, 1n, limit, limit];
        }
        var button = document.querySelector("#factorization button");
        var output = document.querySelectorAll('#factorization input[type="text"]')[1];
        var textProgress = document.querySelector("#factorization p:last-child");
        button.disabled = "true";
        textProgress.style.display = "inline";
        var calc = Calc(n);
        function loop() {
            var result = calc.next();
            for (let i = 0; i < 65536 && !result.done; i++) {
                result = calc.next();
            }
            var factors = {...result.value[0]};
            if (result.value[1] > 1n) {
                factors[result.value[1]] = (factors[result.value[1]] || 0) + 1;
            }
            var list = Object.keys(factors);
            list = list.map(item => factors[item] > 1 ? `${item}^${factors[item]}` : item);
            output.value = `${n} = ${list.join(" × ")}`;
            var progress = String(result.value[2] * 1000000n / result.value[3]);
            while (progress.length < 5) {
                progress = "0" + progress;
            }
            progress = progress.split("");
            progress.splice(-4, 0, ".");
            progress = progress.join("");
            textProgress.innerText = `${progress}% (${result.value[2]} / ${result.value[3]})`;
            if (result.done) {
                button.disabled = "";
                textProgress.style.display = "none";
            }
            else {
                setTimeout(loop, 1);
            }
        }
        loop();
    }
}