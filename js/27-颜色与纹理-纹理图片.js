/**
 * 纹理坐标：
 *      纹理图像上的坐标，通过纹理坐标可以在纹理图像上获取纹素颜色。
 *      二维标准坐标系，图像在第一象限，为了区分坐标轴使用s和t命名，又叫st坐标系统。
 *      不管图像大小，右上角的坐标始终是(1.0, 1.0)。
 * 
 * 纹理图像贴到几何图形
 *      通过纹理坐标与几何顶点坐标间的映射关系，来确定怎样将纹理图像贴上去。
 * 
 * 纹理贴图步骤：
 *      1. 顶点着色器接收顶点的纹理坐标，光栅化后传递给片元着色器。
 *      2. 片元着色器根据片元的纹理坐标，从纹理图像中抽取出纹素颜色，赋值给当前片元。
 *      3. 设置顶点的纹理坐标。
 *      4. 准备待加载的纹理图像，并读取。
 *      5. 监听纹理图像的加载事件，一旦加载完成，就在WebGL系统中使用纹理。
 */


// 声明顶点着色器
var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +
    'attribute vec2 a_TexCoord;' +
    'varying vec2 v_TexCoord;' +
    'void main() {' +
    'gl_Position = a_Position;' +
    'v_TexCoord = a_TexCoord;' + // 向片元着色器传递纹理坐标
    '}'

// 声明片元着色器
var FSHADER_SOURCE =
    'precision mediump float;' +
    'uniform sampler2D u_Sampler;' +
    /**
     * u_Sampler取样器，接收纹理图像。从纹理图像获取纹素颜色的过程，输入纹理坐标，返回颜色值
     * sampler2D表示纹理的一种特殊的、专用于纹理对象的数据类型。gl.TEXTURE_2D,所以uniform变量是sampler2D
     * gl.TEXTURE_CUBE_MAP为samplerCube
     */
    'varying vec2 v_TexCoord;' +
    'void main() {' +
    ' gl_FragColor = texture2D(u_Sampler, v_TexCoord);' + // 片元着色器从纹理图像上获取纹素颜色，使用纹理坐标从纹理单元获取颜色
    '}'
/**
 * texture2D(sampler2D sampler, vec2 coord); 从sampler指定的纹理上获取coord指定的纹理坐标处的像素颜色。
 *  参数：
 *      sampler     指定纹理单元编号
 *      coord       指定纹理坐标
 * 返回值：
 *      纹理坐标处的颜色，格式有gl.texImage2D()的internalformat指定
 * 
 */
// 主程序
function main() {
    var canvas = $("#demo");
    var gl = getWebGLContext(canvas[0]);
    if (!gl) {
        console.log("WebGL上下文获取失败");
        return
    }
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("着色器初始化失败");
        return
    }
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log("设置顶点位置失败");
        return
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    if (!initTextures(gl, n)) {
        console.log("初始化纹理失败");
        return
    }
}

// 设置顶点位置的函数
function initVertexBuffers(gl) {
    // 3. 设置顶点的纹理坐标。
    var verticesTexCoords = new Float32Array([
        -0.5, 0.5, 0.0, 1.0,
        -0.5, -0.5, 0.0, 0.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, -0.5, 1.0, 0.0,
    ])
    var n = 4;
    // 创建缓冲区对象
    var vertexTexCoordBuffer = gl.createBuffer();
    if (!vertexTexCoordBuffer) {
        console.log("创建缓冲区失败");
        return -1;
    }

    // 绑定缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    // 向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW); // STATIC_DRAW:只会向缓冲区写入一次数据,但需要绘制很多次
    // verticesTexCoords 数组中每个元素的大小，字节数
    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
    // 获取attribute变量a_Position的存储地址
    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if (a_Position < 0) {
        console.log("a_Position获取失败");
        return -1;
    }
    // 将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    // 连接a_Position变量与分配给它的缓冲区对象，开启
    gl.enableVertexAttribArray(a_Position);


    // 获取attribute变量a_TexCoord的存储地址
    var a_TexCoord = gl.getAttribLocation(gl.program, "a_TexCoord");
    if (a_TexCoord < 0) {
        console.log("a_Position获取失败");
        return -1;
    }
    // 将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    // 连接a_Position变量与分配给它的缓冲区对象，开启
    gl.enableVertexAttribArray(a_TexCoord);

    return n;
}

// 4. 准备待加载的纹理图像，并读取。
function initTextures(gl, n) {
    // 创建纹理对象 
    var texture = gl.createTexture();
    if (!texture) {
        console.log("创建纹理对象失败");
        return false
    }
    // 获取u_Sampler的存储位置
    var u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
    if (!u_Sampler) {
        console.log("获取u_Sampler存储地址失败");
        return false
    }
    // 创建一个image对象
    var image = new Image();
    // 注册图像加载完成事件
    image.onload = function () {
        loadTexture(gl, n, texture, u_Sampler, image)
    }
    image.src = "../img/yellowflower.jpg";
    return true
}

