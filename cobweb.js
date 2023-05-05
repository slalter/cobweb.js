// cobweb.js
// updates by Scott Alter: smooth iteration over time, frame delay mechanism, speed, gradient color change, sound, recursive iteration.

function HtmlTheme(background, text){
    this.background=background; // HTML background color
    this.text=text; // HTML text color
}

// This defines how the graph should look.
function GraphTheme(fill,border,draw){
    this.fill=fill; // canvas fill color
    this.border=border; // canvas border color
    if(typeof draw=='object'){ // assume that the object is a string...
        this.draw=draw;
    }else{
        this.draw=[draw];
    }
}

// Two basic themes
var brightGraph=new GraphTheme('#fff','#080','#000');
var darkGraph=new GraphTheme('#000','#080','#888');
var testTheme=new GraphTheme('#000','#0f0',['#f00','#0f0','#00f']);

// A graph for drawing mathy things.
function Graph(canvas,theme){
    var xmin=glob.xmin;
    var ymin=glob.ymin;
    var xmax=glob.xmax;
    var ymax=glob.ymax;
    var canvas=canvas;
    var theme=theme;
    var ctx=canvas.getContext('2d');
    var h=canvas.height;
    var w=canvas.width;
    var borderSize=2; // a differently-colored area at the outermost part of the canvas to visually indicate the graph's border
    if(2*borderSize>h || 2*borderSize>w){ // disable border if it's going to be too big
        borderSize=0;
    }
    var edgeSize=borderSize+0.5; // This small buffer zone close to the border keeps the graph from going half a pixel too far, at least in firefox.

    // Change to the next color. Updated to be a linear gradient between color1 and color2.
    var colorIndex=0;
    var nstepsrepeat = 75;
    this.nextColor=function(){
        const color1 = [0,0,255];
        const color2 = [255,20,147];
        currentColor = `rgb(
                        ${color1[0]*(nstepsrepeat-colorIndex%nstepsrepeat)/nstepsrepeat+color2[0]*(colorIndex%nstepsrepeat)/nstepsrepeat}, 
                        ${color1[1]*(nstepsrepeat-colorIndex%nstepsrepeat)/nstepsrepeat+color2[1]*(colorIndex%nstepsrepeat)/nstepsrepeat},
                        ${color1[2]*(nstepsrepeat-colorIndex%nstepsrepeat)/nstepsrepeat+color2[2]*(colorIndex%nstepsrepeat)/nstepsrepeat}
                        )`;
        ctx.strokeStyle = currentColor;
        colorIndex++;
    }

    // Change the theme for future actions.
    this.changeTheme=function(newtheme){
        theme=newtheme;
        this.nextColor();
    }

    // Blank out the canvas to a pristine state.
    this.resetCanvas=function(){
        ctx.clearRect(0,0,w,h);
        // make border
        ctx.fillStyle=theme.border;
        ctx.fillRect(0,0,w,h);

        // fill center however it's actually meant to be filled
        ctx.fillStyle=theme.fill;
        ctx.fillRect(borderSize,borderSize,w-2*borderSize,h-2*borderSize);
        ctx.strokeStyle = "black";
    }

    // convert a mathematical x coordinate to a canvas x coordinate
    function mathToCanvasX(x){
        max=w-edgeSize*2;
        portion=(x-xmin)/(xmax-xmin);
        return portion*max+edgeSize;
    }
    // convert a mathematical y coordinate to a canvas y coordinate
    function mathToCanvasY(y){
        max=w-edgeSize*2;
        portion=(y-ymin)/(ymax-ymin);
        return h-(portion*max+edgeSize);
    }


    // Plot a line segment, using math function x and y coordinates (not canvas coordinates).
    this.plotLine= function(x1,y1,x2,y2){
        
        // convert coordinates
        var cx1=mathToCanvasX(x1);
        var cy1=mathToCanvasY(y1);
        var cx2=mathToCanvasX(x2);
        var cy2=mathToCanvasY(y2);
        var ratio = glob.speed/1000;//decrease for slower speed. NOTE: THIS MEANS A LINE TAKES 1/ratio FRAMES TO COMPLETE.

        if(glob.instant == 0){
            animate(cx1,cy1,cx2,cy2,ratio,0);
        }else{
            ctx.beginPath();
            ctx.moveTo(cx1,cy1);
            ctx.lineTo(cx2,cy2);
            ctx.stroke();
            ctx.closePath();
            // change color for next draw action
            for(i=0;i<8;i++){
            this.nextColor();
            }
        }
        

        
        
    }

   
    //recursively animate each line framebyframe. Contains sound.
    function animate(x1,y1,x2,y2, ratio, current){        
        sx2 = x1+(x2-x1)*current;
        sy2 = y1+(y2-y1)*current;
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(sx2,sy2);
        ctx.stroke();
        ctx.closePath();

        //modify pitch according to x-value. range:220-440 (A to A).
        if(glob.sound){
            glob.audio.oscillator.frequency.value = ((sx2-mathToCanvasX(glob.xmin))/(mathToCanvasX(glob.xmax)-mathToCanvasX(glob.xmin)))*220 +220;
        }
        if(current+ratio <1){
            requestAnimationFrame(function() {
                animate(x1,y1,x2,y2, ratio, current + ratio);
            });
        }else{//finish the line to the exact endpoint.
            ctx.beginPath();
            ctx.moveTo(x1,y1);
            ctx.lineTo(x2,y2);
            ctx.stroke();
            ctx.closePath();               
        }
    
    }
    
    // Plot a function.
    this.plotFunction=function(f){
        // get initial point and distance between points
        ctx.strokeStyle = "black";
        x1=xmin;
        y1=f(x1);
        delta=(xmax-xmin)/(w-2*borderSize);
        // Go thru all point values, with 'delta/2' to avoid rounding error preventing the last point from being drawn.
        // Note: Altho "<" vs "<=" is irrelevant with probability 1, only "<" avoids an infinite loop when xmin==xmax, like when their both zero from nothing being entered.
        for(var x2=xmin+delta; x2<xmax+delta/2; x2+=delta){
            y2=f(x2);
            this.plotLine(x1,y1,x2,y2);
            ctx.strokeStyle = "black";
            x1=x2;
            y1=y2;
        }
    }
}

