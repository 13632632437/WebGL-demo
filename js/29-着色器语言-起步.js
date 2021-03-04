/**
 * 着色器语言
 *  注意事项：
 *      1. 大小写敏感
 *      2. 每一句都应该以英文分号结束
 * 
 *  执行顺序：
 *      1. 逐行执行
 *      2. 有且仅有一个main函数，且无参数
 * 
 *  数据值类型：
 *      1. 数值类型(整型数，浮点型数)，区分方式：有无小数点
 *      2. 布尔类型
 *      注意：GLSL ES不支持字符串类型
 * 
 *  变量命名规则：
 *      1. 只包括大小写字母、数字和下划线
 *      2. 变量首字母不能是数字
 *      3. 不能是关键字和保留字
 *      4. 不能以gl_、webgl_或_webgl_开头
 *      5. GLSL ES被称为强类型语言，变量前要指明变量类型
 * 
 *  1.关键字
 *  2.保留字
 *  3.基本数据类型(int,float,bool)
 *  4.数据类型转换(int(float/bool)  float f1 = float(int);
 *  5.float(int/bool)、bool(int/float))
 *  6.运算符
 *  7.矢量和矩阵
 *  8.赋值和构造（赋值时左右变量数据类型必须相同，专门创建指定类型的变量的函数被称为构造函数）
 *      矢量构造函数，vec1234(参数)，参数：数字，只有一个就会复制到其他分量，大于1个且个数不够则会报错，多余的分量将会被丢弃
 *      矩阵构造函数，按主列排序，传入数值，数值和矢量，矢量和矢量，传一个元素会复制到对角线，其他为0.0，如果大于1且数量不够则会报错
 *  9.访问元素，使用.或者[]访问元素（纹理坐标x,y,z,w  颜色r,g,b,a   纹理坐标s,t,p,q）实际x,r,s通用，可互用，都是访问第一个元素v2 = v1.xy从v1中抽取x,y赋值给v2
 *      []访问可是数字，const 声明的整型变量（一定需要const修饰），循环索引值
 *  10.结构体
 *      自定义的类型，使用关键字struct
 *      例如定义： struct light {               使用： light a;      访问a.color;a.position   赋值： a = light(vec4(),vec3()),注意：和定义的顺序保持一致
 *                  vec4 color; 
 *                  vec3 position;
 *                 }
 *      仅仅只支持== 或 != 比较运算符，不支持其他运算
 *  11. 数组
 *      GLSL ES支持数组，仅支持一维数组，不支持数组pop push等操作，声明时需注名类型和数组长度
 *      float floatArray[length] 声明length个浮点数元素的数组
 *      vec4 vec4Array[length]   声明length个vec4对象的数组
 *      注意：length必须是大于0的整数，或const修饰的整型变量，或两者的运算，不能被一次性初始化，需要使用[]+索引显示的告诉其值
 *  12. 取样器(纹理)
 *      取样器(sampler)有两种类型： sampler2D和samplerCube, 取样器变量只能是uniform变量
 *      uniform sampler2D u_Sampler;
 *      赋值： 只能使用纹理单元编号给取样器变量赋值，通过方法gl.uniform1i(u_Samlper,0);
 *      运算:  只能参与比较运算，不能进行其他运算
 *  13. 运算符优先级
 *  14. 程序流程控制(分支和循环)
 *      注意：GLSL ES没有switch语句，过多的if语句会降低着色器的执行速度
 *      for语句，循环变量只能在初始化的时候声明，条件表达式可以没有，则会返回true
 *      注意：只允许有一个循环变量，只能只int或者float类型、循环体内循环变量不能被赋值
 *              跳出循环：continue、break和discard(只能在片元着色器中使用，放弃当前片元处理下一个片元)
 *  15. 函数
 *      返回值类型  函数名(参数类型 参数, 参数类型 参数) {}
 *      注意：定义的参数类型和传入的参数类型必须一致
 *  16. 参数限定词，限制参数传入是否可以被修改，是否传出等
 *      void fun (in float num1, const in float num2... ) {}
 *      in(传入可修改，不影响传入的变量)  const in(传入不可修改)   out(传入可修改并传出，影响外部传入的变量) inout(传入可修改 使用到变量的初始值可修改，影响外部传入的变量) 
 *  17. 内置函数：
 *          角度函数：radians(角度转弧度)、degress(弧度转角度)
 *          三角函数：sin(),cos(),tan(),asin(),acos(),atan()
 *          指数函数：pow(),exp(),log(),exp2(),log2(),sqrt(),incersesqrt()
 *          通用函数：abs(),min(),max(),mod()...;
 *          几何函数：
 *          矩阵函数：
 *          矢量函数：
 *          纹理查询函数：texture2D()...;
 *  18. 全局变量和局部变量
 *  19.存储限定字
 *          const：该变量的值不能被改变，声明的同时必须同时初始化。
 *          attribute：只能出现在顶点着色器中，只能被声明为全局变量，只能是float vec234 mat234。
 *          uniform：可以用在顶点着色器和片元着色器中，必须是全局变量，如果顶点着色器和片元着色器中声明了同名的uniform变量，那么会被两种着色器共享。uniform变量是各顶点或各片元共用的。
 *          varying：必须是全局的，任务是从顶点着色器想片元着色器传输数据，必须在两种着色器中声明同名、同类型的varying变量。
 *  20. 精度限定字
 *      作用: 帮助着色器程序提高运行效率，消减内存开支
 *      highp：高精度，顶点着色器的最低精度 
 *      mediump：中精度，片元着色器的最低精度
 *      lowp：低精度，可以表示所有颜色
 *          例：highp float num
 *      为每个变量都声明精度很繁琐，所以使用关键字precision来声明着色器的默认精度
 *          precision 精度限定字 类型名称
 *          例：precision mediump float；       所有的浮点数默认为中精度
 *  21. 预处理指令
 *      种类一：
 *          #ifdef 某宏
 *          如果定义了某宏就执行这里
 *          #endif
 *          检查是否支持GL_ES宏，如果是就执行
 *      种类二：
 *          #if 条件表达式
 *          if  如果条件表达式为真就执行这里
 *          #endif
 *      种类三：
 *          #ifndef
 *          如果没有定义某宏就执行这里
 *          #endif
 *      定义宏：
 *          #define 宏名 宏内容
 *      接触宏：
 *          #undef 宏名
 *      
 */

// 声明顶点着色器
var VSHADER_SOURCE =
    'attribute vec4 a_Position;' +
    'attribute vec2 a_TexCoord;' +
    'varying vec2 v_TexCoord;' +
    'void main() {' +               // void指明函数没有返回值
    'gl_Position = a_Position;' +
    'v_TexCoord = a_TexCoord;' + // 向片元着色器传递纹理坐标
    '}'

// 声明片元着色器
var FSHADER_SOURCE =
    'precision mediump float;' +
    'uniform sampler2D u_Sampler0;' +
    'uniform sampler2D u_Sampler1;' +
    'varying vec2 v_TexCoord;' +
    'void main() {' +
    ' vec4 color0 = texture2D(u_Sampler0, v_TexCoord);' +
    ' vec4 color1 = texture2D(u_Sampler1, v_TexCoord);' +
    ' gl_FragColor = color0 * color1;' +
    '}'

