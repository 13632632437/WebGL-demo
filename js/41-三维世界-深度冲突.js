/**
 * 正射投影的可视空间：不管物体与视点是远是近，他有多大，那么画出来就有多大
 * 透视投影：使得场景具有深度感，远处变小
 */
var VSHADER_SOURCE =
    "attribute vec4 a_Position;" + // 顶点数据
    "attribute vec4 a_Color;" +    // 颜色数据
    "varying vec4 v_Color;" +      // 向片元着色器传递颜色数据
    "uniform mat4 u_MvpMatrix;" + // 视图模型投影矩阵
    "void main() {" +
    "gl_Position = u_MvpMatrix * a_Position;" +
    "v_Color = a_Color;" +
    "}"

var FSHADER_SOURCE =
    "precision mediump float;" +
    "varying vec4 v_Color;" +
    "void main() {" +
    "gl_FragColor = v_Color;" +
    "}"

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

    var n = initVertexBuffers(gl)
    if (n < 0) {
        console.log("设置顶点位置失败");
        return
    }
    gl.clearColor(0.1, 0.5, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST); // 消除隐藏面
 
    // 视图模型投影矩阵
    var u_MvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");

    if (!u_MvpMatrix) {
        console.log('视图模型投影矩阵u_MvpMatrix变量存储地址获取失败');
        return;
    }
    var viewMatrix = new Matrix4();
    var projMatrix = new Matrix4();
    var modalMatrix = new Matrix4();
    var mvpMatrix = new Matrix4();
    // 设置视图矩阵
    viewMatrix.setLookAt(3.06, 2.5, 10.0, 0, 0, -2, 0, 1, 0);
    projMatrix.setPerspective(30, canvas[0].width / canvas[0].height, 1, 100)
    mvpMatrix.set(projMatrix).multiply(modalMatrix).multiply(viewMatrix);
    // 第一次绘制右边三个三角形
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_TEST); // 清除颜色缓冲区/清除深度缓冲区

    gl.enable(gl.POLYGON_OFFSET_FILL);      // 启用多边形偏移
    gl.drawArrays(gl.TRIANGLES, 0, n/2);    // 绘制第一个三角形
    gl.polygonOffset(1.0, 1.0);             // 设置多边形偏移
    /**
     *   gl.polygonOffset(factor, units);
     *      指定添加到每个顶点绘制后z值上的偏移量，偏移量按照公式m*factor+r*units
     *      其中m表示顶点所在表面相对与观察者的视线的角度，而r表示硬件能够区分两个z值之差的最小值。
     */
    gl.drawArrays(gl.TRIANGLES, n/2, n/2);  // 绘制第二个三角形
}

function initVertexBuffers(gl) {
    var verticesColors = new Float32Array([

         0.0,  2.5,  -5.0,  0.4,  1.0,  0.4,
        -2.5, -2.5,  -5.0,  0.4,  1.0,  0.4,
         2.5, -2.5,  -5.0,  1.0,  0.4,  0.4, 
    
         0.0,  3.0,  -5.0,  1.0,  0.4,  0.4,
        -3.0, -3.0,  -5.0,  1.0,  1.0,  0.4,
         3.0, -3.0,  -5.0,  1.0,  1.0,  0.4, 

        /**
         * 调整顺序-发现问题Z值没有变化，只是移动了顺序，但是Z值最小的跑到了前面来
         * 默认情况下，WebGL为了加速绘图等操作，是按照顶点在缓冲区中的顺序来处理他们的，之前都是先定义远处的物体故而没有问题
         * 此时当我们修改顺序后问题就出现了
         * 
         * 消除隐藏面：前提是正确设置可视空间
         *      为了解决上述问题，WebGL提供了隐藏面消除，消除那些被遮挡的表面，步骤：
         *  1. 开启隐藏面消除
         *      gl.enable(gl.DEPTH_TEST)
         *            gl.enable(cap)
         *            参数：
         *              cap     gl.DEPATH_TEST          隐藏面消除
         *                      gl.BLEND                混合
         *                      gl.POLYGON_OFFSET_FILL  多边形位移
         * 
         *  2. 清除深度缓冲区(如果要消除隐藏面，那就必须知道每个几何图形的深度信息，而深度缓冲区就是用来存储深度信息的，由于深度方向通常是Z轴方向，所以也称Z缓冲区)
         *      gl.clear(gl.DEPTH_BUFFER_BIT)
         * 
         *  注意：颜色缓冲区也还是需要清除的，可以使用按位或 |   gl.clear(COLOR_BUFFER_BIT | gl.DEPATH_BUFFER_BIT)
         * 
         *  3. 深度冲突
         *      消除隐藏面，在大多数情况下能很好的完任务，但是当两个物体的表面极为接近时，就会出现问题，物体表面上看上去斑斑驳驳，称之为深度冲突
         */
    ])
    var n = 6;
    var verticesSizesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesSizesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);
    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    var a_Position = gl.getAttribLocation(gl.program, "a_Position");
    if (a_Position < 0) {
        console.log('失败');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_Color = gl.getAttribLocation(gl.program, "a_Color");
    if (a_Color < 0) {
        console.log('失败');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);
    return n;
}