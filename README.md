# SlideShowGL

[![npm](https://img.shields.io/npm/dm/slideshowgl.svg)](https://www.npmjs.com/package/slideshowgl)
[![npm](https://img.shields.io/npm/v/slideshowgl.svg)](https://www.npmjs.com/package/slideshowgl)


SlideShowGL is a javascript-library that you can ues to render images on your website with advanced transformation aniamations.

You can have a look at the already implemented animations on my homepage:
<br/>
# https://mrsoir-fb.firebaseapp.com/SlideShow



## Install

I published SLideShowGL as an npm-package. To Install it, use:
```shell
npm i slideshowgl
```

## Usage

Because SlideShowGL is powered by WebGL2, you need to create a canvas-tag:

HTML:
```js
<canvas id="<your_canvas_id>"/>
// it is importat to an id to the canvas. SlideShowGL internally access the canavas by calling:
// document.getElementById('<your_canvas_id>');
// of course you can create multiple SlideShowGL-canvases per site!
```

Javascript:

1. import the module 
```js
// import:
const SlideShowGL = require('slideshowgl');
```

2. Use the module:

   1. instantiate SlideShowGL:
```js
let sldShw = new SlideShowGL('<your_canvas_id>'); // this is why it is mandatory to assign an id to your canvas-tag
if( sldShw.supportsWebGL2() ){
	// only continue if your browser supports WebGL2!!!
}
```

   2. start the animation:
```js
let slMeta = {
	// mandatory:
	imgPaths: ['path0.png', 'path1.png', 'path2.png'   ],
	// OR:
	images: [new Image()-Objects],

	// optional:
	animationDuration: 3 * 1000,  // 3 seconds
	delayDuration: 5 * 1000, // 5-seconds time lag between image-transitions
	backgroundColor: [0,0,0, 0.0], // transparent background
	animationType: 'Gravity',
	splitDepth: 15 // the image will be split into 2^15 = 32,768 polygons
};
let startedSuccessfully = sldShw.startAnimation(slMeta);
if( !startedSuccessfully ){
	// handle error!
}
```
   The default animation is 'Gravity'. To get a full list of the available animations from which you can choose, you can call:
```js
let animations = SlideShowGL.getAnimationIdentifiers();
// getAnimationIdentifiers is a static function of the SlideShowGL-Class that returns an array of strings
```
   You can use one of these strings to set the `animationType`.
   <br/><br/>
   By calling startAnimation(slMeta), you have to create a JavaScript-Object that at least contains either:
   <br />
   &nbsp;&nbsp;&nbsp;	- imgPaths: array of strings
   <br />
   &nbsp;&nbsp;&nbsp;	- images:   array of 'new Images()'-Objects
   <br />
   If you forward imgPaths to the startAnimation-function, SlideShowGL will load the images itself. This may take a while depending on the image-sizes and bandwidth. To avoid loading times, you can also load the images yourself and forward the images directly as an array of 'new Images()'-Objects.
   <br />
   If you forward imgPaths, then you might want to know, when the loading of the images is completed. You can add a callback-function, that will be called when all images are loaded, right before the animation starts:
```js
sldShw.onImagesLoaded = ()=>{ do something    };
```
   This comes in handy, if you e.g. want to hide the canvas or execute a waiting-indicator as long as the images are still loading.

