var VSHADER_SOURCE =
    "attribute vec4 a_Position;" +
    "uniform mat4 u_MvpMatrix;" +
    'attribute vec2 a_TexCoord;\n' +
    'varying vec2 v_TexCoord;\n' +
    "void main() {" +
    "  gl_Position = u_MvpMatrix * a_Position;" +
    '  v_TexCoord = a_TexCoord;\n' +
    "}"

var FSHADER_SOURCE =
    "precision mediump float;" +
    'varying vec2 v_TexCoord;\n' +
    'uniform sampler2D u_Sampler;\n' +
    "void main() {" +
    '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
    "}"

function main() {
    var canvas = $("#demo");
    var gl = getWebGLContext(canvas[0]);
    if (!gl) {
        console.log("WebGL上下文获取失败");
        return
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("着色器初始化失败");
        return
    }

    var n = initVertexBuffers(gl)
    if (n < 0) {
        console.log("设置顶点位置失败");
        return
    }

    var u_MvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");
    if (!u_MvpMatrix) {
        console.log('视图模型投影矩阵u_MvpMatrix变量存储地址获取失败');
        return;
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);


    var viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(30, canvas[0].width / canvas[0].height, 1, 100);
    viewProjMatrix.lookAt(5.5, 2.5, 10.0, 0, 0, -2, 0, 1, 0);

    if (!initTextures(gl, n, viewProjMatrix, u_MvpMatrix)) {
        console.log('Failed to intialize the texture.');
        return;
    }
    initEventHandlers(canvas[0]);
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0
    ]);

    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ]);
    var texCoords = new Float32Array([
        1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
        1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
    ]);
    if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1;
    if (!initArrayBuffer(gl, texCoords, 2, gl.FLOAT, 'a_TexCoord')) return -1;

    var indexsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexsBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    return indices.length;

}
function initArrayBuffer(gl, data, num, type, attribute) {
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);

    return true;
}
function initTextures(gl, n, viewProjMatrix, u_MvpMatrix) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    if (!u_Sampler) {
        console.log('Failed to get the storage location of u_Sampler');
        return false;
    }
    var image = new Image();
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }
    image.onload = function () { loadTexture(gl, texture, u_Sampler, image, n, viewProjMatrix, u_MvpMatrix); };
    image.src = '../img/sky.JPG';
    return true
}
function loadTexture(gl, texture, u_Sampler, image, n, viewProjMatrix, u_MvpMatrix) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler, 0);
    draw(gl, n, viewProjMatrix, u_MvpMatrix);
    var tick = function () {   // Start drawing
        draw(gl, n, viewProjMatrix, u_MvpMatrix);
        requestAnimationFrame(tick);
    };
    tick();
}
var g_MvpMatrix = new Matrix4();
var g_currentAngle = [0.0, 0.0]
function draw(gl, n, viewProjMatrix, u_MvpMatrix) {
    g_MvpMatrix.set(viewProjMatrix);
    g_MvpMatrix.rotate(g_currentAngle[0], 1.0, 0.0, 0.0);
    g_MvpMatrix.rotate(g_currentAngle[1], 0.0, 1.0, 0.0);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

}
function initEventHandlers(canvas) {
    var dragging = false;
    var lastX = -1, lastY = -1;

    canvas.onmousedown = function (e) {
        console.log(e);
        var x = e.clientX, y = e.clientY;
        lastX = x; lastY = y;
        dragging = true;
    }
    canvas.onmousemove = function (e) {
        if (dragging) {
            var x = e.clientX, y = e.clientY;
            var dx = 0.3*(x - lastX);
            var dy = 0.3*(y - lastY);
            g_currentAngle[0] = g_currentAngle[0] + dy;
            g_currentAngle[1] = g_currentAngle[1] + dx;
            lastX = x, lastY = y;
        }
    }
    window.onmouseup = function (e) {
        console.log(e);
        dragging = false;
    }
}