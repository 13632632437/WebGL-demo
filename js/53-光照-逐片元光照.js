/**
 * 此前，物体表面颜色由四个顶点得颜色内插产生的。
 * 点光源照射到表面上的颜色与内插出的效果并不完全相同，在某些极端情况下很不一样
 * 所以需要逐片元计算光照效果，即将颜色的计算放到片元着色器
 */

// 顶点着色器
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' + 
    'varying vec4 v_Color;\n' +
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'void main() {\n' +
    '  vec4 color = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
    '  v_Color = color;\n' +
    // 'attribute vec4 a_Position;\n' +                                                 // 顶点位置
    // 'attribute vec4 a_Normal;\n' +                                                   // 法向量
    // 'uniform mat4 u_MvpMatrix;\n' +                                                  // 视图模型投影矩阵
    // 'uniform mat4 u_ModelMatrix;\n' +                                                // 模型矩阵
    // 'uniform mat4 u_NormalMatrix;\n' +                                               // 法向量变换矩阵
    // 'uniform vec3 u_LightColor;\n' +                                                 // 光照颜色
    // 'uniform vec3 u_LightPosition;\n' +                                              // 点光源位置
    // 'uniform vec3 u_AmbientLight;\n' +                                               // 环境光颜色
    // 'varying vec4 v_Color;\n' +                                                      // 物体颜色-基底色
    // 'void main() {\n' +
    // '  vec4 color = vec4(1.0, 1.0, 1.0, 1.0);\n' +                                   // 基底色
    // '  gl_Position = u_MvpMatrix * a_Position;\n' +                                  // 根据视图投影矩阵计算变换后的位置
    // '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +                // 计算变换后的法向量并归一化
    // '  vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +                        // 变换后的顶点位置（世界坐标）-用于计算光照方向
    // '  vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n' + // 计算光照方向 = 光的位置-顶点世界坐标位置
    // '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +                     // 计算光照方向与法向量的点积，用于计算漫反射颜色
    // '  vec3 diffuse = u_LightColor * color.rgb * nDotL;\n' +                         // 计算漫反射的颜色
    // '  vec3 ambient = u_AmbientLight * color.rgb;\n' +                               // 计算环境反射的颜色
    // '  v_Color = vec4(diffuse + ambient, color.a);\n' +                              // 获得经过漫反射和环境反射后的表面颜色
    '}\n';

// 片元着色器
/**
 * 在逐片元计算光照时，需要知道
 * 此片元在世界坐标系下的位置
 * 片元表面的法向量
 * 环境光、光源位置和颜色
 */
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'uniform vec3 u_LightColor;\n' +
    'uniform vec3 u_LightPosition;\n' +
    'uniform vec3 u_AmbientLight;\n' + 
    'varying vec4 v_Color;\n' +
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'void main() {\n' +
    '  vec3 lightDirection = normalize(u_LightPosition - vec3(v_Position));\n'+   // 计算光照方向（光源位置-顶点位置）
    '  float nDotL = max(dot(lightDirection, normalize(v_Normal)), 0.0);\n' +     // 计算光源方向与法向量的点积    
    '  vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +                    // 漫反射
    '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +                          // 环境反射
    '  gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' +                    // 两种反射叠加后的颜色
    '}\n';

