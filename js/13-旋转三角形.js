
/**
 * 旋转后的坐标x',y'计算公式
 * x' = xcosB - ysinB
 * y' = xsinB + ycosB
 * z' = z
 */
// 声明顶点着色器
var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +  // 声明点位置attribute变量
    'uniform float u_SinB,u_CosB;' +  // 声明旋转需要的旋转角度的正弦值和余弦值
    'void main() {' +
    'gl_Position.x = a_Position.x*u_CosB - a_Position.y*u_SinB;' +   // 使用变量
    'gl_Position.y = a_Position.x*u_SinB + a_Position.y*u_CosB;' +   // 使用变量
    'gl_Position.z = a_Position.z;' +
    'gl_Position.w = 1.0;' +
    '}'
// 声明片元着色器
var FSHADER_SOURCE =
    'void main() {' +
    ' gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);' +
    '}'

// 旋转角度
var ANGLE = 90.0;

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
    /**
     * 获的旋转角度的正弦值和余弦值
     * 先将角度转为弧度制
     * 获取变量的存储地址
     * 向变量传递数据
     */
    var radian = Math.PI * ANGLE / 180;
    var sinB = Math.sin(radian);
    var cosB = Math.cos(radian);
    var u_SinB = gl.getUniformLocation(gl.program,"u_SinB");
    var u_CosB = gl.getUniformLocation(gl.program,"u_CosB");
    gl.uniform1f(u_SinB,sinB);
    gl.uniform1f(u_CosB,cosB);
    // 4. 设置背景色
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    // 5. 清空
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 6. 绘制,gl.TRIANGLES就相当于告诉WebGL，从缓冲区得第一个顶点开始，使顶点得着色器执行三次，用着三个点绘制一个三角形
    gl.drawArrays(gl.TRIANGLES, 0, n);
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