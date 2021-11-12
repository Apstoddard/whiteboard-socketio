'use strict';

(function() {

  var socket = io();
  // This object holds the implementation of each drawing tool.
  var tools = {};
  
  
// Keep everything in anonymous function, called on window load.
if(window.addEventListener) {
window.addEventListener('load', function () {
  var canvas, context, canvaso, contexto;

  // The active tool instance.
  var tool;
  var tool_default = 'pencil';

  function init () {
    // Find the canvas element.
    canvaso = document.getElementById('imageView');

    // Add the temporary canvas.
    var container = canvaso.parentNode;
    canvas = document.createElement('canvas');

    canvas.id     = 'imageTemp';
    canvas.width  = canvaso.width;
    canvas.height = canvaso.height;
    container.appendChild(canvas);

    context = canvas.getContext('2d');
    


    tool = new tools['pencil']();

    
    
      // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

    // Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    //canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mousemove', throttle(ev_canvas, 10), false);
    canvas.addEventListener('mouseup',   ev_canvas, false);
  }

  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.
  function ev_canvas (ev) {
      //console.log(ev)
      var CanvPos = canvas.getBoundingClientRect();  //Global Fix cursor position bug
    if (ev.clientX || ev.clientX == 0) { // Firefox
      //ev._x = ev.clientX;
      ev._x = ev.clientX - CanvPos.left;
     // ev._x = ev.layerX;
      //ev._y = ev.clientY;
      ev._y = ev.clientY - CanvPos.top;
      //ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      //ev._x = ev.offsetX;
      //ev._y = ev.offsetY;
    }
    
    // Call the event handler of the tool.
    var func = tool[ev.type];
    if (func) {
      func(ev);
    }

    
  }
  
  
  // This function draws the #imageTemp canvas on top of #imageView, after which 
  // #imageTemp is cleared. This function is called each time when the user 
  // completes a drawing operation.
  function img_update(trans) {
		contexto.drawImage(canvas, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
//        console.log(tool)
        if (!trans) { return; }

        socket.emit('copyCanvas', {
          transferCanvas: true
        });
  }
  
    function onCanvasTransfer(data){
            img_update();
    }
  
  socket.on('copyCanvas', onCanvasTransfer);

  

  // The drawing pencil.
  function drawPencil(x0, y0, x1, y1, colorPicked="000000", lineWidthPicked=2, emit){
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.strokeStyle = "#"+colorPicked;
        context.stroke();
        context.closePath();

        if (!emit) { return; }
        var w = canvaso.width;
        var h = canvaso.height;

        socket.emit('drawing', {
          x0: x0 / w,
          y0: y0 / h,
          x1: x1 / w,
          y1: y1 / h,
          color: colorPicked,
          lineThickness: lineWidthPicked
        });
    }
    
    function onDrawingEvent(data){
        var w = canvaso.width;
        var h = canvaso.height;
        drawPencil(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.lineThickness);
    }
    
    socket.on('drawing', onDrawingEvent);
  
  
  tools.pencil = function () {
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function (ev) {
        //context.beginPath();
        //context.moveTo(ev._x, ev._y);
        tool.started = true; 
        tool.x0 = ev._x;
        tool.y0 = ev._y;
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (ev) {
      if (tool.started) {
        drawPencil(tool.x0, tool.y0, ev._x, ev._y, "000000", 2, true);
        tool.x0 = ev._x;
        tool.y0 = ev._y;
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update(true);
      }
    };
  };
  


  init();
  
    

}, false); }



//end


})();


