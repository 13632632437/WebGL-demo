// 声明顶点着色器
var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +
    'uniform mat4 u_ModelMatrix;' +   // 声明变换矩阵
    'void main() {' +
    'gl_Position = u_ModelMatrix * a_Position;' +  // 使用变换矩阵，注意顺序
    '}'
// 声明片元着色器
var FSHADER_SOURCE =
    'void main() {' +
    ' gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);' +
    '}'
// 旋转速度
var ANGLE_STEP = 180.0; // 180°/s
// 记录上一次调用函数的时刻
var g_last = Date.now();

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
    gl.clear(gl.COLOR_BUFFER_BIT);



    // 获取变换矩阵变量的存储地址
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    // 当前旋转角度值
    var currentAngle = 0;
    // 模型矩阵，Matrix4对象
    var modelMatrix = new Matrix4();
    // 开始绘制三角形
    var tick = function () {
        // 更新旋转角度
        currentAngle = animate(currentAngle);
        // 设置旋转矩阵
        modelMatrix.setRotate(currentAngle, 0, 0, 1);
        // 将旋转矩阵传递给顶点着色器
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        // 清空canvas
        gl.clear(gl.COLOR_BUFFER_BIT);
        // 绘制
        gl.drawArrays(gl.TRIANGLES, 0, n);
        // 重复执行tick，requestAnimationFrame与setInterval的区别是requestAnimationFrame只在标签页被激活的时候调用
        requestAnimationFrame(tick);
    }
    tick()
}

// 设置顶点位置的函数
function initVertexBuffers(gl) {
    var vertices = new Float32Array([0, 0.2, -0.2, -0.2, 0.2, -0.2]);
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
// 更新旋转角度的方法，requestAnimationFrame是浏览器根据适当的时机执行，所以时间间隔很可能不相等，所以不能直接加一个步长值，需要根据运动时间计算旋转角度，不然会出现忽快忽慢的情况
function animate(angle) {
    // 获取当前时间
    var now = Date.now();
    // 获取距离上次调用的时间差
    var diff = now - g_last;// 毫秒
    g_last = now;
    // 返回一个新角度 = 旧角度 + 步长值 * 时间
    var newAngle = angle + ANGLE_STEP * diff / 1000.0;
    // 需要使角度始终小于360°
    return newAngle %= 360;
}