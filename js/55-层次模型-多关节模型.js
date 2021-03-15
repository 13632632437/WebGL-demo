// 顶点着色器
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' + // 顶点坐标
    'attribute vec4 a_Normal;\n' +  // 法向量
    'uniform mat4 u_MvpMatrix;\n' + // 视图投影模型矩阵
    'uniform mat4 u_NormalMatrix;\n' +  // 法向量变换矩阵
    'varying vec4 v_Color;\n' +     // 顶点颜色
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' + // 顶点的世界坐标
    '  vec3 lightDirection = normalize(vec3(0.0, 0.5, 0.7));\n' +    // 光照方向
    '  vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' + // 法向量变换并归一化
    '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +    // 入射光线与法向量的点积
    '  vec4 color = vec4(1.0, 0.4, 0.0, 1.0);\n' + // 基底色
    '  v_Color = vec4(color.rgb * nDotL + vec3(0.1), color.a);\n' + // 漫反射
    '}\n';
// 片元着色器
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +  // 精度限定
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';

function main() {
    var canvas = document.getElementById('demo');
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('获取webGL绘图上下文失败');
        return;
    }
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('着色器初始化失败');
        return;
    }
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('设置顶点信息失败');
        return;
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // 设置清除canvas颜色
    gl.enable(gl.DEPTH_TEST);   // 消除隐藏面
    var viewProjMatrix = new Matrix4(); // 视图投影矩阵
    viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0); // 设置视图矩阵
    viewProjMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);  // 设置投影矩阵

    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_NormalMatrix) {
        console.log('法向量变量u_NormalMatrix存储地址获取失败');
        return;
    }

    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {
        console.log('视图模型投影矩阵u_MvpMatrix存储地址获取失败');
        return;
    }
    // 绘制图形
    draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    // 键盘事件
    window.onkeydown = function (e) {
        keydown(e, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    }
}
// 初始化顶点位置信息
function initVertexBuffers(gl) {
    // 基座顶点位置数组
    var vertices = new Float32Array([
        0.5, 1.0, 0.5, -0.5, 1.0, 0.5, -0.5, 0.0, 0.5, 0.5, 0.0, 0.5,
        0.5, 1.0, 0.5, 0.5, 0.0, 0.5, 0.5, 0.0, -0.5, 0.5, 1.0, -0.5,
        0.5, 1.0, 0.5, 0.5, 1.0, -0.5, -0.5, 1.0, -0.5, -0.5, 1.0, 0.5,
        -0.5, 1.0, 0.5, -0.5, 1.0, -0.5, -0.5, 0.0, -0.5, -0.5, 0.0, 0.5,
        -0.5, 0.0, -0.5, 0.5, 0.0, -0.5, 0.5, 0.0, 0.5, -0.5, 0.0, 0.5,
        0.5, 0.0, -0.5, -0.5, 0.0, -0.5, -0.5, 1.0, -0.5, 0.5, 1.0, -0.5
    ]);
    // 法向量数组
    var normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0
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
    if (!initArrayBuffer(gl, 'a_Position', vertices, gl.FLOAT, 3)) return -1; // 传递顶点数据
    if (!initArrayBuffer(gl, 'a_Normal', normals, gl.FLOAT, 3)) return -1;  // 传递法向量数据
    gl.bindBuffer(gl.ARRAY_BUFFER, null);   // 解绑
    var indexBuffer = gl.createBuffer();    // 创建顶点索引缓冲区
    if (!indexBuffer) {
        console.log('缓冲区创建失败');
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);    // 绑定缓冲区
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);    // 传递顶点索引数据

    return indices.length; // 绘制顶点的个数
}
// 初始化buffer信息
function initArrayBuffer(gl, attribute, data, type, num) {
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('创建buffer失败');
        return false;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer); // 绑定buffer为gl.ARRAY_BUFFER（顶点数据）目标上
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);   // 绑定在target上的缓冲区对象写入数据data
    var a_attribute = gl.getAttribLocation(gl.program, attribute); // 获取attribute变量的存储地址
    if (a_attribute < 0) {
        console.log(attribute + '变量存储地址获取失败');
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0); // 缓冲区对象分配给一个attribute变量
    gl.enableVertexAttribArray(a_attribute);    // 开启attribute变量
    return true;
}

