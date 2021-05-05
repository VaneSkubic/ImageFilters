var pos,
    ctx, canvas,
    ctxOverlay, overlay,
    imagePixels,
    width, height,
    r, g, b, v,
    red, green, blue,
    redDiff, blueDiff, greenDiff,
    imageObject,
    drag, rect,
    x, y, w, h;

init();
prepare();
prepareSliders();

function init() {

    drag = false;
    rect = {};
    x = y = w = h = 0;

    imageObject = document.getElementById("image");
    imageObject.src = "Assets/pupper.jpg";
    pos = imageObject.getBoundingClientRect();
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");

    overlay = document.getElementById("overlay");
    ctxOverlay = overlay.getContext("2d");
    overlay.addEventListener('mousedown', mouseDown, false);
    overlay.addEventListener('mouseup', mouseUp, false);
    overlay.addEventListener('mousemove', mouseMove, false);

    width = imageObject.width;
    height = imageObject.height;
    canvas.width = width;
    canvas.height = height;

    overlay.width = width;
    overlay.height = height;

}

function prepare() {

    imageObject.src = "Assets/pupper.jpg";
    ctx.drawImage(imageObject, 0, 0);
    imagePixels = ctx.getImageData(0, 0, width, height);
    pos = overlay.getBoundingClientRect();

}

function mouseDown(e) {
    clear();
    prepare();
    rect.startX = x = e.pageX - pos.left;
    rect.startY = y = e.pageY - pos.top;
    drag = true;
}

function mouseUp() {
    drag = false;
}

function mouseMove(e) {
    if (drag) {
        rect.w = w = (e.pageX - pos.left) - rect.startX;
        rect.h = h = (e.pageY - pos.top) - rect.startY;
        ctxOverlay.clearRect(0, 0, canvas.width, canvas.height);
        draw();
    }
}

function clear() {
    rect.startX = rect.startX = rect.w = rect.h = x = y = w = h = 0;
    ctxOverlay.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    ctxOverlay.lineWidth = "2";
    ctxOverlay.strokeStyle = "grey";
    ctxOverlay.beginPath();
    ctxOverlay.rect(rect.startX, rect.startY, rect.w, rect.h);
    ctxOverlay.fillStyle = "#78787873";
    ctxOverlay.fill();
    ctxOverlay.stroke();
    ctxOverlay.closePath();
}

function updateImage() {

    if (w != 0) {
        ctx.putImageData(imagePixels, 0, 0, x, y, w, h);
    } else {
        ctx.putImageData(imagePixels, 0, 0, 0, 0, imagePixels.width, imagePixels.height);
    }
    ctxOverlay.clearRect(0, 0, canvas.width, canvas.height);
    imageObject.src = canvas.toDataURL();

}

function normal() {

    prepare();
    updateImage();

}

function toGrayScale() {

    resetSliders();
    prepare();

    for (var i = 0; i < imagePixels.data.length; i += 4) {
        yvalue = imagePixels.data[i] * 0.299 +
            imagePixels.data[i + 1] * 0.587 +
            imagePixels.data[i + 2] * 0.114;
        for (var j = 0; j < 3; j++) {
            imagePixels.data[i + j] = yvalue;
        }
    }

    updateImage();

}

function negative() {

    resetSliders();
    prepare();

    for (var i = 0; i < imagePixels.data.length; i += 4) {
        for (var j = 0; j < 3; j++) {
            imagePixels.data[i + j] = 255 - imagePixels.data[i + j];
        }
    }

    updateImage();

}

function gammaCorrection() {

    resetSliders();
    prepare();

    const gammaValue = prompt("Input value (0 - 30)");

    for (var i = 0; i < imagePixels.data.length; i += 4) {
        for (var j = 0; j < 3; j++) {
            imagePixels.data[i + j] = 255 * Math.pow((imagePixels.data[i + j] / 255), gammaValue);
        }
    }

    updateImage();

}

