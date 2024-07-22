let $ = s => document.querySelector(s);
let $$ = s => document.querySelectorAll(s);
let imageList = [];
let mode = 0; // 0 = all, 1 = each
const SIZE = 256;
const NUMBER_OF_WORKERS = 16;

let divImages = $("#images");
let buttonAddFile = $("#add-file");
let buttonMode = $("#mode");
let buttonStart = $("#start");
let inputWidth = $("#width");
let inputHeight = $("#height");
let divAll = $("#all");
let codeAll = $("#all textarea");
let divEach = $("#each");
let codeEach = $("#each textarea");
let canvasOutput = $("#output");

function updateSize() {
    if (imageList.length === 0) return;
    let width = 0;
    let height = 0;
    for (let item of imageList) {
        if (item.width > width) width = item.width;
        if (item.height > height) height = item.height;
    }
    inputWidth.value = width;
    inputHeight.value = height;
}

function addImage(inputFile, index) {
    if (inputFile.files.length === 0) return;
    if (index === undefined) {
        for (let file of inputFile.files) {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = event => {
                let image = new Image();
                image.src = event.target.result;
                image.crossOrigin = "Anonymous";
                image.onload = () => {
                    let index = imageList.length;
                    let details = document.createElement("details");
                    let summary = document.createElement("summary");
                    summary.innerText = `Image ${index} `;
                    
                    let input = document.createElement("input");
                    input.type = "file";
                    input.onchange = () => addImage(input, index);
                    
                    let button = document.createElement("button");
                    button.innerText = "Delete";
                    button.onclick = () => removeImage(index);
                    
                    let canvas = document.createElement("canvas");
                    canvas.width = image.width;
                    canvas.height = image.height;
                    canvas.getContext("2d").drawImage(image, 0, 0);
                    
                    imageList.push(image);
                    summary.appendChild(input);
                    summary.appendChild(button);
                    details.appendChild(summary);
                    details.appendChild(canvas);
                    divImages.appendChild(details);
                    updateSize();
                };
            };
        }
    }
    else {
        let reader = new FileReader();
        reader.readAsDataURL(inputFile.files[0]);
        reader.onload = event => {
            let image = new Image();
            image.src = event.target.result;
            image.crossOrigin = "Anonymous";
            image.onload = () => {
                let canvas = $(`#images :nth-child(${index + 1}) canvas`);
                canvas.width = image.width;
                canvas.height = image.height;
                canvas.getContext("2d").drawImage(image, 0, 0);
                imageList[index] = image;
                updateSize();
            };
        };
    }
}

function removeImage(index) {
    imageList.splice(index, 1);
    $$("#images details")[index].remove();
    let summary = $$("#images summary");
    for (let i = index; i < imageList.length; i++) {
        let nodes = summary[i].childNodes;
        nodes[0].nodeValue = `Image ${i} `;
        nodes[1].onchange = () => addImage(nodes[1], i);
        nodes[2].onclick = () => removeImage(i);
    }
    updateSize();
}

buttonAddFile.onchange = () => addImage(buttonAddFile);

buttonMode.onclick = () => {
    if (mode === 0) {
        mode = 1;
        buttonMode.innerText = "Mode: each";
        divAll.style.display = "none";
        divEach.style.display = "block";
    }
    else {
        mode = 0;
        buttonMode.innerText = "Mode: all";
        divAll.style.display = "block";
        divEach.style.display = "none";
    }
};

buttonStart.onclick = () => {
    let width = Math.max(Math.floor(inputWidth.value), 1);
    let height = Math.max(Math.floor(inputHeight.value), 1);
    canvasOutput.width = width;
    canvasOutput.height = height;
    let context = canvasOutput.getContext("2d");
    let data = Array.from($$("#images canvas")).map(item => ({
        data: item.getContext("2d").getImageData(0, 0, item.width, item.height).data,
        width: item.width,
        height: item.height
    }));
    let code = (mode === 0 ? codeAll : codeEach).value;
    
    let blocks = [];
    for (let y = 0; y < height; y += SIZE) {
        for (let x = 0; x < width; x += SIZE) {
            blocks.push([x, y, Math.min(width - x, SIZE), Math.min(height - y, SIZE)]);
        }
    }
    
    for (let i = 0; i < NUMBER_OF_WORKERS; i++) {
        let worker = new Worker("worker.js");
        worker.postMessage(data);
        // message: [startX, startY, width, height, result, mode, code]
        if (blocks.length === 0) break;
        let message = blocks.shift();
        message.push(context.createImageData(message[2], message[3]), mode, code);
        worker.postMessage(message);
        worker.onmessage = e => {
            context.putImageData(...e.data);
            if (blocks.length > 0) {
                let message = blocks.shift();
                message.push(context.createImageData(message[2], message[3]), mode, code);
                worker.postMessage(message);
            }
            else worker.terminate();
        };
    }
};