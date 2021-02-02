function main() {
    // 获取canvas
    const canvas = $("#demo");
    // 获取WebGL绘图上下文时
    var gl = getWebGLContext(canvas[0]);
    if (!gl) {
        console.log("WebGL上下文获取失败");
        return;
    }
    // 顶点着色器程序
    var VSHADER_SOURCE = 'void main(){\n' +
        'gl_Position=vec4(0.0,0.0,0.0,1.0);\n' + // 设置坐标 gl_Position 和 gl_PointSize 内置与着色器程序中，gl_Position是必须的、gl_PointSize默认为1.0 ，vec4表示四个浮点数组成的矢量
        'gl_PointSize=10.0;\n' +                 // 设置大小 浮点数，写好成10将会报错
        '}\n';
    // 片元着色器程序
    var FSHADER_SOURCE = 'void main(){\n' +
        'gl_FragColor=vec4(1.0,0.0,0.0,1.0);\n' + //设置颜色
        '}\n';
    /**
     * 初始化着色器initShaders(gl,vshader,fsahder)
     *  参数：
     *      gl          指定渲染上下文
     *      vshader     指定顶点着色去程序 
     *      fsader      指定片元着色器程序
     *  返回值：
     *      true        初始化着色器成功
     *      false       初始化着色器失败
     * 
     */
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('初始化着色器失败');
        return
    }
    // 指定清空绘图区的颜色
    gl.clearColor(0, 1, 1, 1);
    // 清空绘图区
    gl.clear(gl.COLOR_BUFFER_BIT);
    /**
     * gl.drawArrays(mode,first,count),是一个强大的函数，用来绘制各种图形
     * 参数：
     *      mode     指定绘制图形的方式，接收一下常量：gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, gl.TRIANGLES, gl.TRAINGLE_STRIP, gl.TRAINGLE_FAN
     *      first    指定从哪个位置开始绘制(整型数)
     *      count    指定绘制蓄意用到多少个顶点(整型数)
     * 返回值：
     *      无
     * 错误：
     *      mode错误或者first与count数值错误
     */
    gl.drawArrays(gl.POINTS, 0, 1)
    /**
     * WebGL需要两种着色器
     * 顶点着色器：
     *  描述顶点的特性(位置和颜色等)的程序，顶点：是指二维或三维空间中的一个顶点
     * 片元着色器：
     *  进行逐片元处理过程如光照的程序。片元是一个WebGL术语，你可以将其理解为像素
     *  控制点的颜色，片元就是显示在屏幕上的一个像素，严格意义上说，片元包括这个像素的位置，颜色和其他信息
     */
}

/**
 * 着色器渲染流程：
 *  浏览器执行JavaScript代码 ---> JavaScript执行着色器初始化程序 ---> 顶点着色器与片元着色器绘制图形到颜色缓冲区 ---> 显示到浏览器
 *  初始化着色器之前，顶点着色器和片元着色器都是空白的,我们需要将字符串形式的着色器代码从JavaScript传给webGL系统，建立着色器，这就是initShader()所做的事情
 *  着色器运行在webGL系统中，而不是在JavaScript中
 *
 */