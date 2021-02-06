// 声明顶点着色器
var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +
    'void main(){' +
    'gl_Position = a_Position;' +
    'gl_PointSize = 10.0;' +
    '}'
// 声明片元着色器
var FSHADER_SOURCE =
    'precision mediump float;' +    // 精度限定词： 指定变量的范围(最大值、最小值和精度)
    'uniform vec4 u_FragColor;' +   // 声明uniform变量
    'void main() {' +
    'gl_FragColor = u_FragColor;' + // 使用uniform变量
    '}'

// 主程序
function main() {
    var canvas = $("#demo");
    var gl = getWebGLContext(canvas[0]);
    if (!gl) {
        console.log("gl上下文获取失败");
        return
    }
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("初始化着色器失败");
    }
    // 获取变量存储地址
    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    /**
     * 获取uniform变量的存储地址
     *  gl.getUniformLocation(program, name);
     * 参数：
     *  program              指定半酣顶点着色器和片元着色器的着色器呈程序对象
     *  name                 指定想要获取其存储位置的uniform变量的名称
     * 返回值:  
     *          non-null     指定uniform变量的位置
     *          null         指定的uniform变量不存在，或者其名具有gl_或webgl_前缀
     */
    var u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
    if (a_Position < 0) {
        console.log("attribute变量地址获取失败");
        return
    }
    if (u_FragColor < 0) {
        console.log("uniform变量地址获取失败");
        return
    }
    // 指定清空绘图区的颜色
    gl.clearColor(0.2, 0.5, 0.2, 1.0);
    // 清空绘图区
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 注册点击事件
    canvas.bind("mousedown", function (e) {
        click(e, gl, canvas, a_Position, u_FragColor)
    })
}

var g_points = [],   // 顶点位置数组
    g_colors = [];   // 顶点颜色数组
function click(e, gl, canvas, a_Position, u_FragColor) {
    var x = e.clientX,
        y = e.clientY,
        rect = e.target.getBoundingClientRect();
    x = ((x - rect.left) - canvas[0].width / 2) / (canvas[0].width / 2);
    y = ((canvas[0].height / 2) - (y - rect.top)) / (canvas[0].height / 2);
    g_points.push([x, y]);
    // 存储点的颜色
    if (x > 0 && y > 0) {
        g_colors.push([1.0, 0.0, 0.0, 1.0]) // 第一象限红色
    } else if (x < 0 && y > 0) {
        g_colors.push([1.0, 1.0, 0.0, 1.0]) // 第二象限黄色
    } else if (x < 0 && y < 0) {
        g_colors.push([0.0, 1.0, 0.0, 1.0]) // 第三象限绿色
    } else {
        g_colors.push([0.0, 0.0, 1.0, 1.0]) // 第四象限蓝色
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    for (let i = 0; i < g_points.length; i++) {
        gl.vertexAttrib3f(a_Position, g_points[i][0], g_points[i][1], 1.0);
        /**
         * 向uniform变量赋值
         * gl.uniform4f(location, v0, v1, v2, v3)
         * 参数：
         *      location        指定将要修改的uniform变量的存储位置
         *      v0              指定填充uniform变量第一个分量的值
         *      v1              指定填充uniform变量第二个分量的值
         *      v2              指定填充uniform变量第三个分量的值
         *      v3              指定填充uniform变量第四个分量的值
         * 同族函数：
         * gl.uniform1f(location, v0)
         * gl.uniform2f(location, v0, v1)
         * gl.uniform3f(location, v0, v1, v2)
         * gl.uniform4f(location, v0, v1, v2, v3)
         * 注：v0,v1,v2按顺序填充，最少一个值。忽略值默认为0.0，v3忽略默认为1.0
         */
        gl.uniform4f(u_FragColor, ...g_colors[i]);
        gl.drawArrays(gl.POINTS, 0, 1);
    }
} 