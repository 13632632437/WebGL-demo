// 声明顶点着色器
var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +
    'attribute float a_PointSize;' +
    'void main() {' +
    'gl_Position = a_Position;' +
    'gl_PointSize = a_PointSize;' +
    '}'
// 声明片元着色器
var FSHADER_SOURCE =
    'void main() {' +
    ' gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);' +
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
        console.log("着色器初始化失败");
        return
    }
    // 3. 设置坐标点的信息
    var n = initVertexBuffers(gl)
    if (n < 0) {
        console.log("设置顶点位置失败");
        return
    }

    // 4. 设置背景色
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    // 5. 清空
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 6. 绘制，注意：传递的第三个参数数绘制点的数量，因为WebGL系统不知道缓冲区有多少个顶点的数据，即使知道也不能确定是否全部要画出，所以必须显示地告诉需要绘制多少个顶点
    gl.drawArrays(gl.POINTS, 0, n);
}

// 设置顶点位置的函数
function initVertexBuffers(gl) {
    // 3.1 设置点的坐标和点的大小
    var verticesSizes = new Float32Array([
        0.0, 0.5, 10.0,
        -0.5, -0.5, 20.0,
        0.5, -0.5, 30.0
    ]);
    var n = 3;
    // 3.2 创建缓冲区对象
    var verticesSizesBuffer = gl.createBuffer();

    if (!verticesSizesBuffer) {
        console.log("创建缓冲区对象失败");
        return -1;
    }
    // 3.3 将缓冲区对象绑定到目标（绑定到WebGL系统中已经存在的目标(target)上，这个目标表示缓冲区对象的用途，在这里就是向顶点着色器传递attribute变量的数据）
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesSizesBuffer);
    // 3.4 向缓冲区对象中写入数据（写入点的坐标，实际不能向缓冲区写入数据，只能向缓冲区绑定的目标写入数据，所以需要先执行绑定）
    gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);

    var FSIZE = verticesSizes.BYTES_PER_ELEMENT; // verticesSizes数组中每个元素的大小，字节数

    // 3.5 将缓冲区对象分配给a_Position变量（绑定对应的变量，应该就是类似与for循环分配点的位置信息给变量）
    var a_Position = gl.getAttribLocation(gl.program, "a_Position");

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 3, 0);
    // 3.6 连接a_Position变量与分配给它的缓冲区对象,开启或激活attribute变量，是缓冲区对attribute变量的分配生效
    gl.enableVertexAttribArray(a_Position);


    var a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize");
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 3, FSIZE * 2);
    gl.enableVertexAttribArray(a_PointSize);


    // 注： 返回的是顶点的数量，如果创建缓冲区失败则返回的是-1
    return n;
}

/**
 * gl.vertexAttribPointer(location, size, type, normalized, stride, offset)    将整个数组中的所有值一次性地分配给一个attribute变量
 *   参数：
 *           location    指定待分配的attribute变量的存储位置
 * 
 *           size        指定缓冲区每个顶点的分量个数(1到4)。若size比attribute变量需要的分量数小，
 *                       缺失分量将按照与gl.vertexAttrib[1234f]()相同的规则不全。
 * 
 *           type        用以下类型之一来指定数据格式
 *                       gl.UNSIGNED_BYTE    无符号字节，Uint8Array
 *                       gl.SHORT            短整型，Int16Array
 *                       gl.UNSIGEND_SHORT   无符号短整型，Uint16Array
 *                       gl.INT              整形，Int32Array
 *                       gl.UNSIGNED_INT     无符号整型，Uint32Array
 *                       gl.FLOAT            浮点型，Float32Array
 *           normalized  传入true和false，表明是否将非浮点型的数据归一
 * 
 *           stride      指定相邻两个顶点间的字节数，默认为0
 * 
 *           offset      指定缓冲区对象中的偏移量（以字节为单位），
 *                       即attribute变量从缓冲区的何处开始存储，如过是从起始位置开始的，则为0
 */