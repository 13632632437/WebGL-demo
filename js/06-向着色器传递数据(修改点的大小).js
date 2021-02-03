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
    ' gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);' +
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
    var a_PointSize = gl.getAttribLocation(gl.program,"a_PointSize")
    // 校验存储地址是否获取成功
    if (a_Position < 0) {
        console.log("attribute变量存储地址获取错误");
        return
    }
    // 1. 声明类型化数组
    var position = new Float32Array([0.0, 0.0, 0.0, 1.0]);
    // 2. 传输数据
    gl.vertexAttrib4fv(a_Position, position);
    gl.vertexAttrib1f(a_PointSize, 40);

    // 指定清空绘图区的颜色
    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    // 清空绘图区
    gl.clear(gl.COLOR_BUFFER_BIT);
    // // 绘制点
    gl.drawArrays(gl.POINTS, 0, 1);
}