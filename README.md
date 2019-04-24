# SlideShowGL




# window

> Exports a [`jsdom`](https://github.com/tmpvar/jsdom) window object.

[![Build Status](https://travis-ci.org/lukechilds/window.svg?branch=master)](https://travis-ci.org/lukechilds/window)
[![Coverage Status](https://coveralls.io/repos/github/lukechilds/window/badge.svg?branch=master)](https://coveralls.io/github/lukechilds/window?branch=master)
[![npm](https://img.shields.io/npm/dm/window.svg)](https://www.npmjs.com/package/window)
[![npm](https://img.shields.io/npm/v/window.svg)](https://www.npmjs.com/package/window)


SlideShowGL is a javascript-library that you can ues to render images on your website with advanced transformation aniamations.

You can have a look at the already implemented animations on my homepage:
https://mrsoir-fb.firebaseapp.com/SlideShow







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
```

Javascript:

1. import the module 
```js
// import:
const SlideShowGL = require('slideshowgl');
```

2. Use the module:

2.1 instantiate SlideShowGL:
```js
let sldShw = new SlideShowGL('<your_canvas_id>'); // this is why it is mandatory to assign an id to your canvas-tag
if( sldShw.supportsWebGL2() ){
	// only continue if your browser supports WebGL2!!!
}
```

2.2 start the animation:
```js
let slMeta = {
	// mandatory:
	imgPaths: ['path0.png', 'path1.png', 'path2.png'...],
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
by calling startAnimation(slMeta), you have to create a JavaScript-Object that at least contains either:
<br />
	- imgPaths: array of strings
<br />
	- images:   array of 'new Images()'-Objects
<br />
If you forward imgPaths to the startAnimation-function, SlideShowGL will load the images itself. This may take a while depending on the image-sizes and bandwidth. To avoid loading times, you can also load the images yourself and forward the images directly as an array of 'new Images()'-Objects.
<br />
If you forward imgPaths, then you might want to know, when the loading of the images is completed. You can add a callback-function, that will be called when all images are loaded, right before the animation starts:
```js
sldShw.onImagesLoaded = ()=>{ do something... };
```
This comes in handy, if you e.g. want to hide the canvas as long as the images are still loading.


```

You can see an example of this pattern in `lukechilds/create-node`. Specifically [src/create-node.js](https://github.com/lukechilds/create-node/blob/master/src/create-node.js) and  [test/unit.js](https://github.com/lukechilds/create-node/blob/master/test/unit.js).

## What about dependencies?

Sometimes you may have dependencies that you can't pass a window object to. In that scenario you can alternatively use [`browser-env`](https://github.com/lukechilds/browser-env) which will simulate a global browser environment.

## License

MIT © Luke Childs