function threshold() {

    resetSliders();
    prepare();

    do {
        var threshold = prompt("Input threshold (0 - 255)");
    } while (!(threshold > 0 && threshold < 255));


    for (var i = 0; i < imagePixels.data.length; i += 4) {
        r = imagePixels.data[i];
        g = imagePixels.data[i + 1];
        b = imagePixels.data[i + 2];
        if (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold)
            v = 255;
        else
            v = 0;
        imagePixels.data[i] = imagePixels.data[i + 1] = imagePixels.data[i + 2] = v;
    }

    updateImage();
}

function boxBlur() {

    resetSliders();
    prepare();

    var imagePixelsRaw = ctx.getImageData(0, 0, width, height);

    for (var i = 0; i < imagePixels.data.length; i++) {
        for (var j = 0; j < 3; j++) {
            sum = imagePixels.data[i + j] +
                imagePixels.data[i + j + 4] +
                imagePixels.data[i + j - 4] +
                imagePixels.data[i + j - imagePixels.width * 4] +
                imagePixels.data[i + j + imagePixels.width * 4] +
                imagePixels.data[i + j + 4 - imagePixels.width * 4] +
                imagePixels.data[i + j - 4 - imagePixels.width * 4] +
                imagePixels.data[i + j + 4 + imagePixels.width * 4] +
                imagePixels.data[i + j - 4 + imagePixels.width * 4];
            sum /= 9;
            if (sum >= 0 && sum <= 255) {
                imagePixelsRaw.data[i + j] = sum;
            }
        }

    }

    imagePixels = imagePixelsRaw;

    updateImage();

}

function gaussianBlur() {

    resetSliders();
    prepare();

    var imagePixelsRaw = ctx.getImageData(0, 0, width, height);

    for (var i = 0; i < imagePixels.data.length; i += 4) {
        for (var j = 0; j < 3; j++) {
            sum = (imagePixels.data[i + j] * 4) +
                (imagePixels.data[i + j + 4] * 2) +
                (imagePixels.data[i + j - 4] * 2) +
                (imagePixels.data[i + j - imagePixels.width * 4] * 2) +
                (imagePixels.data[i + j + imagePixels.width * 4] * 2) +
                (imagePixels.data[i + j + 4 - imagePixels.width * 4]) +
                (imagePixels.data[i + j - 4 - imagePixels.width * 4]) +
                (imagePixels.data[i + j + 4 + imagePixels.width * 4]) +
                (imagePixels.data[i + j - 4 + imagePixels.width * 4]);
            sum /= 16;
            if (sum >= 0 && sum <= 255) {
                imagePixelsRaw.data[i + j] = sum;
            }
        }
    }

    imagePixels = imagePixelsRaw;

    updateImage();

}

function laplace() {

    resetSliders();
    toGrayScale();

    var imagePixelsRaw = ctx.getImageData(0, 0, width, height);

    for (var i = 0; i < imagePixels.data.length; i += 4) {
        sum =
            (imagePixels.data[i] * -4) +
            (imagePixels.data[i + 4] * 1) +
            (imagePixels.data[i - 4] * 1) +
            (imagePixels.data[i - (imagePixels.width * 4)] * 1) +
            (imagePixels.data[i + (imagePixels.width * 4)] * 1);
        for (var j = 0; j < 3; j++) {
            if (sum < 0) {
                imagePixelsRaw.data[i + j] = 0;
            } else if (sum > 255) {
                imagePixelsRaw.data[i + j] = 255;
            } else if (sum <= 255 && sum >= 0) {
                imagePixelsRaw.data[i + j] = sum;
            } else {
                imagePixelsRaw.data[i + j] = imagePixels.data[i + j];
            }
        }
    }

    imagePixels = imagePixelsRaw;

    updateImage();

}

function sobel() {

    resetSliders();
    toGrayScale();

    var imagePixelsRaw = ctx.getImageData(0, 0, width, height);

    for (var i = 0; i < imagePixels.data.length; i += 4) {
        sum =
            (imagePixels.data[i + 4] * -2) +
            (imagePixels.data[i - 4] * 2) +
            imagePixels.data[i + 4 - imagePixels.width * 4] * -1 +
            imagePixels.data[i - 4 - imagePixels.width * 4] * 1 +
            imagePixels.data[i + 4 + imagePixels.width * 4] * -1 +
            imagePixels.data[i - 4 + imagePixels.width * 4] * 1;
        for (var j = 0; j < 3; j++) {
            if (sum < 0) {
                imagePixelsRaw.data[i + j] = 0;
            } else if (sum > 255) {
                imagePixelsRaw.data[i + j] = 255;
            } else if (sum <= 255 && sum >= 0) {
                imagePixelsRaw.data[i + j] = sum;
            } else {
                imagePixelsRaw.data[i + j] = imagePixels.data[i + j];
            }
        }
    }

    imagePixels = imagePixelsRaw;

    updateImage();

}

