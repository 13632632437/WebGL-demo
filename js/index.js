/** @type {HTMLCanvasElement} */
// 获取canvas
const canvas = $("#demo");
// 向该元素请求二维图形的绘图上下文
var ctx = canvas[0].getContext('2d');
// 设置填充颜色
ctx.fillStyle='red';
// 绘制有填充的矩形
ctx.fillRect(0,0,120,120);
/**由于canvas元素可以灵活地同时支持二维图形和三维图形，他不直接提供方法
 * 而是提供一种叫上下文的机制来进行绘图
 */

