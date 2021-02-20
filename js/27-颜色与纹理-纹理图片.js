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
    'v_TexCoord = a_TexCoord;' +
    '}'

// 声明片元着色器
var FSHADER_SOURCE =
    'precision mediump float;' +
    'uniform sampler2D u_Sampler;' +
    'varying vec2 v_TexCoord;' +
    'void main() {' +
    ' gl_FragColor = texture2D(u_Sampler, v_TexCoord);' +
    '}'
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
        -0.5,  0.5,  0.0, 1.0,
        -0.5, -0.5,  0.0, 0.0,
         0.5,  0.5,  1.0, 1.0,
         0.5, -0.5,  1.0, 0.0,
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
    if(!texture){
        console.log("创建纹理对象失败");
        return false
    }
    // 获取u_Sampler的存储位置
    var u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
    if(!u_Sampler){
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
    // 对纹理进行y轴反转，因为在图像中y轴是向下的，而纹理系统y轴是向上的
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // 开启0号纹理单元
    gl.activeTexture(gl.TEXTURE0);
    // 绑定纹理对象
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // 配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // 配置纹理图像
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // 将纹理传递给着色器
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
 */