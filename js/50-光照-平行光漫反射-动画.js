
var VSHADER_SOURCE =
    "attribute vec4 a_Position;" +         // 顶点数据
    "attribute vec4 a_Color;" +            // 颜色数据
    "varying vec4 v_Color;" +              // 向片元着色器传递颜色数据
    "uniform mat4 u_MvpMatrix;" +          // 视图模型投影矩阵
    "attribute vec4 a_Normal;" +           // 法向量   
    "uniform vec3 u_LightColor;" +         // 光照颜色 
    "uniform vec3 u_LightDirection;" +     // 归一化的世界坐标(光照的方向)即长度|u_LightDirection|为1.0
    'uniform mat4 u_NormalMatrix;' +       // 法向量旋转矩阵
    "void main() {" +
    // 漫反射的颜色 = 入射光的颜色 * 表面基底色 * (入射光线(归一化) * 法向量(归一化))
    // 对法向量归一化,normalize()为GLSL ES内置的函数，a_Normal为vec4类型，前三个分量是法向量，故而需要转化。
    "vec4 normal = u_NormalMatrix * a_Normal ;" +
    // 计算入射光线和法向量的点积,dot()GLSL ES内置计算点击函数，可能会小于0，max取点积和0.0的最大值，即结果须大于等于0
    // 光照照到背面，角度大于90°，点积就为负数
    "float nDotL = max(dot(u_LightDirection,normalize(normal.xyz)),0.0);" +
    // 计算漫反射光的颜色a_Color为vec4类型，透明度与颜色计算无关故转为vec3
    "vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;" +
    "gl_Position = u_MvpMatrix * a_Position;" +
    //  还原为vec4，补上透明度rgba中的a
    "v_Color = vec4(diffuse,a_Color.a);" +
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
    var u_MvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");
    if (!u_MvpMatrix) {
        console.log('视图模型投影矩阵u_MvpMatrix变量存储地址获取失败');
        return;
    }
    gl.clearColor(0.1, 0.5, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST); // 消除隐藏面


    var u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
    var u_LightDirection = gl.getUniformLocation(gl.program, "u_LightDirection");
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_LightColor || !u_LightDirection || !u_NormalMatrix) return
    var lightDirection = new Vector3([3, 2.5, 8.0])

    lightDirection.normalize();
    //  设置光照方向
    gl.uniform3fv(u_LightDirection, lightDirection.elements);
    //  设置光照颜色(白色)
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    var vpMatrix = new Matrix4();    // 视图投影矩阵
    var modalMatrix = new Matrix4(); // 模型矩阵
    var mvpMatrix = new Matrix4();   // 视图模型投影矩阵 = 视图投影矩阵 * 模型矩阵
    var currentAngle = 0.0;// 当前旋转角度
    var normalMatrix = new Matrix4(); // 法线的变换矩阵
    vpMatrix.setPerspective(30, canvas[0].width / canvas[0].height, 1, 100);
    vpMatrix.lookAt(2, 2, 7.0, 0, 0, -2, 0, 1, 0);
    gl.uniformMatrix4fv(u_MvpMatrix, false, vpMatrix.elements);

    var tick = function () {
        currentAngle = animate(currentAngle);
        // 旋转后的模型矩阵
        modalMatrix.setRotate(currentAngle, 0, 1, 0);
        mvpMatrix.set(vpMatrix).multiply(modalMatrix);
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements)
        // 此处计算法向量的旋转暂时不懂
        /**
         * 魔法矩阵: 逆转置矩阵
         *  对顶点变换得矩阵称为模型矩阵
         *  那么如何计算变换后得法向量？
         *  只需要将变换之前得法向量矩阵乘以模型矩阵得逆转置矩阵即可，所谓逆转置矩阵，就是逆矩阵（与原矩阵相乘等于单位矩阵得矩阵）得转置（列变为行）
         */
        normalMatrix.setInverseOf(modalMatrix); // 使自身成为矩阵modalMatrix的逆矩阵。
        normalMatrix.transpose(); // 对自身进行转置操作，并将自身设为转置后的结果。
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
        requestAnimationFrame(tick)
    }
    tick()

}
function initVertexBuffers(gl) {
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    // 顶点位置
    var vertices = new Float32Array([
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0
    ]);
    //  颜色数据
    var colors = new Float32Array([
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0
    ]);
    // 顶点索引
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ]);
    //  法向量，立方体比较特殊，每个顶点对应三个法向量，同时在缓冲区被拆成三个顶点，一些表面光滑的物体，通常每个顶点只有一个法向量
    var normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0
    ]);
    if (!initArrayBuffer(gl, "a_Position", vertices, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, "a_Color", colors, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, "a_Normal", normals, 3, gl.FLOAT)) return -1;

    // 使用索引
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length
}

function initArrayBuffer(gl, attribute, data, num, type) {
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('创建buffer失败');
        return false;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log("获取attribute变量存储地址失败");
        return false
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);// 解除绑定
    return true
}

// 计算旋转角度
var ANGLE_STEP = 30.0; // 步长
var g_last = Date.now(); // 上一次动画执行时间
function animate(angle) {
    var now = Date.now(); // 新的时间
    var elapsed = now - g_last; // 时间差
    g_last = now;
    var newAngle = angle + elapsed / 1000.0 * ANGLE_STEP;
    return newAngle %= 360

}

/**
    http://www.songho.ca/opengl/gl_normaltransform.html

    任意一点的矢量v,与法向量n，及其夹角p(90°,垂直)
    cos p = 0
    n  *v = |n|*|v|*cos p = 0
    则
    n * v = 0;
    即
    (nx,ny,nz,nw)*(x,y,z,w)=0
    (nx * x) + (ny * y) + (nz * z) + (nw * w) = 0
    等价的矩阵运算为：

                        x
    (nx,ny,nz,nw) *   [ y ] = 0
                        z
                        w
    在两者之间插入GL_MODELVIEW矩阵M-1M(矩阵乘以逆矩阵的结果为单位矩阵，不影响结果)，得到法向量变换公式;

                                    x
    (nx,ny,nz,nw) * (M^-1 * M ) * [ y ] = 0
                                    z
                                    w


                                    x
    ((nx,ny,nz,nw) * M^-1) * (M * [ y ]) = 0
                                    z
                                    w                          
    如你所见，上面等式的右边部分M * v将顶点转换为eye space,左边的部分nT(n的转置) *  M^-1是eye space的法向量，因为平面方程也进行了变换。
    它的意思是“转换后的顶点视图矩阵Mv，位于eye space中转换后的平面法向变换上。
    因此，用GL_MODELVIEW矩阵M将物体空间的法线转换为eye space为

      nx eye 
    [ ny eye ] = (nx obj,ny obj,nz obj,nw obj) M^-1
      nz eye 
      nw eye 
    将前乘法转换为后乘法形式，得到:
      nx eye                nx obj 
    [ ny eye ] = (M^-1)^T [ ny obj ]
      nz eye                nz obj 
      nw eye                nw obj 
 */