// 绘制图形的方法
var g_modelMatrix = new Matrix4();  // 模型矩阵
var g_mvpMatrix = new Matrix4();    // 视图投影模型矩阵
var g_normalMatrix = new Matrix4(); // 法向量变换矩阵
var g_arm1Angle = 95.0;              // 大臂旋转角度
var g_arm2Angle = 45.0;              // 小臂旋转角度
var g_palm1Angle = 0.0;             // 手掌旋转角度
var g_fingerAngle = 0.0;           // 手指旋转角度
var g_matrixStack = [];             // 保存模型变换矩阵
var ANGLE_STEP = 10.0;               // 旋转角度步长
function draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // 清除颜色缓冲区和深度缓冲区
    // 绘制基座
    var baseHeight = 2.0;
    g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
    drawBox(gl, n, 10.0, baseHeight, 10.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    // 绘制大臂
    var arm1Length = 10.0;
    g_modelMatrix.translate(0.0, baseHeight, 0.0);
    g_modelMatrix.rotate(g_arm1Angle, 0.0, 1.0, 0.0);
    drawBox(gl, n, 3.0, arm1Length, 3.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    // 绘制小臂
    var arm2Length = 10.0;
    g_modelMatrix.translate(0.0, arm1Length, 0.0);
    g_modelMatrix.rotate(g_arm2Angle, 0.0, 0.0, 1.0);
    drawBox(gl, n, 4.0, arm2Length, 4.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    // 绘制手掌
    var palmLength = 2.0;
    g_modelMatrix.translate(0.0, arm2Length, 0.0);
    g_modelMatrix.rotate(g_palm1Angle, 0.0, 1.0, 0.0);
    drawBox(gl, n, 6.0, palmLength, 6.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    // 绘制手指1
    g_modelMatrix.translate(0.0, palmLength, 0.0);
    pushMatrix(g_modelMatrix);
    g_modelMatrix.translate(0.0, 0.0, 2.0);
    g_modelMatrix.rotate(g_fingerAngle, 1.0, 0.0, 0.0);
    drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    g_modelMatrix = popMatrix(g_modelMatrix);
    // 绘制手指2 
    g_modelMatrix.translate(0.0, 0.0, -2.0);
    g_modelMatrix.rotate(-g_fingerAngle, 1.0, 0.0, 0.0);
    drawBox(gl, n, 1.0, 2.0, 1.0, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);

}

// 绘制图形部分公共抽取
function drawBox(gl, n, width, height, depth, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    pushMatrix(g_modelMatrix);  // 保存模型变换矩阵
    g_modelMatrix.scale(width, height, depth); // 缩放
    g_mvpMatrix.set(viewProjMatrix); // g_mvpMatrix设置为视图模型矩阵
    g_mvpMatrix.multiply(g_modelMatrix); // g_mvpMatrix设置为视图模型投影矩阵
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements); // 传递视图模型投影矩阵

    g_normalMatrix.setInverseOf(g_modelMatrix); // 逆矩阵
    g_normalMatrix.transpose(); // 转置矩阵，变为法向量变换矩阵
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);    // 传递法向量变换矩阵
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    g_modelMatrix = popMatrix();// 去除上一次的模型变换矩阵，使之在原来的基础上进行变换
}
// 保存模型变换矩阵的方法
function pushMatrix(m) {
    var m2 = new Matrix4(m);
    g_matrixStack.push(m2);
}
// 取出上一个模型变换矩阵
function popMatrix() {
    return g_matrixStack.pop();
}
// 键盘事件处理函数
function keydown(e, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    console.log(e.keyCode);
    switch (e.keyCode) {
        case 39:
            g_arm1Angle += ANGLE_STEP;
            break;
        case 37:
            g_arm1Angle -= ANGLE_STEP;
            break;
        case 38:
            if (g_arm2Angle < -135) return
            g_arm2Angle -= ANGLE_STEP;
            break;
        case 40:
            if (g_arm2Angle > 135) return
            g_arm2Angle += ANGLE_STEP;
            break;
        case 87:
            g_palm1Angle -= ANGLE_STEP;
            break;
        case 83:
            g_palm1Angle += ANGLE_STEP;
            break;
        case 65:
            if (g_fingerAngle > 45) return
            g_fingerAngle += ANGLE_STEP;
            break;
        case 68:
            if (g_fingerAngle < -45) return
            g_fingerAngle -= ANGLE_STEP;
            break;
        default:
            break;
    }
    draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}