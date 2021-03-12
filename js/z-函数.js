/**
 * 1. gl.clearColor(red,green,blue,alpha); //对应OpenGL ES 2.0或OpenGL中的glClearColor()函数
 * 指定清空canvas的颜色
 * 类似于rgba模式，依次是红绿蓝透明度  其数值的范围都是0.0到1.0
 * 设置的颜色会一直存储于WebGl系统中，直到下次改变它
 * 默认值：
 * 颜色缓冲区：(0.0,0.0,0.0,0.0)    gl.clearColor(red,green,blue,alpha)
 * 深度缓冲区：(1.0)                gl.clearDepth(depth)
 * 模板缓冲区：0                    gl.clearStencil(s)
 *
 * 2. gl.clear(gl.COLOR_BUFFER_BIT) 清空canvas
 * WebGL中的gl.clear()方法继承自OpenGL，基于多基本缓冲区模型
 * 清空绘图区域，实际上是清空颜色缓冲区，传递gl.COLOR_BUFFER_BIT就是告诉WebGL清空颜色缓冲区
 * 缓冲区：颜色缓冲区(gl.COLOR_BUFFER_BIT)、深度缓冲区(gl.DEPTH_BUFFER_BIT)、模板缓冲区(gl.STENCIL_BUFFER_BIT)
 *
 * 3. gl.enable(cap)
 *    参数：
 *      cap     gl.DEPTH_TEST          隐藏面消除
 *              gl.BLEND                混合
 *              gl.POLYGON_OFFSET_FILL  多边形位移
 *
 * 4. gl.clear(gl.COLOR_BUFFER_BIT) 清空canvas
 *    WebGL中的gl.clear()方法继承自OpenGL，基于多基本缓冲区模型
 *    清空绘图区域，实际上是清空颜色缓冲区，传递gl.COLOR_BUFFER_BIT就是告诉WebGL清空颜色缓冲区
 *    缓冲区：颜色缓冲区(gl.COLOR_BUFFER_BIT)、深度缓冲区(gl.DEPTH_BUFFER_BIT)、模板缓冲区(gl.STENCIL_BUFFER_BIT)
 *
 * 5. Martix4.setLookAt(eyeX,eyeY,eyeZ,atX,atY,atZ,upX,upY,upZ)
 *    观察者默认状态：
 *        视点：(0,0,0)
 *        观察点：(0,0,-1)
 *        上方向：(0,1,0)
 * 
 * 6. Matrix4.setPerspective(fov,aspect,near,far);
 * 通过参数计算透视投影矩阵，将其存储在Matrix4中。注意，near必须小于far
 * 参数：
 *      fov         指定垂直视角，即可是空间顶面和底面间的夹角，必须大于0
 *      aspect      指定近裁剪面的宽高比(宽度/高度)
 *      near，far   指定近裁减面和远裁剪面的位置，即可视空间的近边界和远边界(near和far必须大于0)
 * 
 * 7. Matrix4.setPerspective(fov,aspect,near,far);
 * 通过参数计算透视投影矩阵，将其存储在Matrix4中。注意，near必须小于far
 * 参数：
 *      fov         指定垂直视角，即可是空间顶面和底面间的夹角，必须大于0
 *      aspect      指定近裁剪面的宽高比(宽度/高度)
 *      near，far   指定近裁减面和远裁剪面的位置，即可视空间的近边界和远边界(near和far必须大于0)
 * 8. 创建缓冲区对象
 *      gl.createBuffer()
 *          参数： 
 *                  无
 *          返回值： 
 *                  非null   新创建的缓冲区对象
 *                  null     创建缓冲区失败 
 *   
 * 9. 绑定缓冲区对象
 *      gl.bingBuffer(target，buffer)
 *          参数：
 *                 target     可选值glARRAY_BUFFER(表示缓冲区对象包含了顶点的数据)、gl.ELEMENT_ARRAY_BUFFER(表述缓冲区中包含老人顶点的索引值)   
 *                 buffer     指定之前由gl.createBuffer()返回的待绑定的缓冲区对象
 * 
 * 10. 将数据写入缓冲区对象
 *      gl.bufferData(taeget, data, usage) 开辟存储空间，向绑定在target上的缓冲区对象写入数据data
 *          参数:
 *                 target     gl.ARRAY_BUFFER 或 gl.ELEMENT_ARRAY_BUFFER
 *                 data       写入缓冲区的数据（类型化数组）
 *                 usage      
 *                    可选值： 
 *                            gl.STATIC_DRAW        只会向缓冲区写入一次数据,但需要绘制很多次
 *                            gl.STREAN_DRAW        只会向缓冲区写入一次数据，然后绘制若干次
 *                            gl.DYNAMIC_DRAW       会向缓冲区对象多次写入数据，并绘制很多次
 * 
 * 11. 将缓冲区对象分配给一个attribute变量
 *      gl.vertexAttribPointer(location, size, type, normalized, stride, offset)    将整个数组中的所有值一次性地分配给一个attribute变量
 *          参数：
 *                  location    指定待分配的attribute变量的存储位置
 *                  size        指定缓冲区每个顶点的分量个数(1到4)。若size比attribute变量需要的分量数小，缺失分量将按照与gl.vertexAttrib[1234f]()相同的规则不全。  
 *                  type        用以下类型之一来指定数据格式
 *                              gl.UNSIGNED_BYTE    无符号字节，Uint8Array
 *                              gl.SHORT            短整型，Int16Array 
 *                              gl.UNSIGEND_SHORT   无符号短整型，Uint16Array
 *                              gl.INT              整形，Int32Array
 *                              gl.UNSIGNED_INT     无符号整型，Uint32Array
 *                              gl.FLOAT            浮点型，Float32Array
 *                  normalized  传入true和false，表明是否将非浮点型的数据归一
 *                  stride      指定相邻两个顶点间的字节数，默认为0
 *                  offset      指定缓冲区对象中的偏移量（以字节为单位），即attribute变量从缓冲区的何处开始存储，如过是从起始位置开始的，则为0
 * 12. 开启attribute变量
 *      gl.enableVertexAttribArray(location) 为了使顶点着色器能够访问缓冲区内的数据，此时缓冲区对象和attribute变量之间的连接就真正的建立起来了
 *          参数：
 *                  location    指定attribute变量的存储位置
 */