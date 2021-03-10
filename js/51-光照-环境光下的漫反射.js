/**
 * 环境反射光颜色 = 入射光颜色 * 表面基底色
 * 当环境反射和漫反射同时存在时
         表面的反射光颜色= 漫反射光颜色 + 环境反射光颜色
 */
var VSHADER_SOURCE =
    "attribute vec4 a_Position;" +         // 顶点数据
    "attribute vec4 a_Color;" +            // 颜色数据
    "varying vec4 v_Color;" +              // 向片元着色器传递颜色数据
    "uniform mat4 u_MvpMatrix;" +          // 视图模型投影矩阵
    "attribute vec4 a_Normal;" +           // 法向量   
    "uniform vec3 u_LightColor;" +         // 光照颜色 
    "uniform vec3 u_LightDirection;" +     // 归一化的世界坐标(光照的方向)即长度|u_LightDirection|为1.0
    'uniform mat4 u_NormalMatrix;' +       // 法向量旋转矩阵
    'uniform vec3 u_AmbientLight;' +       // 环境光颜色
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
    // 计算环境光产生得反射光颜色
    "vec3 ambient = u_AmbientLight * a_Color.rgb;" +
    //  还原为vec4，补上透明度rgba中的a
    "v_Color = vec4(diffuse + ambient,a_Color.a);" +
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
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    if (!u_LightColor || !u_LightDirection || !u_NormalMatrix || !u_AmbientLight) return
    var lightDirection = new Vector3([3, 2.5, 8.0])

    lightDirection.normalize();
    //  设置光照方向
    gl.uniform3fv(u_LightDirection, lightDirection.elements);
    //  设置光照颜色(白色)
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    //  设置环境光颜色
    gl.uniform3f(u_AmbientLight, 0.4,0.4,0.4);

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
 * 法向量变换矩阵为模型矩阵的逆转置矩阵在次推导
 * 设变换前的法向量 n, 正确变换法向量的变换矩阵 M'，变换后的法向量n'
 * 
 * 式1 ===> n' = M' * n
 * 
 * 设平面上一向量 s，s向量的变换矩阵为 M，变换后的向量为 s'
 * 
 * 式2 ===>s' = M * s
 * 
 * 因为法向量垂直于平面上的向量，所以：
 * 
 * 式3 ===> s' .  n' = |s'| |n'| * cos夹角（90°，为0） = 0
 * 
 * 将12式带入3得：
 * 式4===>  (M' * n) . ( M * s) = 0 
 * 又因为
 *  a . b  = |a||b|cos夹角 = (x1x2+y1y2+z1z2) = a^T * b;
 * 
 * 变换式4得：
 * 式5===> (M' * n)^T * ( M * s) = 0 
 * 
 * 
 * 又(a*b)^T = a^T * b^T,得
 * 式6===> n^T * M'^T  *  M * s  = 0 
 * 
 * 又n和s垂直，变换前得法向量和平面上的向量垂直，得
 * n . s = 0 ===> n^T * s = 0 (a . b  = |a||b|cos夹角 = (x1x2+y1y2+z1z2) = a^T * b;)
 * 
 * 比较式6
 * n^T * M'^T  *  M * s  = 0 
 * n^T * s = 0
 * 
 * 可得n^T * M'^T  *  M  =  n^T
 * 
 * ===>  M'^T  *  M = I(单位矩阵)
 * 
 * ===> M'^T = M^-1
 * 
 * ===> M'= (M^-1)^T 即法向量的变换矩阵为模型矩阵的逆转置矩阵
 */