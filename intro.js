//helper functions

//create a gradient from translucent to opaque
function createCloudGradient(cx, cy, start_radius, end_radius) {
  const grad = ctx.createRadialGradient(cx, cy, start_radius, cx, cy, end_radius);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(1, 'rgba(255,255,255,1)');
  return grad;
}

//animate over some duration
function animate(duration, updatefn) {
  return new Promise((resolve, reject) => {
    let start, progress;
    function step(timestamp) {
      if (start === undefined) start = timestamp;
      progress = (timestamp - start)/duration;

      if (progress > 1) {
        resolve();
      } else {
        updatefn(progress);
        window.requestAnimationFrame(step);
      }
    }
    window.requestAnimationFrame(step);
  });
}

//create the gradient for the text
function createTextGradient() {
  var grad = ctx.createLinearGradient(0,0,0,height);
  grad.addColorStop(0, '#ffa006');
  grad.addColorStop(1, '#ffd156');
  return grad;
}

const easing = {
  inverse: function(n) {
    return 1-n;
  },
  cubic: function(n) {
    return n*n*n;
  }
}

//create a canvas element we can draw to
const canvas = document.createElement("canvas");
//overlay everything else
canvas.style.position = "absolute";
canvas.style.top = "0px";
canvas.style.left = "0px";
canvas.style.zIndex = 9000;
//add it to the document
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
//size it to the window
const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;

//calculate how big the circle needs to be to cover the screen
const maxRadius = Math.sqrt(Math.pow(width/2,2) + Math.pow(height/2,2));

//calculate how much space we want between the translucent area and opaque area
const gradientAmount = maxRadius/10;

const fontURL = "url(https://fonts.gstatic.com/s/mousememoirs/v8/t5tmIRoSNJ-PH0WNNgDYxdSb3TDPr7GEch8.woff2)";
const fontName = "Mouse Memoirs";

function updateClouds(progress) {
    ctx.save();
    const gradientStart = progress * maxRadius;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = createCloudGradient(width/2, height/2, gradientStart, gradientStart + gradientAmount);
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
}

function updateText(out) {
  return function(progress) {
    ctx.save();
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 5;
    if (out) {
      ctx.globalAlpha = easing.cubic(easing.inverse(progress));
    } else {
      ctx.globalAlpha = easing.inverse(easing.cubic(easing.inverse(progress)));
    }
    ctx.fillStyle = createTextGradient();
    ctx.textAlign = "center";
    const fontSize = Math.min(width/5, height/5);
    ctx.font = fontSize + "px Mouse Memoirs";
    ctx.fillText("LingoTowns", width/2, height/2);
    ctx.restore();
  }
}

//load custom font
const loadFonts = new FontFace(fontName, fontURL).load();

loadFonts.then(function(font) {
  //perform animations
  document.fonts.add(font);
  // the cloud parting animation
  animate(2000, updateClouds).then(function() {
    //when done, tidy up - removing the canvas
    canvas.remove();
  });
  // the text fade in and fade out animation
  animate(1500, updateText(false)).then(function() {
    return animate(500, updateText(true));
  });
});
