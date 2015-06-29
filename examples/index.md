# Demo

---

<!-- zepto is used for demo -->
<script src="//cdn.bootcss.com/zepto/1.1.6/zepto.min.js"></script>

<div class="imgActionGroup">
    <button action="gray">灰度</button>
    <button action="setContrast">对比度调节</button>
    <button action="setBrightness">亮度调节</button>
    <button action="crop">裁剪</button>
    <button action="mixBrown">做旧效果</button>
    <button action="vignetting">四角压暗</button>
    <button action="mixColor">混色(rgb,117,117,117)</button>
    <button action="blur1">高斯模糊(r=1)</button>
    <button action="blur3">高斯模糊(r=3)</button>
    <button action="reverse">反色（负片）</button>
    <button action="multi">多重处理：做旧,四角压暗,模糊</button>
    <br>
    <button action="reset">重置图片</button>
</div>

<img id="resultImg" src="" />
<style type="text/css">
.imgActionGroup button{
	display: inline-block;
	margin: 5px;
}
</style>



---

## 各种用法

````javascript
var ImageFilter = require('anima-imagefilter'),
    imgEl       = document.getElementById("resultImg"),
    filter;

imgEl.onload = function(){
	filter = new ImageFilter({ imgNode : imgEl });
};

function resetFilter(src){
    imgEl.src = src;
};

resetFilter("./sample.jpg");


$("button").on("click",function(e){
    var action = $(this).attr("action");
    if (!action) return;

    //务必在图片onload之后触发处理函数
    switch(action){
        case "gray":
            filter.gray().render();
            break;
        case "setContrast":
            filter.setContrast(80,true).render();
            break;
        case "setBrightness":
            filter.setBrightness(80).render();
            break;                        
        case "crop":
            filter.crop(2,2,200,200).render();
            break;
        case "mixBrown":
            filter.mixBrown().render();
            break;
        case "vignetting":
            filter.vignetting().render();
            break;
        case "mixColor":
            filter.mixColor([117,117,117]).render();
            break;
        case "blur1":
            filter.blur(1).render();
            break;
        case "blur3":
            filter.blur(3).render();
            break;
        case "reverse":
            filter.reverse().render();
            break;
        case "multi":
            filter.mixBrown().vignetting().blur(1).render();
            break;
        case "reset":
        	filter && filter.destroy();
			resetFilter("./sample.jpg");
			break;
    }

});
````
