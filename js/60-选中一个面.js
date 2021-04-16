/**
 * 思路： 将表面信息写入每个点的颜色的a分量
 * 点击到点时，将点击的点的a分量传入着色器
 * 判断点击的点的分量和每个点的分量。
 * 相等分量的点就换个颜色，整个面的点的颜色就都换了
 */
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute float a_Face;\n' +   // 表面编号
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform int u_PickedFace;\n' + // 被选中的表面编号
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  int face = int(a_Face);\n' + // 表面编号是浮点型的转换为整型
    '  vec3 color = (face == u_PickedFace) ? vec3(1.0) : a_Color.rgb;\n' + // 点击点的颜色第四分量等不等于当前点的第四分量，等于就显示白色
    '  if(u_PickedFace == 0) {\n' + 
    '    v_Color = vec4(color, a_Face/255.0);\n' + // 点击时将编号写入
    '  } else {\n' +
    '    v_Color = vec4(color, a_Color.a);\n' +
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

function main() {
    var canvas = document.getElementById('demo');

    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_PickedFace = gl.getUniformLocation(gl.program, 'u_PickedFace');
    if (!u_MvpMatrix || !u_PickedFace) {
        console.log('Failed to get the storage location of uniform variable');
        return;
    }

    var viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
    viewProjMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    gl.uniform1i(u_PickedFace, -1);


    var currentAngle = 45.0;
    canvas.onmousedown = function (ev) {
        var x = ev.clientX, y = ev.clientY;
        var rect = ev.target.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
            var face = checkFace(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_PickedFace, viewProjMatrix, u_MvpMatrix);
            gl.uniform1i(u_PickedFace, face);
            draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
        }
    }
    var tick = function () {
        currentAngle = animate(currentAngle);
        draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
        requestAnimationFrame(tick, canvas);
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
        0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56,
        0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69,
        0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84,
        0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61,
        0.27, 0.58, 0.82, 0.27, 0.58, 0.82, 0.27, 0.58, 0.82, 0.27, 0.58, 0.82,
        0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93,
    ]);

    var faces = new Uint8Array([
        1, 1, 1, 1,
        2, 2, 2, 2,
        3, 3, 3, 3,
        4, 4, 4, 4,
        5, 5, 5, 5,
        6, 6, 6, 6,
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
    if (!initArrayBuffer(gl, faces, gl.UNSIGNED_BYTE, 1, 'a_Face')) return -1;
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

var g_MvpMatrix = new Matrix4();
function draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix) {

    g_MvpMatrix.set(viewProjMatrix);
    g_MvpMatrix.rotate(currentAngle, 1.0, 0.0, 0.0);
    g_MvpMatrix.rotate(currentAngle, 0.0, 1.0, 0.0);
    g_MvpMatrix.rotate(currentAngle, 0.0, 0.0, 1.0);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

var last = Date.now();
function animate(angle) {
    var now = Date.now();
    var elapsed = now - last;
    last = now;

    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle % 360;
}

function initArrayBuffer(gl, data, type, num, attribute) {

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

function checkFace(gl, n, x, y, currentAngle, u_PickedFace, viewProjMatrix, u_MvpMatrix) {
    var pixels = new Uint8Array(4);
    gl.uniform1i(u_PickedFace, 0);
    draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);

    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    console.log(pixels);
    return pixels[3];
}

















