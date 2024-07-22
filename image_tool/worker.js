let data = [];
let gotData = false;

function calculate(startX, startY, width, height, result, mode, code) {
    function getValue(index, x, y, type) {
        if (!(index in data && [0, 1, 2, 3].includes(type))) return 0;
        if (x < 0 || x >= data[index].width || y < 0 || y >= data[index].height) return 0;
        return data[index].data[4 * (y * data[index].width + x) + type];
    }
    let standardize = value => Math.min(Math.max(Math.floor(value), 0), 255);
    eval(mode === 0 ? `function f(x, y) {
    function r(index=0, _x=x, _y=y) {return getValue(index, _x, _y, 0);}
    function g(index=0, _x=x, _y=y) {return getValue(index, _x, _y, 1);}
    function b(index=0, _x=x, _y=y) {return getValue(index, _x, _y, 2);}
    function a(index=0, _x=x, _y=y) {return getValue(index, _x, _y, 3);}
${code}
}` : `function f(x, y, type) {
    function v(index=0, _x=x, _y=y, _type=type) {return getValue(index, _x, _y, _type);}
${code}
}`);
    for (let y = startY; y < startY + height; y++) {
        for (let x = startX; x < startX + width; x++) {
            if (mode === 0) {
                let values = f(x, y);
                for (let type = 0; type < 4; type++) {
                    result.data[4 * ((y-startY)*width + (x-startX)) + type] = standardize(values[type]);
                }
            }
            else {
                for (let type = 0; type < 4; type++) {
                    result.data[4 * ((y-startY)*width + (x-startX)) + type] = standardize(f(x, y, type));
                }
            }
        }
    }
    return result;
}

onmessage = e => {
    if (gotData) postMessage([calculate(...e.data), e.data[0], e.data[1]]);
    else {
        data = e.data;
        gotData = true;
    }
};