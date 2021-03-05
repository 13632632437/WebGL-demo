/**
 * 当视点移动，物体超出可视范围，将会看不见，三角形将会缺失一角
 * 这是因为，远裁剪面太近
 * 修改远裁剪面与近裁剪面之间的距离，让缺失的一角显示出来 
 */

var VSHADER_SOURCE =
    "attribute vec4 a_Position;" + // 顶点数据
    "attribute vec4 a_Color;" +    // 颜色数据
    "varying vec4 v_Color;" +      // 向片元着色器传递颜色数据
    'uniform mat4 u_ViewMatrix;' +
    'uniform mat4 u_ProjMatrix;' +
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
var g_eyeX = 0.2, g_eyeY = 0.25, g_eyeZ = 0.25, g_step = 0.02;

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
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('u_ViewMatrix变量存储地址获取失败');
        return;
    }
    var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    if (!u_ProjMatrix) {
        console.log('u_ProjMatrix变量存储地址获取失败');
        return;
    }
    var projMatrix = new Matrix4();
    // 左右下上近远                                 远点加大点，就不会缺失了
    projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, 0.0, 2.0);
    //                  地址    指定是否转置矩阵。必须为false.
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements)
    // 创建Matrix4矩阵
    var viewMatrix = new Matrix4();
    $(window).bind("keydown", function (e) {
        switch (e.keyCode) {
            case 37:
                g_eyeX -= g_step;
                if (g_eyeX < -1.0) {
                    g_eyeX = 1.0;
                }
                draw(gl, n, u_ViewMatrix, viewMatrix);
                break;
            case 39:
                g_eyeX += g_step;
                if (g_eyeX > 1.0) {
                    g_eyeX = -1.0;
                }
                draw(gl, n, u_ViewMatrix, viewMatrix);
                break;
            case 38:
                g_eyeY -= g_step;
                if (g_eyeY < -1.0) {
                    g_eyeY = 1.0;
                }
                draw(gl, n, u_ViewMatrix, viewMatrix);
                break;
            case 40:
                g_eyeY += g_step;
                if (g_eyeY > 1.0) {
                    g_eyeY = -1.0;
                }
                draw(gl, n, u_ViewMatrix, viewMatrix);
                break;
            default:
                break;
        }
    })
    draw(gl, n, u_ViewMatrix, viewMatrix);
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
function draw(gl, n, u_ViewMatrix, viewMatrix) {
    viewMatrix.setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.clearColor(0.5, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}