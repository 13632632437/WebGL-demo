var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform bool u_Clicked;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  if (u_Clicked) {\n' +
    '    v_Color = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '  } else {\n' +
    '  v_Color = a_Color;\n' +
    '  }\n' +
    '}\n';
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';
var ANGLE_STEP = 20.0;
var g_MvpMatrix = new Matrix4();
var last = Date.now();

function main() {
    var canvas = document.getElementById('demo');
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('获取webGL绘图上下文失败');
        return;
    }
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('初始化着色器失败');
        return;
    }
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('设置顶点信息失败');
        return;
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_Clicked = gl.getUniformLocation(gl.program, 'u_Clicked');
    if (!u_MvpMatrix || !u_Clicked) {
        console.log('变换矩阵或u_Clicked获取失败');
        return;
    }
    gl.uniform1i(u_Clicked, 0);
    canvas.onmousedown = function (ev) {
        var x = ev.clientX, y = ev.clientY;                          // 鼠标点击位置处于页面可视区域的位置
        var rect = ev.target.getBoundingClientRect();                // 方法返回元素的大小及其相对于视口的位置。
        var x_in_canvas = x - rect.left, y_in_canvas = y - rect.top; // 鼠标点击位置在canvas的坐标
        console.log("x_in_canvas:", x_in_canvas, "y_in_canvas:", y_in_canvas);
        var picked = check(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_Clicked, viewProjMatrix, u_MvpMatrix);
        if (picked) alert(1)
    }
    var viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
    viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    var currentAngle = 0.0;
    var tick = function () {
        currentAngle = animate(currentAngle);
        draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
        requestAnimationFrame(tick);
    };
    tick();

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
    var colors = new Float32Array([
        0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82,
        0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69,
        0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61,
        0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84,
        0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56,
        0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93,
    ]);
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ]);
    if (!initArrayBuffer(gl, vertices, gl.FLOAT, 3, 'a_Position')) return -1;
    if (!initArrayBuffer(gl, colors, gl.FLOAT, 3, 'a_Color')) return -1;
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, data, type, num, attribute) {
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('创建缓冲区失败');
        return false;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log('获取变量存储地址失败 ' + attribute);
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);

    return true;
}
function draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix) {
    g_MvpMatrix.set(viewProjMatrix);
    g_MvpMatrix.rotate(currentAngle, 1.0, 0.0, 0.0);
    g_MvpMatrix.rotate(currentAngle, 0.0, 1.0, 0.0);
    g_MvpMatrix.rotate(currentAngle, 0.0, 0.0, 1.0);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}
function animate(angle) {
    var now = Date.now();
    var elapsed = now - last;
    last = now;
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle % 360;
}
/**
 * 思路，点击时将立方体变成红色在瞬间将颜色变回去，用户看不到变成了红色
 * 变成红色的同时判断点击位置的颜色是否是红色，是则弹窗
 */
function check(gl, n, x, y, currentAngle, u_Clicked, viewProjMatrix, u_MvpMatrix) {
    var picked = false;
    // 绘制红色立方体
    gl.uniform1i(u_Clicked, 1);
    draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
    // 判断点击位置的颜色
    var pixels = new Uint8Array(4); // 创建初始化为0的，包含length个元素的无符号整型数组
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels); // 当前颜色帧缓冲区​​的指定矩形中将一个像素块读取到一个 对象中
    // 红色可判断红色位是否为255
    if (pixels[0] == 255) {
        picked = true;
    }
    // 重新绘制
    gl.uniform1i(u_Clicked, 0);
    draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
    return picked;
}