// helper function for debugging
function log(message) {
    // Note: Getting the line number like this is very browser-specific. This is only tested in Firefox 53 on Linux.
    line=new Error().stack.split('\n')[1].split(':').reverse().splice(0,2).reverse().join(':');
    console.log(line+": "+message);
}

// Parse a mathematical function into a JavaScript function
function parseFunction(func){
    // It's tempting to use "return function(x){return eval(func);};", but that takes about 30% longer.
    eval("var f=function(x){return "+func+";};");
    return f;
}





// GLobal Objects
var glob={};

//instant toggle
function instant(){
    if(glob.instant==0){
        glob.instant = 1;
    }else{
        glob.instant = 0;
    }
}

//sound toggle
function sound(){

    // start audio
    if(!glob.audio){
        var context = new AudioContext();
        glob.audio = context;
        glob.audio.gainNode = glob.audio.createGain();
        glob.audio.oscillator = glob.audio.createOscillator();
        glob.audio.oscillator.connect(glob.audio.gainNode);        
        glob.audio.gainNode.connect(glob.audio.destination);
        glob.audio.oscillator.type = "sine";
        glob.audio.gainNode.gain.exponentialRampToValueAtTime(1,glob.audio.currentTime+.04);
        glob.audio.oscillator.start(0);
    }
         
    
}




