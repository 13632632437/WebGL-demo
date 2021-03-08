
 var VSHADER_SOURCE =
 "attribute vec4 a_Position;" +         // 顶点数据
 "attribute vec4 a_Color;" +            // 颜色数据
 "varying vec4 v_Color;" +              // 向片元着色器传递颜色数据
 "uniform mat4 u_MvpMatrix;" +          // 视图模型投影矩阵
 "attribute vec4 a_Normal;" +           // 法向量   
 "attribute vec3 u_LightColor;" +       // 光照颜色 
 "attribute vec3 u_LightDirection;" +   // 归一化的世界坐标(光照的方向)
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
 var u_MvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");
 if (!u_MvpMatrix) {
     console.log('视图模型投影矩阵u_MvpMatrix变量存储地址获取失败');
     return;
 }
 gl.clearColor(0.1, 0.5, 0.0, 1.0);
 gl.enable(gl.DEPTH_TEST); // 消除隐藏面
 gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

 var viewMatrix = new Matrix4();
 var projMatrix = new Matrix4();
 var modalMatrix = new Matrix4();
 var mvpMatrix = new Matrix4();

 viewMatrix.setLookAt(2, 3, 9.0, 0, 0, -2, 0, 1, 0);
 projMatrix.setPerspective(30, canvas[0].width / canvas[0].height, 1, 100)
 mvpMatrix.set(projMatrix).multiply(modalMatrix).multiply(viewMatrix);
 gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
 gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
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
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0 
  ]);
 //  颜色数据
  var colors = new Float32Array([  
     1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,
     1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,
     1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,
     1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,
     1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,
     1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0
  ]);
 // 顶点索引
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,
     4, 5, 6,   4, 6, 7,
     8, 9,10,   8,10,11,
    12,13,14,  12,14,15,
    16,17,18,  16,18,19,
    20,21,22,  20,22,23 
 ]);
//  法向量
var normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0 
  ]);
 if(!initArrayBuffer(gl,"a_Position",vertices,3,gl.FLOAT)) return -1;
 if(!initArrayBuffer(gl,"a_Color",colors,3,gl.FLOAT)) return -1;

 // 使用索引
 var indexBuffer = gl.createBuffer();
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
 gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices, gl.STATIC_DRAW);

 return indices.length
}

function initArrayBuffer(gl,attribute,data,num,type) {
 var buffer = gl.createBuffer();
 if (!buffer) {
     console.log('创建buffer失败');
     return false;
 }
 gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW)
 var a_attribute = gl.getAttribLocation(gl.program,attribute);
 if(a_attribute<0){
     console.log("获取attribute变量存储地址失败");
     return false
 }
 gl.vertexAttribPointer(a_attribute,num,type,false,0,0);
 gl.enableVertexAttribArray(a_attribute);
 gl.bindBuffer(gl.ARRAY_BUFFER,null);// 解除绑定
 return true
}