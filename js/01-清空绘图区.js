/** @type {HTMLCanvasElement} */
// 获取canvas
const canvas = $("#demo");
/**
 * 在获取WebGL绘图上下文时，canvas.getContext()函数接收的参数，在不同浏览器中会不同
 * 所以写了一个函数getWebGLContext()来隐藏不同浏览器之间的差异
 * 写于cuon-util.js文件中
 * getWebGLContext获取的绘图上下文可以绘制3维图形
 */

/**
 * getWebGLContext(element,[,debug])
 * @param {element} 指定的canvas元素 
 * @param {boolean} 是否开启调试，默认为false
 * @return non-null(WebGL绘图上下文)   null(WebGL)不可用
*/
var gl = getWebGLContext(canvas[0]);
/**
 * 指定清空canvas的颜色
 * 类似于rgba模式，依次是红绿蓝透明度  其数值的范围都是0.0到1.0
 * 设置的颜色会一直存储于WebGl系统中，直到下次改变它
 * 默认值：
 * 颜色缓冲区：(0.0,0.0,0.0,0.0)    gl.clearColor(red,green,blue,alpha)
 * 深度缓冲区：(1.0)                gl.clearDepth(depth)
 * 模板缓冲区：0                    gl.clearStencil(s)
*/
gl.clearColor(0, 0, 0, 1); //对应OpenGL ES 2.0或OpenGL中的glClearColor()函数
/**
 * gl.clear(gl.COLOR_BUFFER_BIT) 清空canvas
 * WebGL中的gl.clear()方法继承自OpenGL，基于多基本缓冲区模型
 * 清空绘图区域，实际上是清空颜色缓冲区，传递gl.COLOR_BUFFER_BIT就是告诉WebGL清空颜色缓冲区
 * 缓冲区：颜色缓冲区(gl.COLOR_BUFFER_BIT)、深度缓冲区(gl.DEPTH_BUFFER_BIT)、模板缓冲区(gl.STENCIL_BUFFER_BIT)
 */
gl.clear(gl.COLOR_BUFFER_BIT);