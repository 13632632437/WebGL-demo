var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'varying vec4 lightDirection;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'varying vec3 v_Position;\n' +
    'varying vec3 v_Normal;\n' +
    'void main() {\n' +
    '  vec4 color = vec4(1.0,1.0,0.0,1.0);\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    '  v_Position =vec3(u_MvpMatrix * a_Position);\n' +
    '  v_Color = color;\n' +
    '}\n';
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'varying vec3 v_Position;\n' +
    'varying vec3 v_Normal;\n' +
    'uniform vec3 u_LightPosition;\n' +
    'void main() {\n' +
    '  vec3 lightColor = vec3(1.0,1.0,1.0);\n' +
    '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
    '  float nDot = max(dot(lightDirection,normalize(v_Normal)),0.0);\n' +
    '  vec3 diffuse = lightColor * v_Color.rgb * nDot;\n' +
    '  vec3 ambient = vec3(0.5,0.5,0.5) * v_Color.rgb;\n' +
    '  gl_FragColor = vec4(diffuse + ambient,v_Color.a);\n' +
    '}\n';

function main() {
    var canvas = document.getElementById('demo');
    var gl = getWebGLContext(canvas);
    if (!gl) return
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) return
    var n = initVertexBuffers(gl);
    if (n < 0) return
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // 视图投影矩阵
    var viewProjMatrix = new Matrix4();
    viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 100.0);
    viewProjMatrix.lookAt(10.0, 15.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    var u_LightPosition = gl.getUniformLocation(gl.program, "u_LightPosition");
    var u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
    var u_MvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");

    if (u_LightPosition < 0 || u_NormalMatrix < 0 || u_MvpMatrix < 0) return
    gl.uniform3f(u_LightPosition, 10.0, 10.0, 30.0);
    draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
    window.addEventListener("keydown", function (e) {
        keydown(e, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)
    })
}

var g_modelMatrix = new Matrix4();
var g_normalMatrix = new Matrix4();
var g_mvpMatrix = new Matrix4();
var g_step = 3.0;
var g_currentAngle = 0.0;
var g_currentAngle1 = 0.0;

function draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    g_modelMatrix.setTranslate(0.0, -12.0, 0.0);
    g_modelMatrix.rotate(g_currentAngle, 0.0, 1.0, 0.0);
    drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)

    g_modelMatrix.translate(0.0, 10.0, 0.0);
    g_modelMatrix.rotate(g_currentAngle1, 0.0, 0.0, 1.0);
    g_modelMatrix.scale(1.3, 1.0, 1.3);
    drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix)
}
function drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    g_normalMatrix.setInverseOf(g_modelMatrix);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
    g_mvpMatrix.set(viewProjMatrix).multiply(g_modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}
function keydown(e, gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
    switch (e.keyCode) {
        case 38:
            if (g_currentAngle1 < 135) {
                g_currentAngle1 += g_step
            }
            break;
        case 40:
            if (g_currentAngle1 > -135) {
                g_currentAngle1 -= g_step
            }
            break;
        case 39:
            g_currentAngle -= g_step
            break;
        case 37:
            g_currentAngle += g_step
            break;
        default: return; // Skip drawing at no effective action
    }
    draw(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix);
}
function initVertexBuffers(gl) {
    // 前上右后下左（每个面四个点绘制一个矩形）
    var vertexArray = new Float32Array([
        1.5, 0.0, 1.5,   // 0
        1.5, 10.0, 1.5,   // 1
        -1.5, 10.0, 1.5,   // 2
        -1.5, 0.0, 1.5,   // 3  前

        1.5, 10.0, 1.5,   // 4      
        1.5, 10.0, -1.5,   // 5
        -1.5, 10.0, -1.5,   // 6
        -1.5, 10.0, 1.5,   // 7 上   

        1.5, 0.0, 1.5,    // 8      
        1.5, 0.0, -1.5,    // 9
        1.5, 10.0, -1.5,    // 10
        1.5, 10.0, 1.5,    // 11 右

        1.5, 0.0, -1.5,    // 12
        1.5, 10.0, -1.5,    // 13
        -1.5, 10.0, -1.5,    // 14
        -1.5, 0.0, -1.5,    // 15 后

        1.5, 0.0, 1.5,    // 16   
        1.5, 0.0, -1.5,    // 17
        -1.5, 0.0, -1.5,    // 18
        -1.5, 0.0, 1.5,    // 19 下

        -1.5, 0.0, 1.5,    // 20
        -1.5, 10.0, 1.5,    // 21 
        -1.5, 10.0, -1.5,    // 22
        -1.5, 0.0, -1.5,    // 23 左
    ])
    var normals = new Float32Array([
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,

        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,

        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
    ])

    var indexs = new Uint8Array([
        0, 1, 2,
        0, 2, 3,
        4, 5, 6,
        4, 6, 7,
        8, 9, 10,
        8, 10, 11,
        12, 13, 14,
        12, 14, 15,
        16, 17, 18,
        16, 18, 19,
        20, 21, 22,
        20, 22, 23

    ])
    if (!initBuffers(gl, vertexArray, "a_Position") || !initBuffers(gl, normals, "a_Normal")) {
        console.log("buffer初始化失败");
        return -1;
    }
    var indexsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexsBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexs, gl.STATIC_DRAW);
    return indexs.length
}
function initBuffers(gl, data, a_attribute) {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    var a_Attribute = gl.getAttribLocation(gl.program, a_attribute);
    if (a_Attribute < 0) {
        console.log(a_attribute + "存储地址获取失败");
        return false
    }
    gl.vertexAttribPointer(a_Attribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Attribute);
    return true
}
/**
 * 1.  获取WebGL上下文
 * 2.  初始化着色器
 * 3.  设置顶点信息
 *      3.1 顶点位置
 *      3.2 法向量
 *      3.3 绘制顶点索引
 *      3.4 创建顶点，法向量缓冲区
 *      3.5 创建索引缓冲区
 * 4.  清空canvas
 * 5.  消除隐藏面
 * 6.  清除颜色和深度缓冲区
 * 7.  设置视图矩阵
 * 8.  设置投影矩阵
 * 9.  设置模型矩阵
 * 10. 绘制
 */