// 5. 监听纹理图像的加载事件，一旦加载完成，就在WebGL系统中使用纹理。
function loadTexture(gl, n, texture, u_Sampler, image) {
    // 对纹理进行y轴反转，因为在图像中y轴是向下的(做上点为原点), 而纹理系统y轴是向上的(左下角为原点)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // 开启0号纹理单元
    gl.activeTexture(gl.TEXTURE0);
    // 绑定纹理对象
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // 配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // 配置纹理图像
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // 将纹理传递给着色器，0为纹理单元编号
    gl.uniform1i(u_Sampler, 0);
    // 情况canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制纹理矩形
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}

/**
 * gl.createBuffer(); 创建纹理对象
 *  参数： 无
 *  返回值：
 *        non-null        新创建的纹理对象
 *        null            创建纹理对象失败
 *  错误： 无
 *
 * gl.deleteBuffer(); 删除纹理对象
 *  参数：
 *        texture         待删除的纹理对象
 *  返回值：无
 *  错误：  无
 *
 * gl.pixelStorei(pname,param); 处理加载得到的图像
 *  参数：
 *          pname
 *              gl.UNPACK_FLIP_Y_WEBGL              对图像进行Y轴反转
 *              gl.UNPACK_PREMULIPLY_ALPHA_WEBGL    将图像颜色值的每一个分量乘以A
 *          param   指定非0或0。必须为整数
 *
 * gl.activeTexture(texUnit); 激活纹理单元，在使用纹理单元前需要激活纹理单元
 *     WebGL通过一种称作纹理单元的机制来同时使用多个纹理，每个纹理单元有一个单元编号来管理一张图像
 * 即使只需要一张纹理图像，也需要指定一个纹理单元，系统支持的纹理单元个数取决与硬件和浏览器的WebGL实现
 * WebGL至少支持8个纹理单元
 *  参数：
 *          texUnit     指定激活的纹理单元gl.TEXTURE0，gl.TEXTURE1...gl.TEXTURE7,数字表示纹理单元编号
 *
 * gl.bindTexture(target,texture); 绑定纹理对象
 *      告诉WebGL系统纹理对象使用哪种纹理类型的纹理，开启纹理对象，绑定到这个纹理单元上
 *  WebGL中，无法直接操作纹理对象，必须通过纹理对象绑定到纹理单元上，然后通过操作纹理单元来操作纹理对象
 *  参数：
 *      target
 *                  gl.TEXTURE_2D       二维纹理
 *                  gl.TEXTURE_BUVE_MAP 立方体纹理
 *      texture     表示绑定的纹理单元
 *
 * gl.texParameteri(target, pname, param); 配置纹理参数
 *      设置纹理图像映射到图形上的方式，如何根据纹理坐标获取纹理颜色、按哪种方式填充纹理
 *  将纹理参数pname的值param绑定到target上
 *  参数：
 *      target
 *              gl.TEXTURE_2D       二维纹理
 *              gl.TEXTURE_BUVE_MAP 立方体纹理
 *      pname
 *              gl.TEXTURE_MAG_FILTER   放大方法，表示较小纹理图像填充到较大纹理空间造成的像素空隙的方法
 *              gl.TEXTURE_MIN_FILTER   缩小方法，较大纹理图像填充到较小纹理空间需要剔除像素的方法
 *                      param可选值：
 *                              gl.NEAREST  使用原纹理上距离映射后像素中心最近的那个像素的颜色值
 *                              gl.LINEAR   使用距离新像素中心最近的四个像素的颜色值的加权平均，作为新像素的值
 *              gl.TEXTURE_WRAP_S       水平填充方法，如何对纹理图像左侧或右侧的区域进行填充
 *              gl.TEXTURE_MIN_T        垂直填充方法，如何对纹理图像上方和下方的区域进行填充
 *                      param可选值：
 *                              gl.REPEAT           平铺式的重复纹理
 *                              gl.MIRRORED_REPEAT  镜像对称式的重复纹理
 *                              gl.CLAMP_TO_EDGE    使用纹理图像的边缘值
 *      param
 *  错误：
 *      INVALID_ENUM        target不合法
 *      INVALID_OPERATION   当前目标上没有绑定纹理对象
 *
 * gl.texImage2D(target, level, internalformat, format, type, image); 将image指定的图像分配给绑定到目标上的纹理图像。
 *      此时Image图像就进入到了WebGL系统
 *  参数：
 *      target              gl.TEXTURE_2D或gl.TEXTURE_BUVE_MAP
 *      level               0(该参数为金字塔纹理使用，暂不涉及)
 *      internalformat      图像的内部格式
 *
 *      format              纹理数据的格式，同internalformat相同
 *                          JPG图片，该格式每个像素用RGB三个分量表示，所以为gl.RGB, PNG图像使用gl.RGBA, BMP为gl.RGB,
 *                          gl.LUMINANCE和gl.LUMINANCE_ALPHA通常用在灰度图像上
 *
 *      type                纹理数据的类型
 *                      可选值：
 *                              gl.UNSIGEND_BYTE            无符号整型，每个颜色分量占据1字节
 *                              gl.UNSIGEND_SHORT_5_6_5     RGB: 每个分量分别占据5、6、5比特
 *                              gl.UNSIGEND_SHORT_4_4_4_4   RGBA: 每个分量分别占据4、4、4、4比特
 *                              gl.UNSIGEND_SHORT_5_5_5_1   RGBA: 每个分量各占据5比特，A分量占据1比特
 *
 *      image               包含纹理图像的Image对象
 */