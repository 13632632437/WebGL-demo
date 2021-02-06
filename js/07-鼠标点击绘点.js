// 声明顶点着色器，并加入attribute对象
var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +  // 声明点位置变量
    'attribute float a_PointSize;' +  // 声明点大小变量
    'void main() {' +
    'gl_Position = a_Position;' +   // 使用变量
    'gl_PointSize = a_PointSize;' +  // 使用变量
    '}'
// 声明片元着色器
var FSHADER_SOURCE =
    'void main() {' +
    ' gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);' +
    '}'
// 主程序
function main() {
    // 获取canvas
    var canvas = $("#demo");
    // 获取webGL上下文
    var gl = getWebGLContext(canvas[0]);
    // 检验上下文获取是否成功
    if (!gl) {
        console.log("WebGL上下文获取失败");
        return
    }
    // 初始化着色器
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("着色器初始化失败");
        return
    }
    // 获取变量地址
    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    var a_PointSize = gl.getAttribLocation(gl.program, "a_PointSize")
    // 校验存储地址是否获取成功
    if (a_Position < 0) {
        console.log("attribute变量存储地址获取错误");
        return
    }
    // 1. 声明类型化数组
    var position = new Float32Array([-1.0, 1.0, 0.0, 1.0]);
    // 2. 传输数据
    gl.vertexAttrib1f(a_PointSize, 10);

    // 指定清空绘图区的颜色
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    // 清空绘图区
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 注册点击事件
    canvas.bind("mousedown", function (e) {
        click(e, gl, canvas, a_Position)
    })
}


// 保存点击的坐标点
var g_points = [];
// 点击事件处理函数
function click(e, gl, canvas, a_Position) {
    /**
     * 坐标系：
     * 浏览器坐标(点击事件) ---> canvas坐标  --->  WebGL- canvas坐标
     * clientX、clientY     ---> 点击位置距离当前body可视区域的x，y坐标
     * rect.left、rect.top  ---> canvas在浏览器客户区的坐标
     */
    var x = e.clientX,  // 鼠标点击处的x坐标
        y = e.clientY,  // 鼠标点击处的y坐标
        rect = e.target.getBoundingClientRect();
    /**
     * 获得webGL坐标系下的坐标
     * x - rect.left 点击位置横坐标减去canvas距离左侧得距离，得到点击位置在canvas中得横坐标
     * 因为webGL坐标系统中心点在中心位置，所以需要使用((x - rect.left)-canvas.width/2)，即坐标中心右移，左边位置减小
     * 又因为webGL坐标是0~1之间的数字，所以需要转化一下((x - rect.left)-canvas.width/2)/(canvas.width/2)
     * 同理得到y坐标
     */
    x = ((x - rect.left) - canvas[0].width / 2) / (canvas[0].width / 2);
    y = ((canvas[0].height / 2) - (y - rect.top)) / (canvas[0].height / 2);
    // 按顺序将点添加到数组中
    g_points.push([x, y]);
    // 清空绘图区
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 遍历数组绘制点
    for (let i = 0; i < g_points.length; i += 2) {
        // 将值传输到attribute变量
        gl.vertexAttrib3f(a_Position, g_points[i][0], g_points[i][1], 0.0);
        // 绘制点
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}