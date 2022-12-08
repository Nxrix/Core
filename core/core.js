//All Rights Reserved 2023 N
//Core.js GLSL viewer

const $ = function(id) { return document.getElementById(id); }

const core = [];

//--styles--//
core.style = `
* {
  margin: 0;
  padding: 0;
  color: white;
}
body {
  height: 100%;
  width: 100%;
  background: #292A36;
}
img {
  display: none;
}
#core_screen {
  image-rendering: pixelated;
  width: 100%;
}
#core_canvas {
  width: 100%;
  position: absolute;
}
@media (orientation: landscape) {
  #core_canvas {
    height: 100vh;
    width: 100vh;
    left: calc(50vw - 50vh);
  }
}`
core.styleSheet = document.createElement("style")
core.styleSheet.innerText = core.style;
document.head.appendChild(core.styleSheet);

//--core assets--//
core.iframe = document.createElement("iframe");
core.iframe.style.display = "none";
core.scripts = document.getElementsByTagName("script");
core.src = core.scripts[core.scripts.length-1].src;
core.iframe.src = core.src.split("core.js")[0]+"core.html";
document.body.appendChild(core.iframe);
core.iframe.onload = function() {
  core.coreBase = core.iframe.contentWindow.document.getElementById("core").innerHTML;
  core.iframe.remove();
}

//--main div--//
core.screen = document.createElement("div");
core.screen.id = "core_screen";
document.body.appendChild(core.screen);

//--error div--//
core.errordiv = document.createElement("div");
core.errordiv.id = "core_canvas";
core.errordiv.classList.add("error");
core.errordiv.style.color = "red";
$("core_screen").appendChild(core.errordiv);

//--canvas--//
core.canvas = document.createElement("canvas");
core.canvas.id = "core_canvas";
$("core_screen").appendChild(core.canvas);
core.gl = core.canvas.getContext("webgl2");