function main() {
    var canvas = document.getElementById('demo');

    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('获取WebGL的渲染上下文失败');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('初始化着色器失败。');
        return;
    }

    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('设置顶点信息失败');
        return;
    }

    gl.clearColor(0, 0, 0, 1); // 情况绘图区
    gl.enable(gl.DEPTH_TEST);  // 消除隐藏面
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    if (!u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition || !u_AmbientLight) {
        console.log('获取存储位置失败');
        return;
    }
    gl.uniform3f(u_LightColor, 0.8, 0.8, 0.8);    // 设置光照颜色
    gl.uniform3f(u_LightPosition, 5.0, 8.0, 7.0); // 设置光源位置
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);  // 设置环境光颜色
    var modelMatrix = new Matrix4();              // 模型矩阵
    var mvpMatrix = new Matrix4();                // 视图模型投影矩阵
    var normalMatrix = new Matrix4();             // 法向量变换矩阵

    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);      // 传递变换模型数据
    mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);   // 设置视投影矩阵
    mvpMatrix.lookAt(0, 0, 6, 0, 0, 0, 0, 1, 0);                          // 设置视图矩阵
    mvpMatrix.multiply(modelMatrix);                                      // 设置为视图投影模型矩阵
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);          // 传递视图模型投影矩阵
    normalMatrix.setInverseOf(modelMatrix);                               // 使自身成为矩阵modalMatrix的逆矩阵。
    normalMatrix.transpose();                                             // 对自身进行转置操作，并将自身设为转置后的结果。得到法向量变换矩阵。
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);    // 传递法向量变换矩阵
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);                  // 清除颜色缓冲区和深度缓冲区
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);               // 绘制图像gl.UNSIGNED_SHORT(无符号短整型)
}

function initVertexBuffers(gl) {
    var SPHERE_DIV = 13; // 经纬线份数
    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;
    var positions = [];
    var indices = [];

    // Generate coordinates
    /**
     * 设球心为O半径为r球上一点P，xy平面上P的投影为B，设OP与y夹角为a，OB与z轴夹角为b
     * OB = r * sin a;
     * 得：
     * | x = OB * sin b = r * sin a * sin b;  
     * | y = r  * cos a;
     * | z = OB * cos b = r * sin a * cos b;
     * 
     * 设半径为1：
     * | x =  cosa * sin b;  
     * | y =  sin a;
     * | z =  sin a * cos b;
     */
    for (j = 0; j <= SPHERE_DIV; j++) {
        aj = j * Math.PI / SPHERE_DIV; // 将球体按纬线分成SPHERE_DIV等份（经线方向得夹角）
        sj = Math.sin(aj);
        cj = Math.cos(aj);
        for (i = 0; i <= SPHERE_DIV; i++) {
            ai = i * 2 * Math.PI / SPHERE_DIV; // 纬线方向2Π
            si = Math.sin(ai);
            ci = Math.cos(ai);
            positions.push(si * sj);  // X
            positions.push(cj);       // Y
            positions.push(ci * sj);  // Z
        }
    }
    // 待研究
    // Generate indices
    for (j = 0; j < SPHERE_DIV; j++) {
        for (i = 0; i < SPHERE_DIV; i++) {
            p1 = j * (SPHERE_DIV + 1) + i;
            p2 = p1 + (SPHERE_DIV + 1);

            indices.push(p1);
            indices.push(p2);
            indices.push(p1 + 1);

            indices.push(p1 + 1);
            indices.push(p2);
            indices.push(p2 + 1);
        }
    }

    // Write the vertex property to buffers (coordinates and normals)
    // Same data can be used for vertex and normal
    // In order to make it intelligible, another buffer is prepared separately
    if (!initArrayBuffer(gl, 'a_Position', new Float32Array(positions), gl.FLOAT, 3)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(positions), gl.FLOAT, 3)) return -1;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('创建buffer失败');
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return indices.length;
}
// 初始化buffer
function initArrayBuffer(gl, attribute, data, type, num) {
    var buffer = gl.createBuffer(); // 创建buffer
    if (!buffer) {
        console.log('创建buffer失败');
        return false;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);                          // 绑定buffer
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);            // 向buffer写入数据
    var a_attribute = gl.getAttribLocation(gl.program, attribute);   // 获取需要写入数据的attribute变量
    if (a_attribute < 0) {
        console.log(attribute + "变量存储地址获取失败");
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);     // 将缓冲区对象分配给一个attribute变量
    gl.enableVertexAttribArray(a_attribute);                          // 启用buffer对象赋值给attribute变量
    gl.bindBuffer(gl.ARRAY_BUFFER, null);                            // 取消绑定
    return true;
}