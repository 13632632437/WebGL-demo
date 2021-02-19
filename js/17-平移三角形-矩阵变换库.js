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
    // 使用Matrix4对象
    var xformMatrix = new Matrix4();
    // 将xformMatrix设置为平移矩阵
    xformMatrix.setTranslate(0.5, 0.5, 0)
    // 使用平移矩阵对三角形进行平移,注意：不能直接将Matrix4对象直接作为最后一个参数传入，因为该方法的最后一个参数必须是类型化数组，应当使用Matrix4对象的elements属性访问存储矩阵元素的类型化数组
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);
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