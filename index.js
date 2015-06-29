/**
 * 用于实现图像滤镜与处理，包括明度、饱和度、高斯模糊、做旧效果、四角压暗、灰度、切割等等。
 * @param  {object} config 需要处理的原始img节点 { "imgNode": [HTMLElement] }
 */



//Ref : https://gist.github.com/mjijackson/5311256
/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param     Number    r             The red color value
 * @param     Number    g             The green color value
 * @param     Number    b             The blue color value
 * @return    Array                   The HSL representation
 */
function rgbToHsl(rgbArr) {
    var r,g,b;
    r = rgbArr[0] / 255; g = rgbArr[1] / 255; b = rgbArr[2] / 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return [ h, s, l ];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(hslArr) {
    var h,s,l,r,g,b;
    h = hslArr[0]; s = hslArr[1]; l = hslArr[2];

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [ r * 255, g * 255, b * 255 ];
}

//image data class
var TYPEMAP = {
    "r"    :  1,
    "g"    :  2,
    "b"    :  3,
    "a"    :  4,
    "rgb"  : -1,
    "rgba" : -2
};

function imgData(srcData,width,height){
    this.srcCanvasData = srcData;
    this.data          = srcData.data;
    this.width         = width;
    this.height        = height;
};

imgData.prototype.getImageData = function(){
    return this.data;
};

imgData.prototype.getData = function(x,y,type){
    var typeOffset = TYPEMAP[type] || 1 ;
    var startPos   = ( (y - 1)* this.width + x - 1 ) * 4 - 1; //数组下标从0开始
    if(typeOffset > 0){ //r OR g OR b OR a
        var offset =  startPos + typeOffset ;
        return this.data[ offset ];
    }else if(typeOffset == -1){ //rgb
        var result = [];
        for(var i = startPos + 1 ; i <= startPos + 3 ; i++ ){
            result.push(this.data[i]);
        }
        return result;
    }else{      //rgba
        var result = [];
        for(var i = startPos + 1 ; i <= startPos + 4 ; i++ ){
            result.push(this.data[i]);
        }
        return result;
    }
 };

imgData.prototype.setData = function(x,y,type,value){
    var typeOffset = TYPEMAP[type] || 1 ;
    var startPos   = ( (y - 1)* this.width + x - 1 ) * 4 - 1; //数组下标从0开始
    if(typeOffset > 0){
        var offset =  startPos + typeOffset ;
        this.data[offset] = value;
    }else if(typeOffset == -1 && value.length == 3){
        for(var i= 0 ; i <= 2 ; i++){
            this.data[startPos + i + 1] = value[i];
        }
    }else if(typeOffset == -2 && value.length == 4){
        for(var i= 0 ; i <= 3 ; i++){
            this.data[startPos + i + 1] = value[i];
        }
    }
};   

function ImageFilter(config) {
    var self = this;

    var srcImgNode   = config.imgNode,
        innerTmpCanvas,
        innerCanvasCtx,
        innerCanvasImgData;

    self.width    = srcImgNode.width;
    self.height   = srcImgNode.height;

    //create canvas
    innerTmpCanvas = document.createElement("canvas");
    innerTmpCanvas.style.display = "none";
    innerTmpCanvas.height        = self.height;
    innerTmpCanvas.width         = self.width;
    innerCanvasCtx = innerTmpCanvas.getContext("2d");
    innerCanvasCtx.drawImage(srcImgNode,0,0,self.width,self.height);

    function _updateCanvasData(){
       var canvasData = innerCanvasCtx.getImageData(0 , 0 , self.width ,self.height);
       innerCanvasImgData       = new imgData(canvasData , self.width ,self.height); 
    }
    _updateCanvasData();

    function _updateCanvasDraw(){
        innerCanvasCtx.clearRect(0, 0, self.width, self.height);
        innerCanvasCtx.putImageData( innerCanvasImgData.srcCanvasData, 0, 0);
    }

    function _traversePixel(callback){
        for (var x = 1  ; x <= self.width ; x++){
            for(var y = 1 ; y <= self.height ; y++){
                callback && callback( innerCanvasImgData.getData(x,y,"rgb") , x ,y );
            }
        }
    }

    function _handleBrightness(originData,x,y,level){
        level = level / 100 + 1;
        var originHSL = rgbToHsl( originData );
        var finalRGB  = hslToRgb( [originHSL[0] , originHSL[1] , originHSL[2] * level] );
        innerCanvasImgData.setData(x , y ,"rgb" , finalRGB);  // will auto fit to [0,255]
    }

    /**
     * 转换为灰度图
     * @param  {string} type 灰度计算方法，average/max/""(加权)
     * @return {self}      self
     */
    self.gray = function(type){
        _traversePixel(function(originData,x,y){
            var grayData;
            if(type == "average"){
                grayData = Math.round((originData[0] + originData[1] +  originData[2]) / 3);
            }else if(type == "max"){
                grayData = Math.max(originData[0],originData[1],originData[2]);
            }else{
                grayData = Math.round(originData[0] * 0.3 + originData[1] * 0.59  + originData[2] * 0.11);
            }
            innerCanvasImgData.setData(x,y,"rgb",[grayData,grayData,grayData]);
        });

        _updateCanvasDraw();  
        return self;
    };

    //level : -100 to +100
    //
    
    /**
     * 设置图片平均亮度
     * @method setBrightness
     * @param {number} level 亮度值,取[-100,100]
     */
    self.setBrightness = function(level){
        _traversePixel(function(originData,x,y){
            _handleBrightness(originData,x,y,level);
        });

        _updateCanvasDraw();  
        return self;
    };

  
    /**
     * 设置图片对比度
     * @method setContrast
     * @param {number} level        对比度等级，取值[-100,100]
     * @param {boolean} [ifCalAverage=false] 是否重新计算亮度值(更精准，但速度慢），false时取默认平均亮度为128
     */
    self.setContrast = function(level, ifCalAverage){
        var average = 128;
        level /= 100;

        if(ifCalAverage){
            var sum = 0 ,count = 0;
            _traversePixel(function(originData,x,y){
                sum += originData[0] * 0.3 + originData[1] * 0.59  + originData[2] * 0.11;
                ++count;
            });
            average = sum / count;
        }
        
        //Average + (In – Average) * ( 1 + percent) ,http://blog.csdn.net/pizi0475/article/details/6740428
        _traversePixel(function(originRGB,x,y){
            var finalRGB  = [];
            finalRGB[0] = average + (originRGB[0] - average) * (1 + level); 
            finalRGB[1] = average + (originRGB[1] - average) * (1 + level); 
            finalRGB[2] = average + (originRGB[2] - average) * (1 + level); 
            innerCanvasImgData.setData(x , y ,"rgb" , finalRGB);  // will auto fit to [0,255]
        });

        _updateCanvasDraw();
        return self;
    };

    /**
     * 对图片做反色处理（负片效果）
     * @method reverse
     */
    self.reverse = function(){
        _traversePixel(function(originRGB,x,y){
            var finalRGB = [];
            finalRGB[0] = 255 - originRGB[0];
            finalRGB[1] = 255 - originRGB[1];
            finalRGB[2] = 255 - originRGB[2];
            innerCanvasImgData.setData(x , y ,"rgb" , finalRGB);  // will auto fit to [0,255]
        });

        _updateCanvasDraw();
        return self;
    }

    /**
     * 对图片做四角压暗/变亮
     * @method  vignetting 
     * @param  {number} maxLevel 最边缘处的亮度值，[-100,100]
     * @param  {number} radius   中心半径值，默认为半宽度的0.35倍
     */
    self.vignetting = function(maxLevel,radius){
        radius   = radius   || Math.max(self.width , self.height) * 0.30;
        maxLevel = maxLevel || -40;

        var centerX = self.width  / 2;
        var centerY = self.height / 2;
        var maxOffset = Math.sqrt(centerX * centerX + centerY * centerY) - radius;
        _traversePixel(function(originData,x,y){
            var centerDistanceSqr =  (x - centerX) * (x - centerX) + (y - centerY) * (y - centerY);
            if ( centerDistanceSqr <= (radius * radius) ) return;

            var offsetDistance = Math.sqrt(centerDistanceSqr) - radius;
            var currentLevel   = (offsetDistance / maxOffset) * (offsetDistance / maxOffset) * maxLevel;
            _handleBrightness(originData,x,y,currentLevel);

        });

        _updateCanvasDraw();  
        return self;
    }


    // self.autoTone = function(){
    // }

    /**
     * 设置图片透明度
     * @method setOpacity
     * @param {number} level 透明度，取值[0,1]
     */
    self.setOpacity = function(level){
        var output = level * 255;
        _traversePixel(function(originData,x,y){
            var originOpacity = originData[3];
            innerCanvasImgData.setData(x , y ,"a" , output);  // will auto fit to [0,255]
        });

        _updateCanvasDraw();
        return self;
    };

    /**
     * 对图片做高斯模糊处理
     * @method blur 
     * @param  {number} [radius=1] 模糊半径，越大越模糊。必须为大于1的整数。
     */
    self.blur = function(radius,sigma){
        sigma = 1.5 || sigma;

        var gaussianValue = function(x,y,sigma){
            x = Math.abs(x);
            y = Math.abs(y);
            return 1 / ( 2 * Math.PI * sigma * sigma ) * Math.exp( -(x*x + y*y) / (2 * sigma *sigma)  );
        }

        gaussinaCache = [];                
        for(var x = 0 ; x <= radius ; x++){
            for(var y = 0 ; y <=x ; y++){
                gaussinaCache[x*x + y*y] = gaussianValue(x,y,sigma);
            }
        }
        //weight sum
        sum = 0;
        for(var x = -radius ; x <= radius ; x++){
            for(var y = -radius ; y <= radius ; y++){
                sum += gaussinaCache[x*x + y*y];
            }
        }

        //update each weight
        for(var i = 0 ; i < gaussinaCache.length ; i++){
            gaussinaCache[i] && ( gaussinaCache[i] /= sum );
        }

        _traversePixel(function(originData,x,y){
            var finalRGB = [0 , 0 , 0];
            for( pointX = x - radius ; pointX <= (x + radius) ; ++pointX ){
                for( pointY = y - radius ; pointY <= (y + radius) ; ++pointY ){
                    // debugger
                    var actualPointX ,actualPointY;
                    actualPointX = (pointX > 0       ? pointX        : (x + x - pointX) );
                    actualPointX = (pointX <= self.width ? actualPointX  :  (x - (pointX-x)) );


                    actualPointY = (pointY > 0 ? pointY  : (y + y - pointY) );
                    actualPointY = (pointY <= self.height ? actualPointY :  (y - (pointY-y)) );

                    var offsetX = Math.abs(x - actualPointX);
                    var offsetY = Math.abs(y - actualPointY);

                    var currentRGB = innerCanvasImgData.getData( actualPointX , actualPointY ,"rgb");
                    for (var i = 0 ; i <= 2 ; i ++){
                        finalRGB[i] += currentRGB[i] * gaussinaCache[offsetX * offsetX + offsetY * offsetY];   
                    }
                }
            }
            innerCanvasImgData.setData(x , y ,"rgb" , finalRGB);  // will auto fit to [0,255]
        });

        _updateCanvasDraw();

        return self;
    };

    /**
     * 对图片混入褐色，显做旧效果
     * @method mixBrown
     * @param  {Array} [customRGB=[208,163,79]] 自定义褐色的RGB值,默认[208,163,79]
     */
    self.mixBrown = function(customRGB){
        _traversePixel(function(originData,x,y){
            var overlayRGB = customRGB || [208 ,163,79];
            // var overlayRGB = [224 ,193,137];
            var outputRGB  = [];
            outputRGB[0] = originData[0] < overlayRGB[0] ? originData[0] : overlayRGB[0];
            outputRGB[1] = originData[1] < overlayRGB[1] ? originData[1] : overlayRGB[1];
            outputRGB[2] = originData[2] < overlayRGB[2] ? originData[2] : overlayRGB[2];
            
            innerCanvasImgData.setData(x , y ,"rgb" , outputRGB);  // will auto fit to [0,255]
        });

        _updateCanvasDraw();
        return self;
    }

    /**
     * 混色(混合方法：变暗)
     * @method mixColor
     * @param  {Array} customRGB 需要混入的RGB值
     */
    self.mixColor = function(customRGB){
        if(!customRGB) return;
        _traversePixel(function(originData,x,y){
            var outputRGB  = [];
            outputRGB[0] = originData[0] < customRGB[0] ? originData[0] : customRGB[0];
            outputRGB[1] = originData[1] < customRGB[1] ? originData[1] : customRGB[1];
            outputRGB[2] = originData[2] < customRGB[2] ? originData[2] : customRGB[2];
            
            innerCanvasImgData.setData(x , y ,"rgb" , outputRGB);  // will auto fit to [0,255]
        });

        _updateCanvasDraw();
        return self;
    }

    //线性光
    //完善中
    self.light = function(customRGB){
        _traversePixel(function(originData,x,y){
            var overlayRGB = [24,65,41] ;
            var outputRGB  = [];
            outputRGB[0] = Math.min(255, Math.max(0, (overlayRGB[0] + 2 * originData[0]) - 1));
            outputRGB[1] = Math.min(255, Math.max(1, (overlayRGB[1] + 2 * originData[1]) - 1));
            outputRGB[2] = Math.min(255, Math.max(2, (overlayRGB[2] + 2 * originData[2]) - 1));               
            innerCanvasImgData.setData(x , y ,"rgb" , outputRGB);  // will auto fit to [0,255]
        });

        _updateCanvasDraw();
        return self;
    }


    /**
     * 切割图片
     * @method crop
     * @param  {number} x      起始位置的x坐标
     * @param  {number} y      起始位置的y坐标
     * @param  {number} width  切割宽度
     * @param  {number} height 切割高度
     */
    self.crop = function(x,y,width,height){
        x = x || 0;
        y = y || 0;
        self.width  =  Math.min( width   || self.width  , self.width - x ) ;
        self.height =  Math.min( height  || self.height , self.height - y) ;
        var tmpCanvasData = innerCanvasCtx.getImageData(x,y,self.width,self.height);

        innerTmpCanvas.width  = self.width;
        innerTmpCanvas.height = self.height;
        innerCanvasImgData    = new imgData(tmpCanvasData, self.width, self.height);

        _updateCanvasDraw();
        return self;
    }

    //TODO : degrees other than 0-90
    self.rotate = function(degree){
        //canvas copy
        var tempCanvas    = document.createElement("canvas");

        tempCanvas.height = self.height;
        tempCanvas.width  = self.width;
        tempCanvas.getContext("2d").drawImage(innerTmpCanvas,0,0);

        var rotateRad = degree * Math.PI/180;
        var newWidth  = Math.cos(rotateRad) * self.width + Math.sin(rotateRad) * self.height;
        var newHeight = Math.sin( Math.atan(self.height / self.width) + rotateRad ) * Math.sqrt( self.width*self.width + self.height * self.height );
        var offsetX   = Math.sin(rotateRad) * self.height;

        self.width  =  innerTmpCanvas.width  = newWidth;
        self.height =  innerTmpCanvas.height = newHeight;

        innerCanvasCtx.clearRect(0,0,self.width,self.height);
        innerCanvasCtx.translate(offsetX,0);
        innerCanvasCtx.rotate(rotateRad);
        innerCanvasCtx.drawImage(tempCanvas,0,0);  //redraw with rotate

        _updateCanvasData();

        // _updateCanvasDraw();
        return self;
    }

    /**
     * 获取图片Base64编码
     * @method getImageSrc
     * @return {string} base64编码后的png图片，可以用在img标签的src属性中。
     */
    self.getImageSrc = function(){
        return innerTmpCanvas.toDataURL("image/png");
    };

    /**
     * 渲染图片。只有在render后才能在界面上看到图像处理的结果。
     * @method render
     * @param  {HTMLElement} [target] 将图像渲染到target节点(其标签须是img)，默认为组建初始化时传入的节点
     */
    self.render = function(target){
        target = target || srcImgNode;
        target.src = self.getImageSrc();
        return self;
    };

    /**
     * 销毁组件
     * @method destroy 
     */
    self.destroy = function(){

    };
}

module.exports = ImageFilter;
