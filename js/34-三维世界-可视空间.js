/**
 * 可视空间：
 *      1. 长方体可视空间，也称盒状空间，由正射投影产生。
 *          由前后两个矩形的表面确定，分别为近裁剪面和远裁剪面
 *          近裁剪面和远裁剪面之间的空间就是可视空间，超出可是空间的物体将不可见，webGL系统也不会渲染可视空间之外的物体
 *              
 *      2. 四棱锥/金字塔可视空间，由透视投影产生。透视投影下三维场景更有深度感。
 * 定义盒状可视空间：
 *  Martix4.setOrtho()方法可以用来设置盒状可视空间
 *  Martix4.setOrtho(left,right,bottom,top,near,far);
 *      参数：
 *          left,right  指定近裁面的左边界和右边界
 *          bottom,top  指定远裁面的上边界和下边界
 *          near,far    指定近裁减面和远裁剪面的位置，即可是可视空间的近边界和远边界
 * 此矩阵成为正射投影矩阵
 */
var VSHADER_SOURCE =
    "attribute vec4 a_Position;" + // 顶点数据
    "attribute vec4 a_Color;" +    // 颜色数据
    "varying vec4 v_Color;" +      // 向片元着色器传递颜色数据
    "uniform mat4 u_ProjMatrix;" +
    "void main() {" +
    "gl_Position =  u_ProjMatrix * a_Position;" +
    "v_Color = a_Color;" +
    "}"
var FSHADER_SOURCE =
    "precision mediump float;" +
    "varying vec4 v_Color;" +
    "void main() {" +
    "gl_FragColor = v_Color;" +
    "}"
var g_near = 0.0, g_far = 0.5, g_step = 0.1;
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
    // 获取可视空间矩阵变量u_ProjMatrix的存储地址
    var u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");
    if (u_ProjMatrix < 0) {
        console.log('u_ProjMatrix');
    }
    // 创建Matrix4矩阵
    var projMatrix = new Matrix4();
    draw(gl, n, u_ProjMatrix, projMatrix);

    $(window).bind("keydown", function (e) {
        console.log(e.keyCode);
        switch (e.keyCode) {
            case 39:
                g_far += g_step;
                console.log("g_far:", g_far);
                draw(gl, n, u_ProjMatrix, projMatrix);
                break;
            case 37:
                g_far -= g_step;
                console.log("g_far:", g_far);
                draw(gl, n, u_ProjMatrix, projMatrix);
                break;
            case 38:
                g_near += g_step;
                console.log("g_near:", g_near);
                draw(gl, n, u_ProjMatrix, projMatrix);
                break;
            case 40:
                g_near -= g_step;
                console.log("g_near:", g_near);
                draw(gl, n, u_ProjMatrix, projMatrix);
                break;

            default:
                break;
        }
    })
}
function initVertexBuffers(gl) {
    var verticesColors = new Float32Array([
        0.0, 0.6, -0.5, 0.4, 1.0, 0.4,
        -0.5, -0.4, -0.5, 0.4, 1.0, 0.4,
        0.5, -0.4, -0.5, 1.0, 0.4, 0.4,

        0.5, 0.4, -0.3, 1.0, 0.4, 0.4,
        -0.5, 0.4, -0.3, 1.0, 1.0, 0.4,
        0.0, -0.6, -0.3, 1.0, 1.0, 0.4,

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
function draw(gl, n, u_ProjMatrix, projMatrix) {
    projMatrix.setOrtho(-1, 1, -1, 1, g_near, g_far);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
    gl.clearColor(1.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}