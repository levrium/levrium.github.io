class Base64 {
    constructor() {
        this.sequence = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        let [encodeButton, decodeButton, swapButton] = document.querySelectorAll("#base64 button");
        let [input, output] = document.querySelectorAll("#base64 textarea");
        encodeButton.onclick = () => {
            try {
                output.value = this.encode(input.value);
            }
            catch (error) {
                alert(error);
            }
        };
        decodeButton.onclick = () => {
            try {
                output.value = this.decode(input.value);
            }
            catch (error) {
                alert(error);
            }
        };
        swapButton.onclick = () => this.swap();
    }
    encode(string) {
        let result = "";
        let bytes = [];
        for (let i in string) {
            let code = string.charCodeAt(i);
            if (code < 0x80) {
                bytes.push(code);
            }
            else if (code < 0x800) {
                bytes.push(code >> 6 & 0x1F | 0xC0);
                bytes.push(code & 0x3F | 0x80);
            }
            else if (code < 0x10000) {
                bytes.push(code >> 12 & 0x0F | 0xE0);
                bytes.push(code >> 6 & 0x3F | 0x80);
                bytes.push(code & 0x3F | 0x80);
            }
            else if (code < 0x200000) {
                bytes.push(code >> 18 & 0x07 | 0xF0);
                bytes.push(code >> 12 & 0x3F | 0x80);
                bytes.push(code >> 6 & 0x3F | 0x80);
                bytes.push(code & 0x3F | 0x80);
            }
            else throw "RangeError: Char code too large";
        }
        while (bytes.length >= 3) {
            let b = [bytes.shift(), bytes.shift(), bytes.shift()];
            result += this.sequence[b[0] >> 2];
            result += this.sequence[(b[0] & 0x03) << 4 | b[1] >> 4];
            result += this.sequence[(b[1] & 0x0F) << 2 | b[2] >> 6];
            result += this.sequence[b[2] & 0x3F];
        }
        if (bytes.length == 2) {
            result += this.sequence[bytes[0] >> 2];
            result += this.sequence[(bytes[0] & 0x03) << 4 | bytes[1] >> 4];
            result += this.sequence[(bytes[1] & 0x0F) << 2];
            result += this.sequence[64];
        }
        else if (bytes.length == 1) {
            result += this.sequence[bytes[0] >> 2];
            result += this.sequence[(bytes[0] & 0x03) << 4];
            result += this.sequence[64].repeat(2);
        }
        return result;
    }
    decode(string) {
        let result = "";
        let bytes = [];
        string = string.replaceAll(this.sequence[64], "");
        for (let i of string) {
            if (!this.sequence.includes(i)) throw "RangeError: Invalid character";
        }
        for (let i = 0; i + 4 < string.length; i += 4) {
            let b = [this.sequence.indexOf(string[i]), this.sequence.indexOf(string[i + 1]), this.sequence.indexOf(string[i + 2]), this.sequence.indexOf(string[i + 3])];
            bytes.push(b[0] << 2 | b[1] >> 4);
            bytes.push((b[1] & 0x0F) << 4 | b[2] >> 2);
            bytes.push((b[2] & 0x03) << 6 | b[3]);
        }
        let remain = [...string.substring(string.length - string.length % 4)].map(c => this.sequence.indexOf(c));
        if (remain.length == 3) {
            bytes.push(remain[0] << 2 | remain[1] >> 4);
            bytes.push((remain[1] & 0x0F) << 4 | remain[2] >> 2);
        }
        else if (remain.length == 2) {
            bytes.push(remain[0] << 2 | remain[1] >> 4);
        }
        console.log(bytes);
        let currentChar = 0;
        for (let i of bytes) {
            let s = i.toString(2).padStart(8, "0");
            let count = 0;
            let j = 0;
            while (s[j] == "1") j++;
            let r = s.substring(j + 1);
            if (r.length != 6 && currentChar != 0) {
                result += String.fromCharCode(currentChar);
                currentChar = 0;
            }
            currentChar <<= r.length;
            currentChar += Number.parseInt(r, 2);
        }
        result += String.fromCharCode(currentChar);
        return result;
    }
    swap() {
        let [input, output] = document.querySelectorAll("#base64 textarea");
        [input.value, output.value] = [output.value, input.value];
    }
}