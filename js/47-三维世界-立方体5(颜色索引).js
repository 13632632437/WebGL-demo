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
    gl.enable(gl.DEPTH_TEST); // 消除隐藏面
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // 清除颜色缓冲区和深度缓冲区

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
    /**
     * gl.drawElements(mode, count, type, offset);
     * 执行着色器，按照mode参数指定的方式，根据绑定到gl.ELEMENT_ARRAY_BUFFER的缓冲区的顶点索引绘制图形。
     *  参数：
     *      mode        指定绘制的方式：gl.POINTS\gl.LINES\gl.LINE_STRIP\gl.LINE_LOOP\gl.TRIANGLES\gl.TRIANGLE_STRIP\gl.TRIANGLE_FAN
     *      count       指定绘制顶点的个数（整型数）
     *      type        指定索引值数据类型gl.UNSIGNED_BYTE\gl.UNSIGNED_SHORT
     *      offset      指定索引数组中开始绘制的位置，以字节为单位
     * 错误： 
     *      INVALID_ENUM       mode错误
     *      invalid_value      count\offset错误
     */
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0); // 根据索引传递顶点数据到顶点着色器，绘制图形

}

function initVertexBuffers(gl) {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    //  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);此方法绘制(v0,v1,v2,v3)即可绘制一个面
    var verticesColors = new Float32Array([
        // 前
         1.0,  1.0,  1.0,  // v0 0
        -1.0,  1.0,  1.0,  // v1 1
        -1.0, -1.0,  1.0,  // v2 2
         1.0, -1.0,  1.0,  // v3 3 
        // 上
         1.0,  1.0,  1.0,  // v0 4
        -1.0,  1.0,  1.0,  // v1 5
         1.0,  1.0, -1.0,  // v5 6
        -1.0,  1.0, -1.0,  // v6 7
        // 右
         1.0,  1.0,  1.0,  // v0 8
         1.0, -1.0,  1.0,  // v3 9
         1.0, -1.0, -1.0,  // v4 10
         1.0,  1.0, -1.0,  // v5 11
        // 后
         1.0, -1.0, -1.0,  // v4 12
         1.0,  1.0, -1.0,  // v5 13
        -1.0,  1.0, -1.0,  // v6 14
        -1.0, -1.0, -1.0,  // v7 15
        // 下
         1.0, -1.0,  1.0,  // v3 16
         1.0, -1.0, -1.0,  // v4 17
        -1.0, -1.0, -1.0,  // v7 18
        -1.0, -1.0,  1.0,  // v2 19
        // 左
        -1.0,  1.0,  1.0,  // v1 20
        -1.0,  1.0, -1.0,  // v6 21
        -1.0, -1.0, -1.0,  // v7 22
        -1.0, -1.0,  1.0,  // v2 23
    ])
    // 顶点索引（无符号8位整型数）
    var indexs = new Uint8Array([// 会由三维建模工具，自动组装三个顶点位一组，绘制三角形
        0,  1,  2,  0,  2,  3,
        4,  5,  7,  4,  7,  6,
        8,  9,  10, 8,  10, 11,
        12, 13, 14, 12, 14, 15,
        19, 16, 17, 19, 17, 18,
        20, 23, 22, 20, 22, 21
    ])
    var colors = new Float32Array([
        0.8, 0.6, 0.1, 0.8, 0.6, 0.1, 0.8, 0.6, 0.1, 0.8, 0.6, 0.1, 0.9, 0.2, 0.2, 0.9, 0.2, 0.2, 0.9, 0.2, 0.2,
        0.9, 0.2, 0.2, 0.5, 0.2, 0.5, 0.5, 0.2, 0.5, 0.5, 0.2, 0.5, 0.5, 0.2, 0.5, 0.4, 0.5, 0.6, 0.4, 0.5, 0.6,
        0.4, 0.5, 0.6, 0.4, 0.5, 0.6, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.8, 0.8, 0.9,
        0.8, 0.8, 0.9, 0.8, 0.8, 0.9, 0.8, 0.8, 0.9,
    ])
    // 顶点数据
    if(!initArrayBuffers(gl,verticesColors,"a_Position",3)){
        console.log("缓冲区异常");
        return -1
    }
    // 颜色数据
    if(!initArrayBuffers(gl,colors,"a_Color",3)){
        console.log("缓冲区异常");
        return -1
    }
    // 索引数据
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexs, gl.STATIC_DRAW);

    return indexs.length;

}
// 缓冲区整理
function initArrayBuffers(gl,data,aPosition,num) {
    var initBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, initBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    var a_Position = gl.getAttribLocation(gl.program, aPosition);
    if (a_Position < 0) {
        console.log('失败');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, num, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    return true
}