function medianFilter() {

    resetSliders();
    prepare();

    var imagePixelsRaw = ctx.getImageData(0, 0, width, height);

    for (var i = 0; i < imagePixels.data.length; i += 4) {
        for (var j = 0; j < 3; j++) {
            var window = [
                (imagePixels.data[i + j]),
                (imagePixels.data[i + j + 4]),
                (imagePixels.data[i + j - 4]),
                (imagePixels.data[i + j - imagePixels.width * 4]),
                (imagePixels.data[i + j + imagePixels.width * 4]),
                (imagePixels.data[i + j + 4 - imagePixels.width]),
                (imagePixels.data[i + j - 4 - imagePixels.width]),
                (imagePixels.data[i + j + 4 + imagePixels.width]),
                (imagePixels.data[i + j - 4 + imagePixels.width])
            ];
            window.sort((a, b) => { return a - b; });

            if (window[4] >= 0 && window[4] <= 255) {
                imagePixelsRaw.data[i + j] = window[4];
            }
        }
    }

    imagePixels = imagePixelsRaw;

    updateImage();

}

function unsharpMasking() {

    resetSliders();
    prepare();

    var imagePixelsRaw = ctx.getImageData(0, 0, width, height);

    gaussianBlur();
    var imagePixelsRawBlur = ctx.getImageData(0, 0, width, height);

    for (var i = 0; i < imagePixels.data.length; i += 4) {
        var dif = Math.abs(imagePixelsRaw.data[i] - imagePixelsRawBlur.data[i]);
        for (var j = 0; j < 3; j++) {
            if (dif < 0) {
                imagePixelsRaw.data[i + j] = 0;
            } else if (dif > 255) {
                imagePixelsRaw.data[i + j] = 255;
            } else if (dif <= 255 && dif >= 0) {
                imagePixelsRaw.data[i + j] = dif;
            } else {
                imagePixelsRaw.data[i + j] = imagePixels.data[i + j];
            }
        }
    }

    prepare();

    for (var i = 0; i < imagePixelsRaw.data.length; i += 4) {
        for (var j = 0; j < 3; j++) {
            var sum = imagePixels.data[i + j] + imagePixelsRaw.data[i + j];
            if (sum < 0) {
                imagePixels.data[i + j] = 0;
            } else if (sum > 255) {
                imagePixels.data[i + j] = 255;
            } else if (sum <= 255 && sum >= 0) {
                imagePixels.data[i + j] = sum;
            } else {
                imagePixels.data[i + j] = imagePixels.data[i + j];
            }
        }
    }

    updateImage();

}

function prepareSliders() {

    red = parseInt(document.getElementById("slider_red").value);
    green = parseInt(document.getElementById("slider_green").value);
    blue = parseInt(document.getElementById("slider_blue").value);

}

function resetSliders() {

    document.getElementById("slider_red").value = 0;
    document.getElementById("slider_green").value = 0;
    document.getElementById("slider_blue").value = 0;

}

function sliders() {

    redDiff = parseInt(document.getElementById("slider_red").value) - red;
    greenDiff = parseInt(document.getElementById("slider_green").value) - green;
    blueDiff = parseInt(document.getElementById("slider_blue").value) - blue;

    red = parseInt(document.getElementById("slider_red").value);
    green = parseInt(document.getElementById("slider_green").value);
    blue = parseInt(document.getElementById("slider_blue").value);

    for (var i = 0; i < imagePixels.data.length; i += 4) {
        imagePixels.data[i] += redDiff;
        imagePixels.data[i + 1] += greenDiff;
        imagePixels.data[i + 2] += blueDiff;
    }

    updateImage();

}