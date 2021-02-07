// 声明顶点着色器
var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +  // 声明点位置attribute变量
    'void main() {' +
    'gl_Position = a_Position;' +   // 使用变量
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
    // 4. 设置背景色
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    // 5. 清空
    gl.clear(gl.COLOR_BUFFER_BIT)
    // 6. 绘制,gl.TRIANGLES就相当于告诉WebGL，从缓冲区得第一个顶点开始，使顶点得着色器执行三次，用着三个点绘制一个三角形
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n)
}

// 设置顶点位置的函数
function initVertexBuffers(gl) {
    var vertices = new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5,]);// 点象限顺序2314
    var n = 4;
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

/**
 *  gl.drawArrays(mode, 0, n);
 *  基本图形     参数mode              描述
 *  点           gl.POINTS            一系列点，绘制在v0, v1, v2...处
 *  线段         gl.LINES             一系列单独的线段，绘制在(v0,v1),(v2,v3)...处，点的个数是奇数，最后一个将会被忽略
 *  线条         gl.LINE_STRIP        一系列连接的线段，绘制在(v0,v1),(v1,v2)...处
 *  回路         gl.LINE_LOOP         一系列连接的线段，最后一个点和起始点相连
 *  三角形       gl.TRIANGLES         一系列单独的三角形，绘制在(v0,v1,v2),(v3,v4,v5)...处
 *  三角带       gl.TRIANGLE_STRIP    一系列条带状的三角形，绘制在(v0,v1,v2),(v2,v1,v3)...处，第二个三角形共用第一个三角形的一条边
 *  三角扇形     gl.TRIANGLE_FAN      一系列三角形组成的类似于扇形的图形
 *
 */
