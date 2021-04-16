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
 * 2. gl.uniformMatrix4fv(location, Transpose, array); 4阶矩阵，v表示向着色器传递多个数据值
 *  参数： 
 *  location    uniform变量的存储位置
 *  Transpose   默认为false,是否转置矩阵，即交换矩阵的行和列，在WebGL没有实现矩阵转置，所以为false
 *  array       待传输的类型化数组，4*4矩阵按列主序存储在其中
 * 
 * 3. gl.enable(cap)
 *    参数：
 *      cap     gl.DEPTH_TEST           隐藏面消除
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
 *      gl.bindBuffer(target，buffer)
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
 * 
 * 13. gl.drawElements(mode, count, type, offset);
 * 执行着色器，按照mode参数指定的方式，根据绑定到gl.ELEMENT_ARRAY_BUFFER的缓冲区的顶点索引绘制图形。
 *  参数：
 *      mode        指定绘制的方式：gl.POINTS\gl.LINES\gl.LINE_STRIP\gl.LINE_LOOP\gl.TRIANGLES\gl.TRIANGLE_STRIP\gl.TRIANGLE_FAN
 *      count       指定绘制顶点的个数（整型数）
 *      type        指定索引值数据类型gl.UNSIGNED_BYTE\gl.UNSIGNED_SHORT
 *      offset      指定索引数组中开始绘制的位置，以字节为单位
 * 错误： 
 *      INVALID_ENUM       mode错误
 *      invalid_value      count\offset错误
 * 
 * 14. gl.createShader(type)
 * 创建由type指定的着色器对象
 * 参数：
 *      type        指定创建的着色器的类型。gl.VERTEX_SHADER表示顶点着色器，gl.FRAGMENT_SHADER表示片元着色器
 * 返回值：
 *      non-null    创建的着色器
 *      null        创建失败
 * 错误:
 *      INVALID_ENUM type参数错误，不是上述其中之一
 * 
 * 15. gl.deleteShader(shader)
 * 删除shader指定的着色器对象
 * 参数：
 *      shader      待删除的着色器对象
 * 注意：已经使用的着色器不会立马删除，而是等他使用结束后删除
 * 
 * 16. gl.shaderSource(shader,source)
 * 将source指定的字符串形式的代码传入shader指定的着色器。如果之前已经想shader传入过代码了，旧的代码将会被替换掉。
 * 参数：
 *      shader      指定要传入代码的着色器对象
 *      source      指定字符串形式的代码
 * 
 * 17. gl.compileShader(shader)
 * 编译shader指定的着色器中的源代码，编译为WebGL系统真正使用的二进制可执行程序
 * 参数：
 *      shader      待编译的着色器
 * 
 * 18. gl.getShaderParameter(shader,pname)
 * 获取shader指定的着色器中，pname指定的参数信息
 * 参数：
 *      shader      指定待获取参数的着色器
 *      pname       指定获取参数的类型
 *                      gl.SHADER_TYPE、gl.DELETE_STATUS、gl.COMPILE_STATUS
 * 返回值：
 *      pname不同返回不同的值
 *      gl.SHADER_TYPE      返回是顶点着色器(gl.VERTEX_SHADER)还是片元着色器(gl.FRAGMENT_SHADER)
 *      gl.DELETE_STATUS    返回着色器是否被删除成功(true\false)
 *      gl.COMPILE_STATUS   返回着色器是否被编译成功(true\false)
 * 错误：INVALID_ENUM       pname的值无效
 * 
 * 19. gl.getShaderInfoLog(shader)
 * 获取shader指定的着色器的信息日志
 * 参数：
 *      shader          指定待获取信息日志的着色器
 * 返回值：
 *      non-null        包含日志信息的字符串
 *      null            没有编译错误
 * 
 * 20. gl.createProgram()
 * 创建程序对象，程序对象包含顶点着色器和片元着色器，gelAttribLocation函数的第一个参数就是此处创建的程序对象
 * 参数：无
 * 返回值：
 *      non-null        创建的程序对象
 *      null            创建失败
 * 
 * 21.gl.deleteProgram(program)
 * 删除propgram指定的程序对象，如果该程序对象正在被使用，则不立即删除，而是等他不在被使用后在删除
 * 参数：
 *      program     指定待删除的程序对象
 * 
 * 22. gl.attachShader(program,shader)
 * 将shader指定的着色器对象分配给program指定的程序对象
 * 参数：
 *      program         指定程序对象    
 *      shader          指定着色器对象（可以是没有着色器代码的空着色器对象）
 * 
 * 23. gl.detachShader(program,shader)
 * 取消shader指定的着色器对象对program指定的程序对象的分配
 * 参数：
 *      program         指定程序对象
 *      shader          指定着色器对象
 * 
 * 24. gl.linkProgram(program)
 * 连接program指定的程序对象中的着色器
 * 参数：
 *      program     指定程序对象
 * 作用：保证顶点着色器和片元着色器的varying变量同名同类型且一一对应、顶点着色器对varying变量赋值了、顶点
 * 着色器和片元着色器同名的uniform变量也同类型、变量的个数没有超过着色器上限
 * 
 * 25. gl.getProgramParameter(program,pname)
 * 获取program指定的程序对象中pname指定的参数信息
 * 1. 程序是否被删除
 * 2. 程序是否连接成功
 * 3. 程序是否验证通过
 * 4. 分配给程序的着色器数量
 * 5. 顶点着色器中attribute变量的数量
 * 6. 程序中uniform变量的数量
 * 
 * 26. gl.getProgramInfoLog(program)
 * 获取program指定的程序对象的信息日志
 * 
 * 27. gl.useProgram(program)
 * 告知WebGL系统绘制时使用program指定的程序对象
 * 
 * 28. gl.readPixels(x,y,width,height,format,type,pixels)
 * 从颜色缓冲区中读取有x、y、width、height参数指定的矩形块中的所有像素值，并保存在pixels中指定的数组中。
 * 参数：
 *  x、y            指定颜色缓冲区中矩形块左上角的坐标，通道hi也是读取的第一个像素的坐标
 *  width、height   指定矩形块的宽度和高度，以像素为单位
 *  format          指定像素值的颜色格式，必须为gl.RGBA
 *  type            指定像素的数据格式，必须为gl.UNSIGEND_BYTE
 *  pixels          指定用来接收像素值数据的Unit8Array类型化数组
 * 
 */