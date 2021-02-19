/**
 * 平移变换矩阵
 *  x' = x + Tx;
 *  y' = y + Ty;
 *  z' = z;
 *  1  = 1;
 * 
 *  矩阵
 *      x'       a  b  c  d       x
 *      y'  =    e  f  g  h   *   y
 *      z'       i  j  k  l       z
 *      1        m  n  o  p       1
 * 
 *      x' = ax + by + cz + d   a=1;b=0;c=0;d=Tx;
 *      y' = ex + fy + gz + h   e=0;f=1;g=0;h=Ty
 *      z' = ix + jy + kz + l   i=0;j=0;k=1;l=0;
 *      1  = mx + ny + oz + p   m=0;n=0;o=0;p=1;
 * 则矩阵为
 *      1  0  0  Tx
 *      0  1  0  Ty
 *      0  0  1  0
 *      0  0  0  1
 */

// 声明顶点着色器
var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +
    'uniform mat4 u_xformMatrix;' +   // 声明变换矩阵
    'void main() {' +
    'gl_Position = u_xformMatrix * a_Position;' +  // 使用变换矩阵，注意顺序
    '}'
// 声明片元着色器
var FSHADER_SOURCE =
    'void main() {' +
    ' gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);' +
    '}'

// 主程序
function main() {
    // 1. 获取WebGL上下文
    var canvas = $("#demo");
    var gl = getWebGLContext(canvas[0]);
    if (!gl) {
        console.log("WebGL上下文获取失败");
        return
    }
    // 2. 初始化着色器
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("初始化着色器失败");
        return
    }
    // 3. 设置坐标点的信息
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log("设置顶点位置信息失败");
        return
    }




    // 获取平移变换矩阵变量的存储地址
    var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
    // 声明平移矩阵，注意平移矩阵数组是按列主序的，就是按一列从上到下，依次
    var xformMatrix = new Float32Array([
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0.5,0.5,0,1
    ])
    // 使用平移矩阵对三角形进行平移
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
    /**
     * gl.uniformMatrix4fv(location, Transpose, array); 4阶矩阵，v表示向着色器传递多个数据值
     *  参数： 
     *  location    uniform变量的存储位置
     *  Transpose   默认为false,是否转置矩阵，即交换矩阵的行和列，在WebGL没有实现矩阵转置，所以为false
     *  array       待传输的类型化数组，4*4矩阵按列主序存储在其中
     * 
    */


    // 4. 设置背景色
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    // 5. 清空
    gl.clear(gl.COLOR_BUFFER_BIT)
    // 6. 绘制,gl.TRIANGLES就相当于告诉WebGL，从缓冲区得第一个顶点开始，使顶点得着色器执行三次，用着三个点绘制一个三角形
    gl.drawArrays(gl.TRIANGLES, 0, n)
}

// 设置顶点位置的函数
function initVertexBuffers(gl) {
    var vertices = new Float32Array([0, 0.5, -0.5, -0.5, 0.5, -0.5]);
    var n = 3;
    // 1. 创建缓冲区对象
    var verticesBuffer = gl.createBuffer();
    if (!verticesBuffer) {
        console.log("创建缓冲区失败");
        return -1;
    }
    // 2. 将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    // 3. 向缓冲区对象中写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    // 4. 将缓冲区对象分配给一个attribute变量
    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    // 5. 开启attribute变量
    gl.enableVertexAttribArray(a_Position);
    return n;
}