document.body.onload = function() {
  core.res = 512*(eval($("shaderFs").getAttribute("res"))||1/4);
  core.gl.canvas.width = core.res;
  core.gl.canvas.height = core.res;
  core.gl.viewport(0, 0, core.gl.canvas.width, core.gl.canvas.height);

  core.vs_src = "#version 300 es\nin vec4 a_position;\nvoid main() {\ngl_Position = a_position;\n}";

  //--mouse--//
  let mouseX = 0;
  let mouseY = 0;

  function setMousePosition(e) {
    const rect = core.canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = rect.height - (e.clientY - rect.top) - 1;
  }

  core.canvas.addEventListener('mousemove', setMousePosition);
  core.canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
  }, {passive: false});
  core.canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    setMousePosition(e.touches[0]);
  }, {passive: false});

  //--camera--//
  let [Yaw,Pitch,XAcc,YAcc] = [45,35.264,.05,.05];
  let [YawV,PitchV,XOld,YOld] = [0,0,0,0];

  let start = true;
  let start2 = false;

  const el = document.body;
  el.addEventListener('touchstart', touchStart);
  el.addEventListener('touchmove',touchMove);
  el.addEventListener('mousedown', mouseStart);
  el.addEventListener('mousemove', mouseMove);
  el.addEventListener('mouseup', mouseEnd);
  function touchStart() {
    var XOld = event.touches[0].clientX;
    var YOld = event.touches[0].clientY;
    start = true;
  }
  function touchMove() {
    YawV = ((event.touches[0].clientX - XOld) * XAcc) + YawV/4;
    PitchV = ((event.touches[0].clientY - YOld) * YAcc) + PitchV/4;
    if (start == true) {
      XOld = event.touches[0].clientX;
      YOld = event.touches[0].clientY;
      start = false;
    }
  }
  function mouseStart() {
    var XOld = event.clientX;
    var YOld = event.clientY;
    start2 = true;
  }
  function mouseMove() {
    if (start2 == true) {
      YawV = ((event.clientX - XOld) * XAcc) + YawV/4;
      PitchV = ((event.clientY - YOld) * YAcc) + PitchV/4;
    }
    if (start2 == false) {
      XOld = event.clientX;
      YOld = event.clientY;
    }
  }
  function mouseEnd() {
    start2 = false;
  }

  core.fragment = $("shaderFs").innerHTML;
  core.uniforms = "uniform float iTime;\nuniform vec2 iMouse;\nuniform vec2 iResolution;\nuniform vec2 iCamera;";
  core.main = "vec4 outCol;\nvoid main() {mainImage(outCol, gl_FragCoord.xy);\nFragColor=rgb2index(outCol);}";

  //--textures--//
  for (i=0;i<document.getElementsByTagName("img").length;i++) {
    core.image = document.getElementsByTagName("img")[i];
    core.gl.activeTexture(eval("core.gl.TEXTURE"+i));
    if (core.image!=undefined) {
      core.texture = core.gl.createTexture();
      core.gl.bindTexture(core.gl.TEXTURE_2D, core.texture);
      core.gl.bindTexture(core.gl.TEXTURE_2D, core.texture);
      core.gl.texImage2D(core.gl.TEXTURE_2D,0,core.gl.RGBA,core.gl.RGBA,core.gl.UNSIGNED_BYTE,core.image);
      core.gl.generateMipmap(core.gl.TEXTURE_2D);
      core.gl.texParameteri(core.gl.TEXTURE_2D, core.gl.TEXTURE_MIN_FILTER, core.gl.NEAREST);
      core.gl.texParameteri(core.gl.TEXTURE_2D, core.gl.TEXTURE_MAG_FILTER, core.gl.NEAREST);
      core.uniforms = core.uniforms+("\nuniform sampler2D u_image"+i+";");
    }
  }

  core.fs_src = core.coreBase + core.uniforms + core.fragment + core.main;

  core.vs = core.gl.createShader(core.gl.VERTEX_SHADER);
  core.gl.shaderSource(core.vs, core.vs_src);
  core.gl.compileShader(core.vs);

  core.fs = core.gl.createShader(core.gl.FRAGMENT_SHADER);
  core.gl.shaderSource(core.fs, core.fs_src);
  core.gl.compileShader(core.fs);
  core.error = core.gl.getShaderInfoLog(core.fs).split(":");
  core.errorA = [core.error[2],core.error[4]];

  core.program = core.gl.createProgram();
  core.gl.attachShader(core.program, core.vs);
  core.gl.attachShader(core.program, core.fs);
  core.gl.linkProgram(core.program);

  core.gl.detachShader(core.program, core.vs);
  core.gl.detachShader(core.program, core.fs);

  core.gl.useProgram(core.program);

  // look up uniform locations
  core.resolutionLocation = core.gl.getUniformLocation(core.program,"iResolution");
  core.mouseLocation = core.gl.getUniformLocation(core.program,"iMouse");
  core.timeLocation = core.gl.getUniformLocation(core.program,"iTime");
  core.camLocation = core.gl.getUniformLocation(core.program,"iCamera");
  core.imageLocation = [];
  for (i=0;i<document.getElementsByTagName("img").length;i++) {
    core.imageLocation[i] = core.gl.getUniformLocation(core.program, ("u_image"+i));
  }
  core.positionAttributeLocation = core.gl.getAttribLocation(core.program, "a_position");

  core.vao = core.gl.createVertexArray();

  core.gl.bindVertexArray(core.vao);

  core.positionBuffer = core.gl.createBuffer();

  core.gl.bindBuffer(core.gl.ARRAY_BUFFER, core.positionBuffer);

  core.gl.bufferData(core.gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  // first triangle
     1, -1,
    -1,  1,
    -1,  1,  // second triangle
     1, -1,
     1,  1,
  ]), core.gl.STATIC_DRAW);

  core.gl.enableVertexAttribArray(core.positionAttributeLocation);

  core.gl.vertexAttribPointer(
    core.positionAttributeLocation,
    2,
    core.gl.FLOAT,
    false,
    0,
    0,
  );

  if (!core.gl.getProgramParameter(core.program, core.gl.LINK_STATUS)) {
    let log=`fs : ${core.gl.getShaderInfoLog(core.fs)}\npg : ${core.gl.getProgramInfoLog(core.program)}\n`;
    core.canvas.style.display = "none";
    core.nlog = core.gl.getShaderInfoLog(core.fs).split(":");
    core.fslng = core.coreBase + core.uniforms + core.main;
    core.errordiv.innerHTML = core.nlog[0]+" : "+core.nlog[1]+":"+(core.nlog[2]-core.fslng.split(/\r\n|\r|\n/).length+2)+" "+core.nlog[3]+core.nlog[4];
    core.gl.useProgram(null);
    core.gl.deleteProgram(core.program);
  }
  core.gl.deleteShader(core.vs);
  core.gl.deleteShader(core.fs);

  core.debugInfo = core.gl.getExtension('WEBGL_debug_renderer_info');
  core.vendor = core.gl.getParameter(core.debugInfo.UNMASKED_VENDOR_WEBGL);
  core.renderer = core.gl.getParameter(core.debugInfo.UNMASKED_RENDERER_WEBGL);

  console.log(`
    Core ${core.vendor} ${core.renderer}
  `);

  function render(time) {
    time*=.001;
    YawV = YawV*.9;
    Yaw = Yaw+YawV;
    PitchV = PitchV*.9;
    Pitch = Pitch+PitchV;
    core.gl.bindVertexArray(core.vao);
    core.gl.uniform2f(core.resolutionLocation, core.gl.canvas.width, core.gl.canvas.height);
    core.gl.uniform2f(core.mouseLocation, mouseX, mouseY);
    core.gl.uniform1f(core.timeLocation, time);
    core.gl.uniform2f(core.camLocation,Pitch,Yaw);
    for (i=0;i<document.getElementsByTagName("img").length;i++) {
      core.gl.uniform1i(core.imageLocation[i],i);
    }
    core.gl.drawArrays(core.gl.TRIANGLES,0,6);
    core.image = core.gl.canvas.toDataURL();
    requestAnimationFrame(render);
  }
  render();
}