//this is gross but it works to recursively delay a line animation by n frames. later, n is found by using the speed.
//Javascript cannot see when the web browser completes drawings, so we have to plan it in advance.
function frameDelay(n,x1,y1,x2,y2){
    if(n>1){
        requestAnimationFrame(function(){frameDelay(n-1,x1,y1,x2,y2)});
    }else{
        requestAnimationFrame(function(){
            graph.plotLine(x1,y1,x2,y2);
            // change color for next draw action
            graph.nextColor();
            if(x2==glob.x1){//this indicates that this is the LAST frameDelay.
               glob.audio.gainNode.gain.setValueAtTime(0,glob.audio.currentTime);
            }
        });
    }
}


//recursively iterate, using the number of iterations to tell us how far to delay our lines.
function letsGo(nthiter, totalIts, currentIt, x1, y1){
    var graph=glob.graph;
    var func=glob.execFunc;
    var x2=y1;
    var y2=func(x2);

    //nth iterate
    for(let i = 1; i<nthiter; i++){
        y2=func(y2);
    }
    if(!glob.instant){
        frameDelay((totalIts-currentIt)*2*1000/glob.speed,x1,y1,x2,x2);
        frameDelay((totalIts-currentIt)*2*1000/glob.speed+1000/glob.speed,x2,x2,x2,y2);
    }else{
        graph.plotLine(x1,y1,x2,x2);
        graph.plotLine(x2,x2,x2,y2);
    }


    x1=x2;
    y1=y2;
    
    //next iter
    if(currentIt>0){
            letsGo(nthiter,totalIts, currentIt - 1, x1, y1);
        }
        else{
            glob.x1=x1;
        }
    }


function cobweb(theme){
    graph= glob.graph;
    iters = glob.iters;
    func = glob.execFunc;
    nthiter = glob.nthiter;
    var x1=glob.x1;
    if(glob.audio&&glob.sound){
        glob.audio.gainNode.gain.setValueAtTime(1,glob.audio.currentTime);

    }
    if(theme){
    	glob.graph.changeTheme(theme);
    }
    
    var y1=func(x1);
    //graph.plotLine(x1,ymin,x1,y1);

    //admittedly not the most intuitive function name. I was really excited when I figured this out. -Scott
    letsGo(nthiter,iters,iters,x1,y1);
    
}

function cont(){
	cobweb();
}

function clearCont(){
	plotFn();
	cobweb(testTheme);
}

function plotFn(){
    glob.graph.changeTheme(brightGraph);
    glob.graph.resetCanvas();
    glob.graph.plotFunction(glob.execFunc);
    glob.graph.plotFunction(function(x){return x});
}

// Generate the requested cobweb diagram.
function generate() {
    startTime=Date.now();

    //reset
    setup()

    //plot cobweb. setTimeout needed to get the correct colors on plotFn()
    setTimeout(()=>{
        cobweb(testTheme);
    },500);

    endTime=Date.now();
    log("Diagram generated in "+(endTime-startTime)+" milliseconds.");
}

//autoruns on page load.
function setup(){
    formToGlob();
    globToHash();
    glob.execFunc=parseFunction(glob.func);
    // get canvas and make graph
    var canvas=get('canvas');
    //graphTheme=darkGraph;
    graphTheme=brightGraph;
    //graphTheme=testTheme;
    var graph=new Graph(canvas,graphTheme);
    graph.resetCanvas();
    glob.graph=graph;
    plotFn();

    //timeout to supress audio from plotFn(). Set up audio.
    setTimeout(()=>{
        glob.sound = document.getElementById("sound").checked;
        if(glob.sound&&!glob.audio){//sound is turned on, but no soundcontext made yet.
            sound();
        }else if(glob.sound&&glob.audio){
            glob.audio.gainNode.gain.exponentialRampToValueAtTime(1,glob.audio.currentTime+.04);
        }
        if(!glob.sound&&glob.audio){
            glob.audio.gainNode.gain.exponentialRampToValueAtTime(0.00001,glob.audio.currentTime+.04);
        }
        glob.speed = 2500/(101-document.getElementById("speed").value);
        glob.instant = document.getElementById("instant").checked;
    },100*(50/glob.speed));
}