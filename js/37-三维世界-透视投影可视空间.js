/**
 * 正射投影的可视空间：不管物体与视点是远是近，他有多大，那么画出来就有多大
 * 透视投影：使得场景具有深度感，远处变小
 */
var VSHADER_SOURCE =
    "attribute vec4 a_Position;" + // 顶点数据
    "attribute vec4 a_Color;" +    // 颜色数据
    "varying vec4 v_Color;" +      // 向片元着色器传递颜色数据
    "uniform mat4 u_ViewMatrix;" + // 视图矩阵：视点、观察点、上方向
    /**
     * 正射投影矩阵：近裁减面、远裁剪面、近裁剪面位置、远裁剪面位置
     * 透视投影矩阵：垂直视角(可视空间顶面和底面的比例)、近裁面宽高比、近裁剪面位置、远裁剪面位置
     */
    "uniform mat4 u_ProjMatrix;" +
    "void main() {" +
    "gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;" +
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
    // 视图矩阵
    var u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    // 透视投影矩阵
    var u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");
    if (!u_ViewMatrix || !u_ProjMatrix) {
        console.log('视图模型矩阵u_ViewMatrix||u_ProjMatrix变量存储地址获取失败');
        return;
    }
    var viewMatrix = new Matrix4();
    var projMatrix = new Matrix4();
    // 设置视图矩阵
    viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
    /**
     * Matrix4.setPerspective(fov,aspect,near,far);
     * 通过参数计算透视投影矩阵，将其存储在Matrix4中。注意，near必须小于far
     * 参数：
     *      fov         指定垂直视角，即可是空间顶面和底面间的夹角，必须大于0
     *      aspect      指定近裁剪面的宽高比(宽度/高度)
     *      near，far   指定近裁减面和远裁剪面的位置，即可视空间的近边界和远边界(near和far必须大于0)
     */
    projMatrix.setPerspective(30, canvas[0].width / canvas[0].height, 1, 100)
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

    gl.clearColor(1.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    var verticesColors = new Float32Array([
        0.75,  1.0, -4.0, 0.4,  1.0,  0.4,
        0.25, -1.0, -4.0, 0.4,  1.0,  0.4,
        1.25, -1.0, -4.0, 1.0,  0.4,  0.4,

        0.75,  1.0, -2.0, 0.4,  1.0,  0.4,
        0.25, -1.0, -2.0, 0.4,  1.0,  0.4,
        1.25, -1.0, -2.0, 1.0,  0.4,  0.4,

        0.75,  1.0,  0.0, 0.4,  1.0,  0.4,
        0.25, -1.0,  0.0, 0.4,  1.0,  0.4,
        1.25, -1.0,  0.0, 1.0,  0.4,  0.4,

       -0.75,  1.0, -4.0, 0.4,  1.0,  0.4,
       -0.25, -1.0, -4.0, 0.4,  1.0,  0.4,
       -1.25, -1.0, -4.0, 1.0,  0.4,  0.4,

       -0.75,  1.0, -2.0, 0.4,  1.0,  0.4,
       -0.25, -1.0, -2.0, 0.4,  1.0,  0.4,
       -1.25, -1.0, -2.0, 1.0,  0.4,  0.4,

       -0.75,  1.0,  0.0, 0.4,  1.0,  0.4,
       -0.25, -1.0,  0.0, 0.4,  1.0,  0.4,
       -1.25, -1.0,  0.0, 1.0,  0.4,  0.4,
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