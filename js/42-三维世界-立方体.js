var VSHADER_SOURCE =
    "attribute vec4 a_Position;" +  // 顶点数据
    "attribute vec4 a_Color;" +     // 颜色数据
    "varying vec4 v_Color;" +       // 向片元着色器传递颜色数据
    "uniform mat4 u_MvpMatrix;" +   // 视图模型投影矩阵
    "void main() {" +
    "gl_Position = u_MvpMatrix * a_Position;" +
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

    // 视图模型投影矩阵
    var u_MvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");

    if (!u_MvpMatrix) {
        console.log('视图模型投影矩阵u_MvpMatrix变量存储地址获取失败');
        return;
    }
    gl.clearColor(0.1, 0.5, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var viewMatrix = new Matrix4();
    var projMatrix = new Matrix4();
    var modalMatrix = new Matrix4();
    var mvpMatrix = new Matrix4();
    // 设置视图矩阵
    viewMatrix.setLookAt(5.5, 2.5, 10.0, 0, 0, -2, 0, 1, 0);
    projMatrix.setPerspective(30, canvas[0].width / canvas[0].height, 1, 100)
    mvpMatrix.set(projMatrix).multiply(modalMatrix).multiply(viewMatrix);
    // 第一次绘制右边三个三角形
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, n);

}

function initVertexBuffers(gl) {
    //  gl.drawArrays(gl.TRIANGLES, 0, n);此方法绘制，繁琐，多点重复使用
    var verticesColors = new Float32Array([
         1.0,  1.0, 1.0, 0.0, 0.0, 1.0,
        -1.0,  1.0, 1.0, 0.0, 1.0, 0.0,
        -1.0, -1.0, 1.0, 1.0, 0.0, 0.0,
         1.0,  1.0, 1.0, 0.0, 0.0, 1.0,
        -1.0, -1.0, 1.0, 1.0, 0.0, 0.0,
         1.0, -1.0, 1.0, 0.6, 0.5, 0.5,

        1.0, -1.0,  1.0, 0.0, 0.0, 1.0,
        1.0,  1.0,  1.0, 0.0, 1.0, 0.0,
        1.0,  1.0, -1.0, 1.0, 0.0, 0.0,
        1.0, -1.0,  1.0, 0.0, 0.0, 1.0,
        1.0,  1.0, -1.0, 1.0, 0.0, 0.0,
        1.0, -1.0, -1.0, 0.6, 0.5, 0.5,

         1.0, 1.0,  1.0, 0.0, 0.0, 1.0,
         1.0, 1.0, -1.0, 0.0, 1.0, 0.0,
        -1.0, 1.0, -1.0, 1.0, 0.0, 0.0,
         1.0, 1.0,  1.0, 0.0, 0.0, 1.0,
        -1.0, 1.0, -1.0, 1.0, 0.0, 0.0,
        -1.0, 1.0,  1.0, 0.6, 0.5, 0.5,

    ])
    var n = 18;
    var verticesSizesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesSizesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if (a_Position < 0) {
        console.log('失败');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_Color = gl.getAttribLocation(gl.program, "a_Color");
    if (a_Color < 0) {
        console.log('失败');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);
    return n;

}