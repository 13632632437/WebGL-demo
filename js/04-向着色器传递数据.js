/**
 * 此前，gl_Position都是写死在着色器中的，可拓展性差
 * 使用attribute变量传递数据（与顶点相关的数据）
 * attribute 变量是一种GLSL ES变量，被用来从外部向着色器内传输数据，只有顶点着色器能使用它
 * 使用步骤：
 *      1. 在顶点着色器种，声明attribute变量；
 *      2. 将attribute变量赋值给gl_Position变量；
 *      3. 向attribute变量传输数据。
*/

//  步骤一
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +          // 变量的声明必须按照此格式：attribute vec4 a_Position; attribute被称为存储限定符  vec4类型四个浮点数组成的矢量   a_Position变量名
    'void main(){\n' +                        // attribute变量的声明在外面，是全局的
    'gl_Position=a_Position;\n' +             // 步骤二
    'gl_PointSize=10.0;\n' +                  // 设置大小
    '}\n';
// 片元着色器程序
var FSHADER_SOURCE = 'void main(){\n' +
    'gl_FragColor=vec4(1.0,1.0,0.0,1.0);\n' + //设置颜色
    '}\n';



function main() {
    // 获取canvas
    const canvas = $("#demo");
    // 获取WebGL绘图上下文时
    var gl = getWebGLContext(canvas[0]);
    if (!gl) {
        console.log("WebGL上下文获取失败");
        return;
    }

    /** 初始化着色器initShaders(gl,vshader,fsahder) */
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('初始化着色器失败');
        return
    }
    /**
     * 步骤3.1 获取attribute变量的存储地址
     * initShaders()会建立顶点着色器，然后webGL会解析着色器，辨识出着色器具有的attribute变量，每个变量都有一个存储地址
     * 以便通过存储地址向变量传输数据，所以当需要向变量传递数据时，首先需要向webGL系统请求该变量的存储地址
     * getAttributeLocation(program,name)
     *      参数：
     *          program         指定包含顶点着色器和片元着色器的着色器程序对象
     *          name            指定想要获取其存储地址的attribute变量的名称
     *      返回值：
     *          if >= 0         attribute变量的存储地址
     *          if <  0         指定的attribute变量不存在，或者其名具有gl_或webgl_前缀
    */

    // 获取attribute变量的存储地址
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    // 校验存储地址是否获取成功
    if (a_Position < 0) {
        console.log("获取a_Positiond的存储位置失败");
        return
    }
    /**
     * 步骤3.2 向attribute变量赋值
     * 一旦将attribute变量的存储地址保存到Javascript变量a_Position中，就需要使用该变量向着色器传入值
     * gl.vertexAttrib3f(location,v0,v1,v2);
     * 参数：
     *      location            指定将要修改的attribute变量的存储位置
     *      v0                  指定填充attribute变量第一个分量的值
     *      v1                  指定填充attribute变量第二个分量的值
     *      v2                  指定填充attribute变量第三个分量的值
    */

    // 将顶点位置传输给attribute变量 
    gl.vertexAttrib3f(a_Position, 0.5, 0.5, 0.0);

    // 指定清空绘图区的颜色
    gl.clearColor(1, 0, 0, 1);
    // 清空绘图区
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制点
    gl.drawArrays(gl.POINTS, 0, 1)

}
