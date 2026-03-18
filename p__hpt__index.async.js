"use strict";(self.webpackChunkxyz_cloud_site=self.webpackChunkxyz_cloud_site||[]).push([[776],{91778:function(ue,N,h){h.r(N),h.d(N,{default:function(){return fe}});var G=h(48305),I=h.n(G),C=h(75271),x=h(25633),W=h(19056),B=h(37260),L=h(44141),O=h(73299),R=h(49809),F=h(25298),U=h.n(F),K=h(17069),V=h.n(K),Y=h(82092),a=h.n(Y),T=`
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.0,i1.z,i2.z,1.0))
    +i.y+vec4(0.0,i1.y,i2.y,1.0))
    +i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`,X=`
uniform float particleSizeMax;
uniform float particleSizeMin;
uniform float radius;
uniform float time;
uniform vec3 mousePos;
uniform float explode;
attribute vec3 randomSeed;
varying float vEdgeBrightness;
varying float vRandDiscard;

`.concat(T,`

void main() {
  vec3 p = position;
  vec3 dir = normalize(p);

  // Noise waves for organic surface
  float wave1 = snoise(dir * 1.2 + time * 0.1) * 0.07;
  float wave2 = snoise(dir * 3.0 + time * 0.18 + 5.0) * 0.025;
  float wave3 = snoise(dir * 5.5 + time * 0.3 + 11.0) * 0.01;
  float n = wave1 + wave2 + wave3;
  float noiseRadius = radius * (1.0 + n);
  p = dir * noiseRadius;

  // Edge brightness \u2014 sphere silhouette effect
  vec3 normalDir = normalize(p);
  vec4 worldPos = modelMatrix * vec4(p, 1.0);
  vec3 viewDir = normalize(cameraPosition - worldPos.xyz);
  float facing = dot(normalDir, viewDir);
  float frontMask = step(0.0, facing);
  float visualRadius = sqrt(1.0 - facing * facing);
  vEdgeBrightness = smoothstep(0.5, 1.0, visualRadius) * frontMask;

  // Mouse repulsion
  vec3 diff = p - mousePos;
  float dist = length(diff);
  float pushRadius = 0.6;
  if (dist < pushRadius) {
    float pushFactor = pow(1.0 - dist / pushRadius, 2.0) * 0.35;
    p += normalize(diff) * pushFactor;
  }

  // Scroll explode \u2014 push particles outward along direction
  float explodeDir = snoise(dir * 2.0 + time * 0.05) * 0.5 + 0.5;
  p += dir * explode * (2.0 + explodeDir * 3.0);
  p += randomSeed * explode * 0.8;

  // Random discard seed for fragment
  float baseRand = fract(sin(dot(randomSeed.xy, vec2(12.9898, 78.233))) * 43758.5453);
  float spatialNoise = snoise(dir * 3.0 + time * 0.05) * 0.5 + 0.5;
  vRandDiscard = baseRand * (0.4 + spatialNoise * 0.6);

  // Point size
  float baseSize = mix(particleSizeMin, particleSizeMax, 0.5 + n);
  float densityScale = 0.3 + vEdgeBrightness * 0.7;
  float s = baseSize * densityScale;
  s *= (1.0 - explode * 0.5);

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = s * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`),J=`
uniform vec3 color;
uniform float opacity;
uniform sampler2D map;
uniform float explode;
varying float vEdgeBrightness;
varying float vRandDiscard;

void main() {
  // Discard particles to vary density
  float discardThreshold = (1.0 - vEdgeBrightness) * 0.85;
  if (vRandDiscard < discardThreshold) discard;

  vec4 texColor = texture2D(map, gl_PointCoord);
  float alpha = texColor.a * opacity * vEdgeBrightness;
  alpha *= (1.0 - explode * 0.7);

  if (alpha < 0.01) discard;

  vec3 col = color;
  // Bright white sparkle on edges
  float edgeFactor = smoothstep(0.9, 1.0, vEdgeBrightness);
  float whiteChance = step(0.92, vRandDiscard) * edgeFactor;
  col = mix(col, vec3(1.0), whiteChance * 0.35);

  gl_FragColor = vec4(col, alpha);
}
`,$=`
uniform float time;
uniform float explode;
uniform float particleSize;
attribute vec3 targetPos;
attribute vec3 randomSeed;
varying float vAlpha;

`.concat(T,`

void main() {
  // explode: 0 = no scroll (logo img is visible, particles hidden)
  //          >0 = scrolling (img fades, particles appear then scatter)
  vec3 p = targetPos;

  // Scatter direction \u2014 unique per particle
  vec3 scatterDir = normalize(randomSeed);
  float scatterDist = 2.0 + length(randomSeed) * 1.5;
  float noiseOff = snoise(scatterDir * 2.0 + time * 0.1) * 0.5 + 0.5;
  scatterDist += noiseOff * 2.0;

  // Use explode to drive scatter (particles start at logo position)
  float e = explode;
  p += scatterDir * e * scatterDist;
  // Slight swirl during scatter
  float angle = e * 3.14159 * 0.5 + time * 0.2;
  float cosA = cos(angle * randomSeed.x * 0.3);
  float sinA = sin(angle * randomSeed.y * 0.3);
  p.x += sinA * e * 0.3;
  p.y += cosA * e * 0.3;

  // Alpha: fade in quickly at the start of scroll, then fade out as scatter
  // At explode=0: invisible. At explode~0.05-0.3: fully visible. At explode>0.6: fading out.
  float fadeIn = smoothstep(0.0, 0.08, e);
  float fadeOut = 1.0 - smoothstep(0.3, 1.0, e);
  vAlpha = fadeIn * fadeOut;

  // Subtle float animation when assembled
  p.y += sin(time * 0.8 + targetPos.x * 5.0) * 0.008 * (1.0 - e);
  p.x += cos(time * 0.6 + targetPos.y * 5.0) * 0.005 * (1.0 - e);

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = particleSize * (300.0 / -mvPosition.z) * (1.0 - e * 0.4);
  gl_Position = projectionMatrix * mvPosition;
}
`),Q=`
uniform sampler2D map;
uniform float opacity;
varying float vAlpha;

void main() {
  vec4 texColor = texture2D(map, gl_PointCoord);
  float alpha = texColor.a * opacity * vAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
}
`,q=function(){function m(l,t,i,n){var e=this;U()(this,m),a()(this,"container",void 0),a()(this,"logoSvgUrl",void 0),a()(this,"logoImgEl",null),a()(this,"running",!1),a()(this,"rafId",0),a()(this,"sfScene",void 0),a()(this,"sfCamera",void 0),a()(this,"sfRenderer",void 0),a()(this,"sfGeo",void 0),a()(this,"sfPos",void 0),a()(this,"sfVel",void 0),a()(this,"sfPhases",void 0),a()(this,"sfAccentGeo",void 0),a()(this,"sfAccentPos",void 0),a()(this,"sfAccentPhases",void 0),a()(this,"sfAccentMat",void 0),a()(this,"sfPoints",void 0),a()(this,"sfStars",void 0),a()(this,"spScene",void 0),a()(this,"spCamera",void 0),a()(this,"spRenderer",void 0),a()(this,"spMesh",void 0),a()(this,"spMaterial",void 0),a()(this,"spHitSphere",void 0),a()(this,"spRaycaster",void 0),a()(this,"spMouseNDC",void 0),a()(this,"spSmoothMouse",void 0),a()(this,"spCanvas",void 0),a()(this,"logoMesh",null),a()(this,"logoMaterial",null),a()(this,"logoGeo",null),a()(this,"mouseX",0),a()(this,"mouseY",0),a()(this,"scrollProgress",0),a()(this,"onMouseMove",null),a()(this,"onScroll",null),a()(this,"onResize",null),a()(this,"width",0),a()(this,"height",0),a()(this,"COUNT",420),a()(this,"SPREAD_X",45),a()(this,"SPREAD_Y",30),a()(this,"SPREAD_Z",25),a()(this,"ACCENT_COUNT",28),a()(this,"darkZone",null),a()(this,"animate",function(){if(e.running){e.rafId=requestAnimationFrame(e.animate);for(var o=performance.now()*.001,r=e.sfPos,c=e.sfVel,d=e.sfPhases,u=0;u<e.COUNT;u++){var f=u*3;r[f]+=c[f]+Math.sin(o*.3+d[u])*.0012,r[f+1]+=c[f+1]+Math.cos(o*.2+d[u]*1.3)*.001,r[f+2]+=c[f+2];var g=e.SPREAD_X/2,S=e.SPREAD_Y/2,y=e.SPREAD_Z/2;r[f]>g&&(r[f]=-g),r[f]<-g&&(r[f]=g),r[f+1]>S&&(r[f+1]=-S),r[f+1]<-S&&(r[f+1]=S),r[f+2]>y&&(r[f+2]=-y),r[f+2]<-y&&(r[f+2]=y)}e.sfGeo.attributes.position.needsUpdate=!0;for(var v=e.sfAccentPos,p=e.sfAccentPhases,P=0;P<e.ACCENT_COUNT;P++){var E=P*3;v[E]+=Math.sin(o*.15+p[P])*.002,v[E+1]+=Math.cos(o*.12+p[P]*.7)*.0015}e.sfAccentGeo.attributes.position.needsUpdate=!0,e.sfAccentMat.opacity=.4+Math.sin(o*.4)*.1,e.sfPoints.rotation.y+=(e.mouseX*.06-e.sfPoints.rotation.y)*.015,e.sfPoints.rotation.x+=(-e.mouseY*.04-e.sfPoints.rotation.x)*.015,e.sfStars.rotation.y=e.sfPoints.rotation.y*.5,e.sfStars.rotation.x=e.sfPoints.rotation.x*.5,e.sfRenderer.render(e.sfScene,e.sfCamera),e.spMesh.rotation.y=e.mouseX*.15,e.spMesh.rotation.x=e.mouseY*-.1,e.spHitSphere.rotation.copy(e.spMesh.rotation),e.spRaycaster.setFromCamera(e.spMouseNDC,e.spCamera);var M=e.spRaycaster.intersectObject(e.spHitSphere);if(M.length>0){var j=e.spMesh.worldToLocal(M[0].point.clone());e.spSmoothMouse.lerp(j,.12)}else e.spSmoothMouse.lerp(new THREE.Vector3(999,999,999),.05);var w=e.spMaterial.uniforms;w.time.value=o,w.mousePos.value.copy(e.spSmoothMouse),w.explode.value+=(e.scrollProgress-w.explode.value)*.06;var D=w.explode.value;if(e.logoMaterial){var Z=e.logoMaterial.uniforms;Z.time.value=o,Z.explode.value=D}if(e.logoImgEl){var pe=Math.max(0,1-D*12);e.logoImgEl.style.opacity=String(pe)}e.spRenderer.render(e.spScene,e.spCamera)}}),this.container=l,this.logoSvgUrl=t||"",this.logoImgEl=i||null,this.darkZone=n||null}return V()(m,[{key:"init",value:function(){this.width=this.container.clientWidth,this.height=this.container.clientHeight,this.initStarfield(),this.initSphere(),this.bindEvents(),this.logoSvgUrl&&this.initLogoParticles()}},{key:"sfContainer",get:function(){return this.darkZone||this.container}},{key:"initStarfield",value:function(){var t=this.sfContainer,i=t.clientWidth,n=t.clientHeight;this.sfScene=new THREE.Scene,this.sfCamera=new THREE.PerspectiveCamera(60,i/n,.1,1e3),this.sfCamera.position.z=20,this.sfRenderer=new THREE.WebGLRenderer({antialias:!1,alpha:!0}),this.sfRenderer.setSize(i,n),this.sfRenderer.setPixelRatio(Math.min(devicePixelRatio,2)),this.sfRenderer.setClearColor(0,0),this.sfRenderer.domElement.style.cssText="position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;",t.appendChild(this.sfRenderer.domElement);var e=this.createCircleTexture(),o=[[.85,.82,.75],[.55,.62,.9],[.26,.38,1],[.4,.5,.75],[.7,.75,.95],[.92,.92,.95],[.5,.6,.9],[.65,.72,1]];this.sfGeo=new THREE.BufferGeometry,this.sfPos=new Float32Array(this.COUNT*3);var r=new Float32Array(this.COUNT*3);this.sfVel=new Float32Array(this.COUNT*3),this.sfPhases=new Float32Array(this.COUNT);for(var c=0;c<this.COUNT;c++){var d=c*3;this.sfPos[d]=(Math.random()-.5)*this.SPREAD_X,this.sfPos[d+1]=(Math.random()-.5)*this.SPREAD_Y,this.sfPos[d+2]=(Math.random()-.5)*this.SPREAD_Z-5,this.sfVel[d]=(Math.random()-.5)*.004,this.sfVel[d+1]=(Math.random()-.5)*.003,this.sfVel[d+2]=(Math.random()-.5)*.001,this.sfPhases[c]=Math.random()*Math.PI*2;var u=o[Math.floor(Math.random()*o.length)];r[d]=u[0],r[d+1]=u[1],r[d+2]=u[2]}this.sfGeo.addAttribute("position",new THREE.BufferAttribute(this.sfPos,3)),this.sfGeo.addAttribute("color",new THREE.BufferAttribute(r,3));var f=new THREE.PointsMaterial({size:.1,map:e,vertexColors:THREE.VertexColors,transparent:!0,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:!1,sizeAttenuation:!0});this.sfPoints=new THREE.Points(this.sfGeo,f),this.sfScene.add(this.sfPoints),this.sfAccentGeo=new THREE.BufferGeometry,this.sfAccentPos=new Float32Array(this.ACCENT_COUNT*3);var g=new Float32Array(this.ACCENT_COUNT*3);this.sfAccentPhases=new Float32Array(this.ACCENT_COUNT);for(var S=[[.7,.8,1],[.5,.65,1],[.85,.88,1],[.6,.72,1],[.26,.38,1]],y=0;y<this.ACCENT_COUNT;y++){var v=y*3;this.sfAccentPos[v]=(Math.random()-.5)*this.SPREAD_X,this.sfAccentPos[v+1]=(Math.random()-.5)*this.SPREAD_Y,this.sfAccentPos[v+2]=(Math.random()-.5)*15-2,this.sfAccentPhases[y]=Math.random()*Math.PI*2;var p=S[Math.floor(Math.random()*S.length)];g[v]=p[0],g[v+1]=p[1],g[v+2]=p[2]}this.sfAccentGeo.addAttribute("position",new THREE.BufferAttribute(this.sfAccentPos,3)),this.sfAccentGeo.addAttribute("color",new THREE.BufferAttribute(g,3)),this.sfAccentMat=new THREE.PointsMaterial({size:.22,map:e,vertexColors:THREE.VertexColors,transparent:!0,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:!1,sizeAttenuation:!0}),this.sfStars=new THREE.Points(this.sfAccentGeo,this.sfAccentMat),this.sfScene.add(this.sfStars)}},{key:"isMobile",value:function(){return this.width<=1200}},{key:"getMobilePadding",value:function(){return 36}},{key:"getSphereWidth",value:function(){if(this.isMobile())return this.width-this.getMobilePadding()*2;var t=Math.floor(this.width*.5),i=730;return Math.min(t,i)}},{key:"getSphereHeight",value:function(){if(this.isMobile()){var t=this.getSphereWidth();return t}return this.height}},{key:"applySpherePosition",value:function(){if(this.spCanvas){var t=this.getSphereWidth(),i=this.getMobilePadding();this.isMobile()?(this.spCanvas.style.cssText="position:absolute;top:0;left:".concat(i,"px;z-index:1;pointer-events:none;"),this.spCanvas.style.width=t+"px"):(this.spCanvas.style.cssText="position:absolute;top:0;left:50%;height:100%;z-index:1;pointer-events:none;",this.spCanvas.style.width=t+"px")}}},{key:"initSphere",value:function(){var t=this.getSphereWidth(),i=this.getSphereHeight();this.spScene=new THREE.Scene,this.spCamera=new THREE.PerspectiveCamera(75,t/i,.1,1e3),this.spCamera.position.z=5.5,this.spRenderer=new THREE.WebGLRenderer({alpha:!0,antialias:!0}),this.spRenderer.setPixelRatio(Math.min(devicePixelRatio,2)),this.spRenderer.setSize(t,i),this.spCanvas=this.spRenderer.domElement,this.applySpherePosition(),this.container.appendChild(this.spCanvas);for(var n=this.createDotTexture(),e=new THREE.IcosahedronBufferGeometry(1,5),o=e.attributes.position.count,r=new Float32Array(o*3),c=0;c<o*3;c++)r[c]=(Math.random()-.5)*2;e.addAttribute("randomSeed",new THREE.BufferAttribute(r,3)),this.spMaterial=new THREE.ShaderMaterial({uniforms:{time:{value:0},radius:{value:2.5},particleSizeMin:{value:.002},particleSizeMax:{value:.018},mousePos:{value:new THREE.Vector3(999,999,999)},explode:{value:0},color:{value:new THREE.Color(12439295)},opacity:{value:.55},map:{value:n}},vertexShader:X,fragmentShader:J,transparent:!0,blending:THREE.AdditiveBlending,depthTest:!1,depthWrite:!1}),this.spMesh=new THREE.Points(e,this.spMaterial),this.spScene.add(this.spMesh),this.spRaycaster=new THREE.Raycaster,this.spMouseNDC=new THREE.Vector2(999,999),this.spHitSphere=new THREE.Mesh(new THREE.SphereGeometry(2.5,16,16),new THREE.MeshBasicMaterial({visible:!1})),this.spScene.add(this.spHitSphere),this.spSmoothMouse=new THREE.Vector3(999,999,999)}},{key:"initLogoParticles",value:function(){var t=this,i=new Image;i.crossOrigin="anonymous",i.onload=function(){try{var n=t.sampleSvgPixels(i);if(n.length===0)return;t.createLogoMesh(n)}catch(e){console.warn("Logo particle init failed:",e)}},i.onerror=function(){return console.warn("Failed to load logo SVG for particles")},i.src=this.logoSvgUrl}},{key:"sampleSvgPixels",value:function(t){var i=128,n=document.createElement("canvas");n.width=i,n.height=i;var e=n.getContext("2d");e.drawImage(t,0,0,i,i);for(var o=e.getImageData(0,0,i,i).data,r=[],c=2,d=0;d<i;d+=c)for(var u=0;u<i;u+=c){var f=(d*i+u)*4,g=o[f+3];g>128&&r.push({x:u/i-.5,y:-(d/i-.5)})}return r}},{key:"createLogoMesh",value:function(t){var i=t.length;if(i!==0){for(var n=1.2,e=new Float32Array(i*3),o=new Float32Array(i*3),r=0;r<i;r++){var c=r*3;e[c]=t[r].x*n,e[c+1]=t[r].y*n,e[c+2]=0,o[c]=(Math.random()-.5)*2,o[c+1]=(Math.random()-.5)*2,o[c+2]=(Math.random()-.5)*2}this.logoGeo=new THREE.BufferGeometry,this.logoGeo.addAttribute("position",new THREE.BufferAttribute(e.slice(),3)),this.logoGeo.addAttribute("targetPos",new THREE.BufferAttribute(e,3)),this.logoGeo.addAttribute("randomSeed",new THREE.BufferAttribute(o,3));var d=this.createDotTexture();this.logoMaterial=new THREE.ShaderMaterial({uniforms:{time:{value:0},explode:{value:0},particleSize:{value:.012},opacity:{value:.9},map:{value:d}},vertexShader:$,fragmentShader:Q,transparent:!0,blending:THREE.AdditiveBlending,depthTest:!1,depthWrite:!1}),this.logoMesh=new THREE.Points(this.logoGeo,this.logoMaterial),this.spScene.add(this.logoMesh)}}},{key:"createCircleTexture",value:function(){var t=64,i=t/2,n=document.createElement("canvas");n.width=n.height=t;var e=n.getContext("2d"),o=e.createRadialGradient(i,i,0,i,i,i);return o.addColorStop(0,"rgba(255,255,255,1)"),o.addColorStop(.3,"rgba(255,255,255,0.8)"),o.addColorStop(.7,"rgba(255,255,255,0.15)"),o.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=o,e.fillRect(0,0,t,t),new THREE.CanvasTexture(n)}},{key:"createDotTexture",value:function(){var t=32,i=document.createElement("canvas");i.width=i.height=t;var n=i.getContext("2d");return n.beginPath(),n.arc(t/2,t/2,t/2,0,Math.PI*2),n.fillStyle="#FFFFFF",n.fill(),new THREE.CanvasTexture(i)}},{key:"bindEvents",value:function(){var t=this;this.onMouseMove=function(i){t.mouseX=(i.clientX/window.innerWidth-.5)*2,t.mouseY=(i.clientY/window.innerHeight-.5)*2;var n=t.spCanvas.getBoundingClientRect();t.spMouseNDC.x=(i.clientX-n.left)/n.width*2-1,t.spMouseNDC.y=-((i.clientY-n.top)/n.height)*2+1},this.onScroll=function(){var i=t.container.getBoundingClientRect(),n=Math.max(0,Math.min(1,-i.top/(i.height*.6)));t.scrollProgress=n},this.onResize=function(){t.width=t.container.clientWidth,t.height=t.container.clientHeight;var i=t.sfContainer,n=i.clientWidth,e=i.clientHeight;t.sfCamera.aspect=n/e,t.sfCamera.updateProjectionMatrix(),t.sfRenderer.setSize(n,e);var o=t.getSphereWidth(),r=t.getSphereHeight();t.spCamera.aspect=o/r,t.spCamera.updateProjectionMatrix(),t.spRenderer.setSize(o,r),t.applySpherePosition()},window.addEventListener("mousemove",this.onMouseMove,{passive:!0}),window.addEventListener("scroll",this.onScroll,{passive:!0}),window.addEventListener("resize",this.onResize)}},{key:"start",value:function(){this.running||(this.running=!0,this.animate())}},{key:"stop",value:function(){this.running=!1,cancelAnimationFrame(this.rafId)}},{key:"dispose",value:function(){var t,i,n,e,o,r,c,d,u;this.stop(),this.onMouseMove&&window.removeEventListener("mousemove",this.onMouseMove),this.onScroll&&window.removeEventListener("scroll",this.onScroll),this.onResize&&window.removeEventListener("resize",this.onResize),(t=this.sfRenderer)!==null&&t!==void 0&&(t=t.domElement)!==null&&t!==void 0&&t.parentNode&&this.sfRenderer.domElement.parentNode.removeChild(this.sfRenderer.domElement),(i=this.spCanvas)!==null&&i!==void 0&&i.parentNode&&this.spCanvas.parentNode.removeChild(this.spCanvas),(n=this.sfRenderer)===null||n===void 0||n.dispose(),(e=this.spRenderer)===null||e===void 0||e.dispose(),(o=this.sfGeo)===null||o===void 0||o.dispose(),(r=this.sfAccentGeo)===null||r===void 0||r.dispose(),(c=this.spMaterial)===null||c===void 0||c.dispose(),(d=this.logoGeo)===null||d===void 0||d.dispose(),(u=this.logoMaterial)===null||u===void 0||u.dispose()}}]),m}(),_=Object.defineProperty,A=Object.getOwnPropertySymbols,ee=Object.prototype.hasOwnProperty,te=Object.prototype.propertyIsEnumerable,H=(m,l,t)=>l in m?_(m,l,{enumerable:!0,configurable:!0,writable:!0,value:t}):m[l]=t,se=(m,l)=>{for(var t in l||(l={}))ee.call(l,t)&&H(m,t,l[t]);if(A)for(var t of A(l))te.call(l,t)&&H(m,t,l[t]);return m};const me=m=>React.createElement("svg",se({width:104,height:104,fill:"none",xmlns:"http://www.w3.org/2000/svg"},m),React.createElement("circle",{cx:52,cy:52,r:10,stroke:"#fff",strokeWidth:3}),React.createElement("circle",{cx:52,cy:52,r:4,fill:"#fff"}),React.createElement("circle",{cx:52,cy:18,r:7,stroke:"#fff",strokeWidth:2.5}),React.createElement("path",{stroke:"#fff",strokeWidth:2,opacity:.6,d:"M52 25v17"}),React.createElement("circle",{cx:22,cy:78,r:7,stroke:"#fff",strokeWidth:2.5}),React.createElement("path",{stroke:"#fff",strokeWidth:2,opacity:.6,d:"m28 73 16-14"}),React.createElement("circle",{cx:82,cy:78,r:7,stroke:"#fff",strokeWidth:2.5}),React.createElement("path",{stroke:"#fff",strokeWidth:2,opacity:.6,d:"M76 73 60 59"}),React.createElement("circle",{cx:52,cy:52,r:36,stroke:"#fff",strokeWidth:1.5,opacity:.25,strokeDasharray:"6 4"}));var z="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA0IiBoZWlnaHQ9IjEwNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MiIgY3k9IjUyIiByPSIxMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiLz48Y2lyY2xlIGN4PSI1MiIgY3k9IjUyIiByPSI0IiBmaWxsPSIjZmZmIi8+PGNpcmNsZSBjeD0iNTIiIGN5PSIxOCIgcj0iNyIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIuNSIvPjxwYXRoIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBvcGFjaXR5PSIuNiIgZD0iTTUyIDI1djE3Ii8+PGNpcmNsZSBjeD0iMjIiIGN5PSI3OCIgcj0iNyIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIuNSIvPjxwYXRoIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBvcGFjaXR5PSIuNiIgZD0ibTI4IDczIDE2LTE0Ii8+PGNpcmNsZSBjeD0iODIiIGN5PSI3OCIgcj0iNyIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIuNSIvPjxwYXRoIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBvcGFjaXR5PSIuNiIgZD0iTTc2IDczIDYwIDU5Ii8+PGNpcmNsZSBjeD0iNTIiIGN5PSI1MiIgcj0iMzYiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIG9wYWNpdHk9Ii4yNSIgc3Ryb2tlLWRhc2hhcnJheT0iNiA0Ii8+PC9zdmc+",ie=h.p+"static/usecase-1-gray.6b67a4f7.png",ae=h.p+"static/usecase-1-color.cf410399.png",ne=h.p+"static/usecase-2-gray.d160d628.png",re=h.p+"static/usecase-2-color.9ea2ee26.png",oe=h.p+"static/usecase-3-gray.b17d957a.png",le=h.p+"static/usecase-3-color.45d9969f.png",ge=h(38339),s=h(52676),k=[{gray:ie,color:ae},{gray:ne,color:re},{gray:oe,color:le}],ce=[{num:"01",titleKey:"hpt.advantages.1.title",descKey:"hpt.advantages.1.desc"},{num:"02",titleKey:"hpt.advantages.2.title",descKey:"hpt.advantages.2.desc"},{num:"03",titleKey:"hpt.advantages.3.title",descKey:"hpt.advantages.3.desc"},{num:"04",titleKey:"hpt.advantages.4.title",descKey:"hpt.advantages.4.desc"}],de=[{titleKey:"hpt.features.1.title",descKey:"hpt.features.1.desc"},{titleKey:"hpt.features.2.title",descKey:"hpt.features.2.desc"},{titleKey:"hpt.features.3.title",descKey:"hpt.features.3.desc"},{titleKey:"hpt.features.4.title",descKey:"hpt.features.4.desc"}],b=[{titleKey:"hpt.useCases.1.title",descKey:"hpt.useCases.1.desc"},{titleKey:"hpt.useCases.2.title",descKey:"hpt.useCases.2.desc"},{titleKey:"hpt.useCases.3.title",descKey:"hpt.useCases.3.desc"}],he=[(0,s.jsxs)("svg",{viewBox:"0 0 48 48",fill:"none",children:[(0,s.jsx)("circle",{cx:"24",cy:"8",r:"5",stroke:"currentColor",strokeWidth:"2"}),(0,s.jsx)("circle",{cx:"10",cy:"38",r:"5",stroke:"currentColor",strokeWidth:"2"}),(0,s.jsx)("circle",{cx:"24",cy:"38",r:"5",stroke:"currentColor",strokeWidth:"2",fill:"currentColor",fillOpacity:"0.15"}),(0,s.jsx)("circle",{cx:"38",cy:"38",r:"5",stroke:"currentColor",strokeWidth:"2"}),(0,s.jsx)("line",{x1:"24",y1:"13",x2:"10",y2:"33",stroke:"currentColor",strokeWidth:"1.5"}),(0,s.jsx)("line",{x1:"24",y1:"13",x2:"24",y2:"33",stroke:"currentColor",strokeWidth:"1.5"}),(0,s.jsx)("line",{x1:"24",y1:"13",x2:"38",y2:"33",stroke:"currentColor",strokeWidth:"1.5"})]},"f1"),(0,s.jsxs)("svg",{viewBox:"0 0 48 48",fill:"none",children:[(0,s.jsx)("rect",{x:"6",y:"6",width:"36",height:"36",rx:"3",stroke:"currentColor",strokeWidth:"2"}),(0,s.jsx)("path",{d:"M18 16l-6 8 6 8",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"}),(0,s.jsx)("path",{d:"M30 16l6 8-6 8",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round"}),(0,s.jsx)("line",{x1:"26",y1:"14",x2:"22",y2:"34",stroke:"currentColor",strokeWidth:"1.5",opacity:"0.5"})]},"f2"),(0,s.jsxs)("svg",{viewBox:"0 0 48 48",fill:"none",children:[(0,s.jsx)("rect",{x:"4",y:"6",width:"28",height:"10",rx:"2",stroke:"currentColor",strokeWidth:"2",fill:"currentColor",fillOpacity:"0.15"}),(0,s.jsx)("rect",{x:"4",y:"20",width:"28",height:"10",rx:"2",stroke:"currentColor",strokeWidth:"2"}),(0,s.jsx)("rect",{x:"4",y:"34",width:"28",height:"10",rx:"2",stroke:"currentColor",strokeWidth:"2"}),(0,s.jsx)("path",{d:"M40 38V12",stroke:"currentColor",strokeWidth:"2"}),(0,s.jsx)("path",{d:"M36 16l4-4 4 4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,s.jsx)("path",{d:"M36 34l4 4 4-4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]},"f3"),(0,s.jsxs)("svg",{viewBox:"0 0 48 48",fill:"none",children:[(0,s.jsx)("path",{d:"M24 4L6 12v14c0 10.5 7.8 20.3 18 23 10.2-2.7 18-12.5 18-23V12L24 4z",stroke:"currentColor",strokeWidth:"2",fill:"currentColor",fillOpacity:"0.06"}),(0,s.jsx)("polyline",{points:"14,26 19,26 22,18 26,34 29,26 34,26",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",fill:"none"})]},"f4")],ve=function(){var l=(0,W.J)(),t=I()(l,1),i=t[0],n=(0,C.useState)(0),e=I()(n,2),o=e[0],r=e[1],c=(0,C.useState)(!1),d=I()(c,2),u=d[0],f=d[1],g=(0,C.useRef)(null),S=(0,C.useRef)(null),y=(0,C.useRef)(null);return(0,C.useEffect)(function(){var v=g.current;if(v){var p=null,P=setTimeout(function(){try{var E,M;p=new q(v,z,(E=S.current)!==null&&E!==void 0?E:void 0,(M=y.current)!==null&&M!==void 0?M:void 0),p.init(),p.start()}catch(j){console.warn("HeroParticles init failed:",j)}},100);return function(){var E;clearTimeout(P),(E=p)===null||E===void 0||E.dispose()}}},[]),(0,C.useEffect)(function(){var v=setInterval(function(){f(function(p){return!p})},4e3);return function(){return clearInterval(v)}},[]),(0,s.jsxs)("div",{className:"page-hpt",children:[(0,s.jsx)(B.Z,{}),(0,s.jsxs)("div",{className:"hpt-dark-zone",ref:y,children:[(0,s.jsxs)("section",{className:"section-dark hpt-hero",ref:g,children:[(0,s.jsx)("div",{className:"container",children:(0,s.jsxs)("div",{className:"section-inner hpt-hero-content hero-fade",children:[(0,s.jsx)("h1",{className:"hpt-hero-title",children:x.ZP.get("hpt.hero.title")}),(0,s.jsx)("p",{className:"hpt-hero-desc",children:x.ZP.get("hpt.hero.desc")}),(0,s.jsx)("a",{href:"#",className:"hpt-hero-cta",children:x.ZP.get("hpt.hero.cta")})]})}),(0,s.jsx)("div",{className:"hpt-sphere-logo-wrap hero-fade",style:{animationDelay:"0.6s"},children:(0,s.jsx)("img",{ref:S,src:z,alt:"HPT"})})]}),(0,s.jsx)("section",{className:"section-dark hpt-advantages",children:(0,s.jsx)("div",{className:"container",children:(0,s.jsxs)("div",{className:"section-inner",children:[(0,s.jsx)(R.Z,{children:(0,s.jsx)("h2",{className:"section-title-dark",children:x.ZP.get("hpt.advantages.title")})}),(0,s.jsx)("div",{className:"advantages-grid",children:ce.map(function(v,p){return(0,s.jsx)(R.Z,{delay:.1+p*.08,children:(0,s.jsxs)("div",{className:"advantage-card",children:[(0,s.jsxs)("span",{className:"advantage-num",children:[v.num,(0,s.jsx)("span",{children:"/"})]}),(0,s.jsx)("h3",{className:"advantage-title",children:x.ZP.get(v.titleKey)}),(0,s.jsx)("p",{className:"advantage-desc",children:x.ZP.get(v.descKey)})]})},v.num)})})]})})})]}),(0,s.jsx)("section",{className:"section-light hpt-features",children:(0,s.jsx)("div",{className:"container",children:(0,s.jsxs)("div",{className:"section-inner",children:[(0,s.jsx)(R.Z,{children:(0,s.jsx)("h2",{className:"section-title",children:x.ZP.get("hpt.features.title")})}),(0,s.jsx)("div",{className:"features-grid",children:de.map(function(v,p){return(0,s.jsx)(R.Z,{delay:.1+p*.08,children:(0,s.jsxs)("div",{className:"feature-card",children:[(0,s.jsx)("div",{className:"feature-icon",children:he[p]}),(0,s.jsx)("h3",{className:"feature-title",children:x.ZP.get(v.titleKey)}),(0,s.jsx)("p",{className:"feature-desc",children:x.ZP.get(v.descKey)})]})},p)})})]})})}),(0,s.jsx)("section",{className:"section-light hpt-usecases",children:(0,s.jsx)("div",{className:"container",children:(0,s.jsxs)("div",{className:"section-inner",children:[(0,s.jsx)(R.Z,{children:(0,s.jsx)("h2",{className:"section-title",children:x.ZP.get("hpt.useCases.title")})}),(0,s.jsx)(R.Z,{delay:.15,children:(0,s.jsxs)("div",{className:"section-row",children:[(0,s.jsx)("div",{className:"usecase-left",children:b.map(function(v,p){return(0,s.jsxs)("div",{className:"usecase-item ".concat(p===o?"active":"collapsed"),onMouseEnter:function(){return r(p)},children:[(0,s.jsx)("div",{className:"usecase-header",children:x.ZP.get(v.titleKey)}),(0,s.jsx)("div",{className:"usecase-body",children:x.ZP.get(v.descKey)})]},p)})}),(0,s.jsxs)("div",{className:"usecase-image-wrap".concat(u?" show-color":""),children:[(0,s.jsx)("img",{className:"usecase-img-gray",src:k[o].gray,alt:""}),(0,s.jsx)("img",{className:"usecase-img-color",src:k[o].color,alt:x.ZP.get(b[o].titleKey)})]})]})})]})})}),(0,s.jsx)(L.Z,{}),(0,s.jsx)(O.Z,{})]})},fe=ve}}]);
