
var VSHADER_SOURCE =
    "attribute vec4 a_Position;" + // 顶点数据
    "attribute vec4 a_Color;" +    // 颜色数据
    "varying vec4 v_Color;" +      // 向片元着色器传递颜色数据
    "uniform mat4 u_ModalViewMatrix;" +
    "void main() {" +
    "gl_Position = u_ModalViewMatrix * a_Position;" +
    "v_Color = a_Color;" +
    "}"

var FSHADER_SOURCE =
    "precision mediump float;" +
    "varying vec4 v_Color;" +
    "void main() {" +
    "gl_FragColor = v_Color;" +
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
    var u_ModalViewMatrix = gl.getUniformLocation(gl.program, 'u_ModalViewMatrix');
    if (!u_ModalViewMatrix) {
        console.log('视图模型矩阵u_ModalViewMatrix变量存储地址获取失败');
        return;
    }
    // 视图矩阵
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
    // 可视空间矩阵
    var projMatrix = new Matrix4();
    // projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0); // 标准大小可视空间
    // projMatrix.setOrtho(-0.5, 0.5, -0.5, 0.5, -1.0, 1.0); // 缩小了的可视空间，三角形大小变成了之前大小的两倍，这是由于canvas的大小没有发生变化，但是他表示的可视空间缩小了一般。注意：三角形的有些部分越过了可视空间并被裁剪了
    // projMatrix.setOrtho(-1.0, 1.0, -0.5, 0.5, -1.0, 1.0); // 缩小可视空间高度，图形高度拉长了
    projMatrix.setOrtho(-0.5, 0.5, -1.0, 1.0, -1.0, 1.0); // 缩小可视空间宽度，图形宽度拉长了
    // 计算的模型矩阵
    var modalViewMatrix = viewMatrix.multiply(projMatrix)
    // 将模型矩阵传递给顶点着色器
    gl.uniformMatrix4fv(u_ModalViewMatrix, false, modalViewMatrix.elements);

    gl.clearColor(0.5, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    var verticesColors = new Float32Array([
        0.0, 0.5, -0.4, 0.4, 1.0, 0.4,
        -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
        0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

        0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
        -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
        0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

        0.0, 0.5, 0.0, 0.4, 0.4, 1.0,
        -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
        0.5, -0.5, 0.0, 1.0, 0.4, 0.4
    ]);
    var n = 9;
    var verticesSizesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesSizesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);

    gl.enableVertexAttribArray(a_Position);
    var a_Color = gl.getAttribLocation(gl.program, "a_Color");

    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }

    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);
    return n;
}