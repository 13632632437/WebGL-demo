function main() {
    // 获取canvas
    const canvas = $("#demo");
    // 获取WebGL绘图上下文时
    var gl = getWebGLContext(canvas[0]);
    if (!gl) {
        console.log("WebGL上下文获取失败");
        return;
    }
    /**
     * WebGL坐标：
     *      WebGL处理的是三维程序，所有使用的是三维坐标系统，笛卡尔坐标系，有x轴、y轴、z轴
     *      x轴是水平方向的，y轴是垂直方向的，z轴是垂直于屏幕，正方向向外(右手坐标系)
     */
    var VSHADER_SOURCE = 'void main(){\n' +
        'gl_Position=vec4(0.5,0.5,0.0,1.0);\n' + // 设置坐标
        'gl_PointSize=10.0;\n' +                 // 设置大小
        '}\n';
    // 片元着色器程序
    var FSHADER_SOURCE = 'void main(){\n' +
        'gl_FragColor=vec4(0.0,1.0,1.0,1.0);\n' + //设置颜色
        '}\n';
    /** 初始化着色器initShaders(gl,vshader,fsahder) */
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('初始化着色器失败');
        return
    }
    // 指定清空绘图区的颜色
    gl.clearColor(1, 1, 0, 1);
    // 清空绘图区
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制点
    gl.drawArrays(gl.POINTS, 0, 1)

}
