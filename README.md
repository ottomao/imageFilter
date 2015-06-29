# anima-imagefilter [![spm version](http://spmjs.io/badge/anima-imagefilter)](http://spmjs.io/package/anima-imagefilter)

---


## Intro

* ImageFilter是一个移动端端图像处理组件
* 你可以[在Demo页亲自体验到各种效果](/examples/)
* Author : ottomao@gmail.com
* ![ScreenShot](https://t.alipayobjects.com/images/rmsweb/T1wrVgXcXoXXXXXXXX.jpg_600x600q90.jpg)

## Install

```
$ spm install anima-imagefilter --save
```

## Quick Start

```js
var ImageFilter = require('anima-imagefilter');

var srcImage = document.getElementById("myImg");  //页面中需要处理的img节点
var myImgFilter = new ImageFilter(srcImage); 

myImgFilter.gray().blur(3); //灰度处理+高斯模糊。所有处理函数均支持链式表达式。
myImgFilter.render();       //将处理结果渲染回页面

myImgFilter.destroy();      //销毁组件
```

## APIs

### 基本处理

`crop( x , y , width , height )` 图像裁剪

+ x,起始位置的x坐标
+ y,起始位置的y坐标
+ width,切割宽度
+ height,切割高度

`setBrightness ( level )` 设置图片平均亮度

+ level ,亮度值,取[-2.0,2.0]

`setContrast ( level , [ifCalAverage=false] )` 设置图片对比度

+ level ,对比度等级，取值[-2.0,2.0]
+ ifCalAverage，Boolean型，可选，表示是否重新计算亮度值(更精准，但速度慢）。false时取图片默认平均亮度为128。


### 滤镜处理
`blur([radius=1])` 对图片做高斯模糊处理（这个函数性能一般，不要用来处理大图片！）

+ radius为模糊半径，越大越模糊。必须为大于1的整数。


`mixBrown ( [customRGB=[208,163,79] )` 对图片混入褐色，显做旧效果

+ customRGB, 自定义褐色的RGB值,默认[208,163,79]


`mixColor(customRGB)` 混色(混合方法：变暗)

+ customRGB ,需要混入的RGB值,数组，形如[255,0,138]


`reverse()`  对图片做反色处理（负片效果）


`vignetting ( maxLevel  radius )` 对图片做四角压暗/四角变亮

+ maxLevel ,最边缘处的亮度值，[-2.0,2.0]
+ radius ，中心半径值，默认为半宽度的0.35倍


### 其它方法
`destroy()` 销毁组件

`getImageSrc()` 获取图像的Base64编码

`render([target])` 渲染处理后的图片

+ target，可选，将图像渲染到target节点(其标签须是img)。默认为组件初始化时传入的节点。


## 其它说明

* canvas读取像素值需要满足如下任一条件：
	* 使用同域图片
	* base64
	* 请服务器支持CORS头
	* 借用fileAPI直接读取本地文件
	* Ref: 
* 为保证体验流畅，建议一次处理一张图片
* 兼容性要求: 必须提供支持canvas的环境

## 移步Demo页
* 你可以[在Demo页亲自体验到各种效果](/examples/)

