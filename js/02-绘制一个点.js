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
        'gl_Position=vec4(0.0,0.0,0.0,1.0);\n' + // 设置坐标
        'gl_PointSize=10.0;\n' +                 // 设置大小 
        '}\n';
    // 片元着色器程序
    var FSHADER_SOURCE = 'void main(){\n' +
        'gl_FragColor=vec4(1.0,0.0,0.0,1.0);\n' + //设置颜色
        '}\n';
    // 初始化着色器
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('初始化着色器失败');
        return
    }
    // 指定清空绘图区的颜色
    gl.clearColor(0, 1, 1, 1);
    // 清空绘图区
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制一个点
    gl.drawArrays(gl.POINTS, 0, 1)
    /**
     * WebGL需要两种着色器
     * 顶点着色器：
     *  描述顶点的特性(位置和颜色等)的程序，顶点：是指二维或三维空间中的一个顶点
     * 片元着色器：
     *  进行逐片元处理过程如光照的程序。片元是一个WebGL术语，你可以将其理解为像素
     */
}