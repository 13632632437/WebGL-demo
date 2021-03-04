/**
 * 1. 视点(eyeX,eyeY,eyeZ)：观察者所处的位置
 * 2. 视线：视点出发沿着观察方向的射线
 * 3. 上方向(upX,upY,upZ)：视点好比眼睛，上方向就是眼睛指向头顶的位置
 * 4. 观察目标点(atX,atY,atZ)：被观察目标所在的点，只有同时知道观察目标和视点，才能算出视线方向
 * 5. 视图矩阵，容纳以上所有信息的矩阵，然后将试图矩阵传递给顶点着色器，表示观察者的状态
 *      Martix4.setLookAt(eyeX,eyeY,eyeZ,atX,atY,atZ,upX,upY,upZ)
 *      观察者默认状态：
 *          视点：(0,0,0)
 *          观察点：(0,0,-1)
 *          上方向：(0,1,0)
 */

var VSHADER_SOURCE =
    "attribute vec4 a_Position;" + // 顶点数据
    "attribute vec4 a_Color;" +    // 颜色数据
    "varying vec4 v_Color;" +      // 向片元着色器传递颜色数据
    // 'uniform mat4 u_ViewMatrix;' +
    // 'uniform mat4 u_ModalMatrix;' +
    "uniform mat4 u_ModalViewMatrix;" +
    "void main() {" +
    // "gl_Position = u_ViewMatrix * u_ModalMatrix * a_Position;" +// 顶点着色器执行次数较多，每次都乘以视图矩阵性能影响较大，故可以将视图矩阵和模型矩阵计算好在传入顶点着色器
    "gl_Position = u_ModalViewMatrix * a_Position;"+
    "v_Color = a_Color;" +
    "}"

/**
 * 旋转后的顶点 = 旋转矩阵 *  原始坐标
 * 
 * 观察者看到的位置 = 视觉矩阵 * 旋转后的位置
 * 
 * 所以：
 *   观察者看到的位置 = 视觉矩阵 * 旋转矩阵 * 原始坐标
 * 变换矩阵除了旋转矩阵还可以是平移、缩放等，统称为模型矩阵
*/
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
    // 获取视图矩阵变量u_ViewMatrix的存储地址
    // var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    // 获取模型矩阵变量u_ModalMatrix的存储地址
    // var u_ModalMatrix = gl.getUniformLocation(gl.program, 'u_ModalMatrix');

    // 获取视图模型矩阵变量v_ModalViewMatrix的存储地址
    var u_ModalViewMatrix = gl.getUniformLocation(gl.program, 'u_ModalViewMatrix');
    if (!u_ModalViewMatrix) {
        console.log('视图模型矩阵u_ModalViewMatrix变量存储地址获取失败');
        return;
    }
    // 创建Matrix4矩阵
    var viewMatrix = new Matrix4();
    var modalMatrix = new Matrix4();
    viewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
    modalMatrix.setRotate(90, 0, 0, 1);
    // 计算视图模型矩阵
    var modalViewMatrix = viewMatrix.multiply(modalMatrix)
    // 将视图矩阵传递给顶点着色器
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