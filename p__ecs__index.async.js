"use strict";(self.webpackChunkxyz_cloud_site=self.webpackChunkxyz_cloud_site||[]).push([[534],{7216:function(pe,A,h){h.r(A),h.d(A,{default:function(){return fe}});var G=h(48305),I=h.n(G),P=h(75271),x=h(25633),W=h(19056),B=h(37260),O=h(44141),F=h(73299),M=h(49809),L=h(25298),U=h.n(L),K=h(17069),Y=h.n(K),V=h(82092),a=h.n(V),T=`
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
`,Q=`
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
`),X=`
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
`,J=`
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
`),$=`
uniform sampler2D map;
uniform float opacity;
varying float vAlpha;

void main() {
  vec4 texColor = texture2D(map, gl_PointCoord);
  float alpha = texColor.a * opacity * vAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
}
`,q=function(){function m(l,s,i,r){var e=this;U()(this,m),a()(this,"container",void 0),a()(this,"logoSvgUrl",void 0),a()(this,"logoImgEl",null),a()(this,"running",!1),a()(this,"rafId",0),a()(this,"sfScene",void 0),a()(this,"sfCamera",void 0),a()(this,"sfRenderer",void 0),a()(this,"sfGeo",void 0),a()(this,"sfPos",void 0),a()(this,"sfVel",void 0),a()(this,"sfPhases",void 0),a()(this,"sfAccentGeo",void 0),a()(this,"sfAccentPos",void 0),a()(this,"sfAccentPhases",void 0),a()(this,"sfAccentMat",void 0),a()(this,"sfPoints",void 0),a()(this,"sfStars",void 0),a()(this,"spScene",void 0),a()(this,"spCamera",void 0),a()(this,"spRenderer",void 0),a()(this,"spMesh",void 0),a()(this,"spMaterial",void 0),a()(this,"spHitSphere",void 0),a()(this,"spRaycaster",void 0),a()(this,"spMouseNDC",void 0),a()(this,"spSmoothMouse",void 0),a()(this,"spCanvas",void 0),a()(this,"logoMesh",null),a()(this,"logoMaterial",null),a()(this,"logoGeo",null),a()(this,"mouseX",0),a()(this,"mouseY",0),a()(this,"scrollProgress",0),a()(this,"onMouseMove",null),a()(this,"onScroll",null),a()(this,"onResize",null),a()(this,"width",0),a()(this,"height",0),a()(this,"COUNT",420),a()(this,"SPREAD_X",45),a()(this,"SPREAD_Y",30),a()(this,"SPREAD_Z",25),a()(this,"ACCENT_COUNT",28),a()(this,"darkZone",null),a()(this,"animate",function(){if(e.running){e.rafId=requestAnimationFrame(e.animate);for(var o=performance.now()*.001,n=e.sfPos,c=e.sfVel,d=e.sfPhases,p=0;p<e.COUNT;p++){var f=p*3;n[f]+=c[f]+Math.sin(o*.3+d[p])*.0012,n[f+1]+=c[f+1]+Math.cos(o*.2+d[p]*1.3)*.001,n[f+2]+=c[f+2];var g=e.SPREAD_X/2,S=e.SPREAD_Y/2,y=e.SPREAD_Z/2;n[f]>g&&(n[f]=-g),n[f]<-g&&(n[f]=g),n[f+1]>S&&(n[f+1]=-S),n[f+1]<-S&&(n[f+1]=S),n[f+2]>y&&(n[f+2]=-y),n[f+2]<-y&&(n[f+2]=y)}e.sfGeo.attributes.position.needsUpdate=!0;for(var v=e.sfAccentPos,u=e.sfAccentPhases,C=0;C<e.ACCENT_COUNT;C++){var E=C*3;v[E]+=Math.sin(o*.15+u[C])*.002,v[E+1]+=Math.cos(o*.12+u[C]*.7)*.0015}e.sfAccentGeo.attributes.position.needsUpdate=!0,e.sfAccentMat.opacity=.4+Math.sin(o*.4)*.1,e.sfPoints.rotation.y+=(e.mouseX*.06-e.sfPoints.rotation.y)*.015,e.sfPoints.rotation.x+=(-e.mouseY*.04-e.sfPoints.rotation.x)*.015,e.sfStars.rotation.y=e.sfPoints.rotation.y*.5,e.sfStars.rotation.x=e.sfPoints.rotation.x*.5,e.sfRenderer.render(e.sfScene,e.sfCamera),e.spMesh.rotation.y=e.mouseX*.15,e.spMesh.rotation.x=e.mouseY*-.1,e.spHitSphere.rotation.copy(e.spMesh.rotation),e.spRaycaster.setFromCamera(e.spMouseNDC,e.spCamera);var R=e.spRaycaster.intersectObject(e.spHitSphere);if(R.length>0){var j=e.spMesh.worldToLocal(R[0].point.clone());e.spSmoothMouse.lerp(j,.12)}else e.spSmoothMouse.lerp(new THREE.Vector3(999,999,999),.05);var w=e.spMaterial.uniforms;w.time.value=o,w.mousePos.value.copy(e.spSmoothMouse),w.explode.value+=(e.scrollProgress-w.explode.value)*.06;var k=w.explode.value;if(e.logoMaterial){var Z=e.logoMaterial.uniforms;Z.time.value=o,Z.explode.value=k}if(e.logoImgEl){var ue=Math.max(0,1-k*12);e.logoImgEl.style.opacity=String(ue)}e.spRenderer.render(e.spScene,e.spCamera)}}),this.container=l,this.logoSvgUrl=s||"",this.logoImgEl=i||null,this.darkZone=r||null}return Y()(m,[{key:"init",value:function(){this.width=this.container.clientWidth,this.height=this.container.clientHeight,this.initStarfield(),this.initSphere(),this.bindEvents(),this.logoSvgUrl&&this.initLogoParticles()}},{key:"sfContainer",get:function(){return this.darkZone||this.container}},{key:"initStarfield",value:function(){var s=this.sfContainer,i=s.clientWidth,r=s.clientHeight;this.sfScene=new THREE.Scene,this.sfCamera=new THREE.PerspectiveCamera(60,i/r,.1,1e3),this.sfCamera.position.z=20,this.sfRenderer=new THREE.WebGLRenderer({antialias:!1,alpha:!0}),this.sfRenderer.setSize(i,r),this.sfRenderer.setPixelRatio(Math.min(devicePixelRatio,2)),this.sfRenderer.setClearColor(0,0),this.sfRenderer.domElement.style.cssText="position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;",s.appendChild(this.sfRenderer.domElement);var e=this.createCircleTexture(),o=[[.85,.82,.75],[.55,.62,.9],[.26,.38,1],[.4,.5,.75],[.7,.75,.95],[.92,.92,.95],[.5,.6,.9],[.65,.72,1]];this.sfGeo=new THREE.BufferGeometry,this.sfPos=new Float32Array(this.COUNT*3);var n=new Float32Array(this.COUNT*3);this.sfVel=new Float32Array(this.COUNT*3),this.sfPhases=new Float32Array(this.COUNT);for(var c=0;c<this.COUNT;c++){var d=c*3;this.sfPos[d]=(Math.random()-.5)*this.SPREAD_X,this.sfPos[d+1]=(Math.random()-.5)*this.SPREAD_Y,this.sfPos[d+2]=(Math.random()-.5)*this.SPREAD_Z-5,this.sfVel[d]=(Math.random()-.5)*.004,this.sfVel[d+1]=(Math.random()-.5)*.003,this.sfVel[d+2]=(Math.random()-.5)*.001,this.sfPhases[c]=Math.random()*Math.PI*2;var p=o[Math.floor(Math.random()*o.length)];n[d]=p[0],n[d+1]=p[1],n[d+2]=p[2]}this.sfGeo.addAttribute("position",new THREE.BufferAttribute(this.sfPos,3)),this.sfGeo.addAttribute("color",new THREE.BufferAttribute(n,3));var f=new THREE.PointsMaterial({size:.1,map:e,vertexColors:THREE.VertexColors,transparent:!0,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:!1,sizeAttenuation:!0});this.sfPoints=new THREE.Points(this.sfGeo,f),this.sfScene.add(this.sfPoints),this.sfAccentGeo=new THREE.BufferGeometry,this.sfAccentPos=new Float32Array(this.ACCENT_COUNT*3);var g=new Float32Array(this.ACCENT_COUNT*3);this.sfAccentPhases=new Float32Array(this.ACCENT_COUNT);for(var S=[[.7,.8,1],[.5,.65,1],[.85,.88,1],[.6,.72,1],[.26,.38,1]],y=0;y<this.ACCENT_COUNT;y++){var v=y*3;this.sfAccentPos[v]=(Math.random()-.5)*this.SPREAD_X,this.sfAccentPos[v+1]=(Math.random()-.5)*this.SPREAD_Y,this.sfAccentPos[v+2]=(Math.random()-.5)*15-2,this.sfAccentPhases[y]=Math.random()*Math.PI*2;var u=S[Math.floor(Math.random()*S.length)];g[v]=u[0],g[v+1]=u[1],g[v+2]=u[2]}this.sfAccentGeo.addAttribute("position",new THREE.BufferAttribute(this.sfAccentPos,3)),this.sfAccentGeo.addAttribute("color",new THREE.BufferAttribute(g,3)),this.sfAccentMat=new THREE.PointsMaterial({size:.22,map:e,vertexColors:THREE.VertexColors,transparent:!0,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:!1,sizeAttenuation:!0}),this.sfStars=new THREE.Points(this.sfAccentGeo,this.sfAccentMat),this.sfScene.add(this.sfStars)}},{key:"isMobile",value:function(){return this.width<=1200}},{key:"getMobilePadding",value:function(){return 36}},{key:"getSphereWidth",value:function(){if(this.isMobile())return this.width-this.getMobilePadding()*2;var s=Math.floor(this.width*.5),i=730;return Math.min(s,i)}},{key:"getSphereHeight",value:function(){if(this.isMobile()){var s=this.getSphereWidth();return s}return this.height}},{key:"applySpherePosition",value:function(){if(this.spCanvas){var s=this.getSphereWidth(),i=this.getMobilePadding();this.isMobile()?(this.spCanvas.style.cssText="position:absolute;top:0;left:".concat(i,"px;z-index:1;pointer-events:none;"),this.spCanvas.style.width=s+"px"):(this.spCanvas.style.cssText="position:absolute;top:0;left:50%;height:100%;z-index:1;pointer-events:none;",this.spCanvas.style.width=s+"px")}}},{key:"initSphere",value:function(){var s=this.getSphereWidth(),i=this.getSphereHeight();this.spScene=new THREE.Scene,this.spCamera=new THREE.PerspectiveCamera(75,s/i,.1,1e3),this.spCamera.position.z=5.5,this.spRenderer=new THREE.WebGLRenderer({alpha:!0,antialias:!0}),this.spRenderer.setPixelRatio(Math.min(devicePixelRatio,2)),this.spRenderer.setSize(s,i),this.spCanvas=this.spRenderer.domElement,this.applySpherePosition(),this.container.appendChild(this.spCanvas);for(var r=this.createDotTexture(),e=new THREE.IcosahedronBufferGeometry(1,5),o=e.attributes.position.count,n=new Float32Array(o*3),c=0;c<o*3;c++)n[c]=(Math.random()-.5)*2;e.addAttribute("randomSeed",new THREE.BufferAttribute(n,3)),this.spMaterial=new THREE.ShaderMaterial({uniforms:{time:{value:0},radius:{value:2.5},particleSizeMin:{value:.002},particleSizeMax:{value:.018},mousePos:{value:new THREE.Vector3(999,999,999)},explode:{value:0},color:{value:new THREE.Color(12439295)},opacity:{value:.55},map:{value:r}},vertexShader:Q,fragmentShader:X,transparent:!0,blending:THREE.AdditiveBlending,depthTest:!1,depthWrite:!1}),this.spMesh=new THREE.Points(e,this.spMaterial),this.spScene.add(this.spMesh),this.spRaycaster=new THREE.Raycaster,this.spMouseNDC=new THREE.Vector2(999,999),this.spHitSphere=new THREE.Mesh(new THREE.SphereGeometry(2.5,16,16),new THREE.MeshBasicMaterial({visible:!1})),this.spScene.add(this.spHitSphere),this.spSmoothMouse=new THREE.Vector3(999,999,999)}},{key:"initLogoParticles",value:function(){var s=this,i=new Image;i.crossOrigin="anonymous",i.onload=function(){try{var r=s.sampleSvgPixels(i);if(r.length===0)return;s.createLogoMesh(r)}catch(e){console.warn("Logo particle init failed:",e)}},i.onerror=function(){return console.warn("Failed to load logo SVG for particles")},i.src=this.logoSvgUrl}},{key:"sampleSvgPixels",value:function(s){var i=128,r=document.createElement("canvas");r.width=i,r.height=i;var e=r.getContext("2d");e.drawImage(s,0,0,i,i);for(var o=e.getImageData(0,0,i,i).data,n=[],c=2,d=0;d<i;d+=c)for(var p=0;p<i;p+=c){var f=(d*i+p)*4,g=o[f+3];g>128&&n.push({x:p/i-.5,y:-(d/i-.5)})}return n}},{key:"createLogoMesh",value:function(s){var i=s.length;if(i!==0){for(var r=1.2,e=new Float32Array(i*3),o=new Float32Array(i*3),n=0;n<i;n++){var c=n*3;e[c]=s[n].x*r,e[c+1]=s[n].y*r,e[c+2]=0,o[c]=(Math.random()-.5)*2,o[c+1]=(Math.random()-.5)*2,o[c+2]=(Math.random()-.5)*2}this.logoGeo=new THREE.BufferGeometry,this.logoGeo.addAttribute("position",new THREE.BufferAttribute(e.slice(),3)),this.logoGeo.addAttribute("targetPos",new THREE.BufferAttribute(e,3)),this.logoGeo.addAttribute("randomSeed",new THREE.BufferAttribute(o,3));var d=this.createDotTexture();this.logoMaterial=new THREE.ShaderMaterial({uniforms:{time:{value:0},explode:{value:0},particleSize:{value:.012},opacity:{value:.9},map:{value:d}},vertexShader:J,fragmentShader:$,transparent:!0,blending:THREE.AdditiveBlending,depthTest:!1,depthWrite:!1}),this.logoMesh=new THREE.Points(this.logoGeo,this.logoMaterial),this.spScene.add(this.logoMesh)}}},{key:"createCircleTexture",value:function(){var s=64,i=s/2,r=document.createElement("canvas");r.width=r.height=s;var e=r.getContext("2d"),o=e.createRadialGradient(i,i,0,i,i,i);return o.addColorStop(0,"rgba(255,255,255,1)"),o.addColorStop(.3,"rgba(255,255,255,0.8)"),o.addColorStop(.7,"rgba(255,255,255,0.15)"),o.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=o,e.fillRect(0,0,s,s),new THREE.CanvasTexture(r)}},{key:"createDotTexture",value:function(){var s=32,i=document.createElement("canvas");i.width=i.height=s;var r=i.getContext("2d");return r.beginPath(),r.arc(s/2,s/2,s/2,0,Math.PI*2),r.fillStyle="#FFFFFF",r.fill(),new THREE.CanvasTexture(i)}},{key:"bindEvents",value:function(){var s=this;this.onMouseMove=function(i){s.mouseX=(i.clientX/window.innerWidth-.5)*2,s.mouseY=(i.clientY/window.innerHeight-.5)*2;var r=s.spCanvas.getBoundingClientRect();s.spMouseNDC.x=(i.clientX-r.left)/r.width*2-1,s.spMouseNDC.y=-((i.clientY-r.top)/r.height)*2+1},this.onScroll=function(){var i=s.container.getBoundingClientRect(),r=Math.max(0,Math.min(1,-i.top/(i.height*.6)));s.scrollProgress=r},this.onResize=function(){s.width=s.container.clientWidth,s.height=s.container.clientHeight;var i=s.sfContainer,r=i.clientWidth,e=i.clientHeight;s.sfCamera.aspect=r/e,s.sfCamera.updateProjectionMatrix(),s.sfRenderer.setSize(r,e);var o=s.getSphereWidth(),n=s.getSphereHeight();s.spCamera.aspect=o/n,s.spCamera.updateProjectionMatrix(),s.spRenderer.setSize(o,n),s.applySpherePosition()},window.addEventListener("mousemove",this.onMouseMove,{passive:!0}),window.addEventListener("scroll",this.onScroll,{passive:!0}),window.addEventListener("resize",this.onResize)}},{key:"start",value:function(){this.running||(this.running=!0,this.animate())}},{key:"stop",value:function(){this.running=!1,cancelAnimationFrame(this.rafId)}},{key:"dispose",value:function(){var s,i,r,e,o,n,c,d,p;this.stop(),this.onMouseMove&&window.removeEventListener("mousemove",this.onMouseMove),this.onScroll&&window.removeEventListener("scroll",this.onScroll),this.onResize&&window.removeEventListener("resize",this.onResize),(s=this.sfRenderer)!==null&&s!==void 0&&(s=s.domElement)!==null&&s!==void 0&&s.parentNode&&this.sfRenderer.domElement.parentNode.removeChild(this.sfRenderer.domElement),(i=this.spCanvas)!==null&&i!==void 0&&i.parentNode&&this.spCanvas.parentNode.removeChild(this.spCanvas),(r=this.sfRenderer)===null||r===void 0||r.dispose(),(e=this.spRenderer)===null||e===void 0||e.dispose(),(o=this.sfGeo)===null||o===void 0||o.dispose(),(n=this.sfAccentGeo)===null||n===void 0||n.dispose(),(c=this.spMaterial)===null||c===void 0||c.dispose(),(d=this.logoGeo)===null||d===void 0||d.dispose(),(p=this.logoMaterial)===null||p===void 0||p.dispose()}}]),m}(),_=Object.defineProperty,N=Object.getOwnPropertySymbols,ee=Object.prototype.hasOwnProperty,te=Object.prototype.propertyIsEnumerable,H=(m,l,s)=>l in m?_(m,l,{enumerable:!0,configurable:!0,writable:!0,value:s}):m[l]=s,se=(m,l)=>{for(var s in l||(l={}))ee.call(l,s)&&H(m,s,l[s]);if(N)for(var s of N(l))te.call(l,s)&&H(m,s,l[s]);return m};const me=m=>React.createElement("svg",se({width:104,height:104,fill:"none",xmlns:"http://www.w3.org/2000/svg"},m),React.createElement("rect",{x:16,y:14,width:72,height:24,rx:2,stroke:"#fff",strokeWidth:3}),React.createElement("circle",{cx:32,cy:26,r:4,fill:"#fff"}),React.createElement("rect",{x:44,y:23,width:32,height:6,rx:1,fill:"#fff",opacity:.4}),React.createElement("rect",{x:16,y:42,width:72,height:24,rx:2,stroke:"#fff",strokeWidth:3}),React.createElement("circle",{cx:32,cy:54,r:4,fill:"#fff"}),React.createElement("rect",{x:44,y:51,width:24,height:6,rx:1,fill:"#fff",opacity:.4}),React.createElement("rect",{x:16,y:70,width:72,height:24,rx:2,stroke:"#fff",strokeWidth:3}),React.createElement("circle",{cx:32,cy:82,r:4,fill:"#fff"}),React.createElement("rect",{x:44,y:79,width:28,height:6,rx:1,fill:"#fff",opacity:.4}),React.createElement("path",{stroke:"#fff",strokeWidth:2,opacity:.6,d:"M52 38v4M52 66v4"}));var z="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA0IiBoZWlnaHQ9IjEwNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIxNiIgeT0iMTQiIHdpZHRoPSI3MiIgaGVpZ2h0PSIyNCIgcng9IjIiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIzIi8+PGNpcmNsZSBjeD0iMzIiIGN5PSIyNiIgcj0iNCIgZmlsbD0iI2ZmZiIvPjxyZWN0IHg9IjQ0IiB5PSIyMyIgd2lkdGg9IjMyIiBoZWlnaHQ9IjYiIHJ4PSIxIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIuNCIvPjxyZWN0IHg9IjE2IiB5PSI0MiIgd2lkdGg9IjcyIiBoZWlnaHQ9IjI0IiByeD0iMiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjU0IiByPSI0IiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iNDQiIHk9IjUxIiB3aWR0aD0iMjQiIGhlaWdodD0iNiIgcng9IjEiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii40Ii8+PHJlY3QgeD0iMTYiIHk9IjcwIiB3aWR0aD0iNzIiIGhlaWdodD0iMjQiIHJ4PSIyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMyIvPjxjaXJjbGUgY3g9IjMyIiBjeT0iODIiIHI9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSI0NCIgeT0iNzkiIHdpZHRoPSIyOCIgaGVpZ2h0PSI2IiByeD0iMSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjQiLz48cGF0aCBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iLjYiIGQ9Ik01MiAzOHY0TTUyIDY2djQiLz48L3N2Zz4=",ie=h.p+"static/usecase-1-gray.c9fccaaa.png",ae=h.p+"static/usecase-1-color.6e45c8d6.png",re=h.p+"static/usecase-2-gray.06eb2ec7.png",ne=h.p+"static/usecase-2-color.1ed58ad2.png",oe=h.p+"static/usecase-3-gray.3af58df0.png",le=h.p+"static/usecase-3-color.f0d53898.png",ge=h(38339),t=h(52676),b=[{gray:ie,color:ae},{gray:re,color:ne},{gray:oe,color:le}],ce=[{num:"01",titleKey:"ecs.advantages.1.title",descKey:"ecs.advantages.1.desc"},{num:"02",titleKey:"ecs.advantages.2.title",descKey:"ecs.advantages.2.desc"},{num:"03",titleKey:"ecs.advantages.3.title",descKey:"ecs.advantages.3.desc"},{num:"04",titleKey:"ecs.advantages.4.title",descKey:"ecs.advantages.4.desc"}],de=[{titleKey:"ecs.features.1.title",descKey:"ecs.features.1.desc"},{titleKey:"ecs.features.2.title",descKey:"ecs.features.2.desc"},{titleKey:"ecs.features.3.title",descKey:"ecs.features.3.desc"},{titleKey:"ecs.features.4.title",descKey:"ecs.features.4.desc"}],D=[{titleKey:"ecs.useCases.1.title",descKey:"ecs.useCases.1.desc"},{titleKey:"ecs.useCases.2.title",descKey:"ecs.useCases.2.desc"},{titleKey:"ecs.useCases.3.title",descKey:"ecs.useCases.3.desc"}],he=[(0,t.jsxs)("svg",{viewBox:"0 0 48 48",fill:"none",children:[(0,t.jsx)("circle",{cx:"8",cy:"24",r:"5",stroke:"currentColor",strokeWidth:"2"}),(0,t.jsx)("circle",{cx:"24",cy:"24",r:"5",stroke:"currentColor",strokeWidth:"2",fill:"currentColor",fillOpacity:"0.15"}),(0,t.jsx)("circle",{cx:"40",cy:"24",r:"5",stroke:"currentColor",strokeWidth:"2"}),(0,t.jsx)("line",{x1:"13",y1:"24",x2:"19",y2:"24",stroke:"currentColor",strokeWidth:"2"}),(0,t.jsx)("line",{x1:"29",y1:"24",x2:"35",y2:"24",stroke:"currentColor",strokeWidth:"2"}),(0,t.jsx)("path",{d:"M6 12h36",stroke:"currentColor",strokeWidth:"1.5",opacity:"0.3"}),(0,t.jsx)("path",{d:"M6 36h36",stroke:"currentColor",strokeWidth:"1.5",opacity:"0.3"})]},"f1"),(0,t.jsxs)("svg",{viewBox:"0 0 48 48",fill:"none",children:[(0,t.jsx)("rect",{x:"8",y:"12",width:"32",height:"28",rx:"2",stroke:"currentColor",strokeWidth:"2"}),(0,t.jsx)("path",{d:"M8 20h32",stroke:"currentColor",strokeWidth:"2"}),(0,t.jsx)("rect",{x:"16",y:"26",width:"16",height:"10",rx:"1",stroke:"currentColor",strokeWidth:"1.5",fill:"currentColor",fillOpacity:"0.1"}),(0,t.jsx)("line",{x1:"20",y1:"26",x2:"20",y2:"36",stroke:"currentColor",strokeWidth:"1",opacity:"0.4"}),(0,t.jsx)("line",{x1:"24",y1:"26",x2:"24",y2:"36",stroke:"currentColor",strokeWidth:"1",opacity:"0.4"}),(0,t.jsx)("line",{x1:"28",y1:"26",x2:"28",y2:"36",stroke:"currentColor",strokeWidth:"1",opacity:"0.4"}),(0,t.jsx)("rect",{x:"14",y:"15",width:"6",height:"2",rx:"0.5",fill:"currentColor",opacity:"0.5"})]},"f2"),(0,t.jsxs)("svg",{viewBox:"0 0 48 48",fill:"none",children:[(0,t.jsx)("path",{d:"M10 10l4 10h20l4-10H10z",stroke:"currentColor",strokeWidth:"2",fill:"currentColor",fillOpacity:"0.08"}),(0,t.jsx)("rect",{x:"14",y:"20",width:"20",height:"14",rx:"2",stroke:"currentColor",strokeWidth:"2"}),(0,t.jsx)("circle",{cx:"30",cy:"27",r:"2.5",fill:"currentColor"}),(0,t.jsx)("rect",{x:"18",y:"25",width:"7",height:"4",rx:"1",fill:"currentColor",opacity:"0.25"}),(0,t.jsx)("line",{x1:"20",y1:"34",x2:"20",y2:"40",stroke:"currentColor",strokeWidth:"2"}),(0,t.jsx)("line",{x1:"28",y1:"34",x2:"28",y2:"40",stroke:"currentColor",strokeWidth:"2"}),(0,t.jsx)("line",{x1:"17",y1:"40",x2:"31",y2:"40",stroke:"currentColor",strokeWidth:"2"})]},"f3"),(0,t.jsxs)("svg",{viewBox:"0 0 48 48",fill:"none",children:[(0,t.jsx)("rect",{x:"4",y:"6",width:"40",height:"30",rx:"2",stroke:"currentColor",strokeWidth:"2"}),(0,t.jsx)("rect",{x:"10",y:"22",width:"6",height:"8",fill:"currentColor",opacity:"0.6"}),(0,t.jsx)("rect",{x:"18",y:"16",width:"6",height:"14",fill:"currentColor",opacity:"0.4"}),(0,t.jsx)("rect",{x:"26",y:"19",width:"6",height:"11",fill:"currentColor",opacity:"0.5"}),(0,t.jsx)("rect",{x:"34",y:"12",width:"4",height:"18",fill:"currentColor",opacity:"0.7"}),(0,t.jsx)("line",{x1:"16",y1:"42",x2:"32",y2:"42",stroke:"currentColor",strokeWidth:"2"}),(0,t.jsx)("line",{x1:"24",y1:"36",x2:"24",y2:"42",stroke:"currentColor",strokeWidth:"2"})]},"f4")],ve=function(){var l=(0,W.J)(),s=I()(l,1),i=s[0],r=(0,P.useState)(0),e=I()(r,2),o=e[0],n=e[1],c=(0,P.useState)(!1),d=I()(c,2),p=d[0],f=d[1],g=(0,P.useRef)(null),S=(0,P.useRef)(null),y=(0,P.useRef)(null);return(0,P.useEffect)(function(){var v=g.current;if(v){var u=null,C=setTimeout(function(){try{var E,R;u=new q(v,z,(E=S.current)!==null&&E!==void 0?E:void 0,(R=y.current)!==null&&R!==void 0?R:void 0),u.init(),u.start()}catch(j){console.warn("HeroParticles init failed:",j)}},200);return function(){var E;clearTimeout(C),(E=u)===null||E===void 0||E.dispose()}}},[]),(0,P.useEffect)(function(){var v=setInterval(function(){f(function(u){return!u})},4e3);return function(){return clearInterval(v)}},[]),(0,t.jsxs)("div",{className:"page-ecs",children:[(0,t.jsx)(B.Z,{}),(0,t.jsxs)("div",{className:"ecs-dark-zone",ref:y,children:[(0,t.jsxs)("section",{className:"section-dark ecs-hero",ref:g,children:[(0,t.jsx)("div",{className:"container",children:(0,t.jsxs)("div",{className:"section-inner ecs-hero-content",children:[(0,t.jsx)("h1",{className:"ecs-hero-title hero-fade",style:{animationDelay:"0.1s"},children:x.ZP.get("ecs.hero.title")}),(0,t.jsx)("p",{className:"ecs-hero-desc hero-fade",style:{animationDelay:"0.25s"},children:x.ZP.get("ecs.hero.desc")}),(0,t.jsx)("a",{className:"ecs-hero-cta hero-fade",style:{animationDelay:"0.4s"},href:"#",children:x.ZP.get("ecs.hero.cta")})]})}),(0,t.jsx)("div",{className:"ecs-sphere-logo-wrap hero-fade",style:{animationDelay:"0.6s"},children:(0,t.jsx)("img",{ref:S,src:z,alt:"ECS"})})]}),(0,t.jsx)("section",{className:"section-dark ecs-advantages",children:(0,t.jsx)("div",{className:"container",children:(0,t.jsxs)("div",{className:"section-inner",children:[(0,t.jsx)(M.Z,{children:(0,t.jsx)("h2",{className:"section-title-dark",children:x.ZP.get("ecs.advantages.title")})}),(0,t.jsx)("div",{className:"advantages-grid",children:ce.map(function(v,u){return(0,t.jsx)(M.Z,{delay:.1+u*.08,children:(0,t.jsxs)("div",{className:"advantage-card",children:[(0,t.jsxs)("span",{className:"advantage-num",children:[v.num,(0,t.jsx)("span",{children:"/"})]}),(0,t.jsx)("h3",{className:"advantage-title",children:x.ZP.get(v.titleKey)}),(0,t.jsx)("p",{className:"advantage-desc",children:x.ZP.get(v.descKey)})]})},v.num)})})]})})})]}),(0,t.jsx)("section",{className:"section-light ecs-features",children:(0,t.jsx)("div",{className:"container",children:(0,t.jsxs)("div",{className:"section-inner",children:[(0,t.jsx)(M.Z,{children:(0,t.jsx)("h2",{className:"section-title",children:x.ZP.get("ecs.features.title")})}),(0,t.jsx)("div",{className:"features-grid",children:de.map(function(v,u){return(0,t.jsx)(M.Z,{delay:.1+u*.08,children:(0,t.jsxs)("div",{className:"feature-card",children:[(0,t.jsx)("div",{className:"feature-icon",children:he[u]}),(0,t.jsx)("h3",{className:"feature-title",children:x.ZP.get(v.titleKey)}),(0,t.jsx)("p",{className:"feature-desc",children:x.ZP.get(v.descKey)})]})},u)})})]})})}),(0,t.jsx)("section",{className:"section-light ecs-usecases",children:(0,t.jsx)("div",{className:"container",children:(0,t.jsxs)("div",{className:"section-inner",children:[(0,t.jsx)(M.Z,{children:(0,t.jsx)("h2",{className:"section-title",children:x.ZP.get("ecs.useCases.title")})}),(0,t.jsx)(M.Z,{delay:.15,children:(0,t.jsxs)("div",{className:"section-row",children:[(0,t.jsx)("div",{className:"usecase-left",children:D.map(function(v,u){return(0,t.jsxs)("div",{className:"usecase-item ".concat(u===o?"active":"collapsed"),onMouseEnter:function(){return n(u)},children:[(0,t.jsx)("div",{className:"usecase-header",children:x.ZP.get(v.titleKey)}),(0,t.jsx)("div",{className:"usecase-body",children:x.ZP.get(v.descKey)})]},u)})}),(0,t.jsxs)("div",{className:"usecase-image-wrap".concat(p?" show-color":""),children:[(0,t.jsx)("img",{className:"usecase-img-gray",src:b[o].gray,alt:""}),(0,t.jsx)("img",{className:"usecase-img-color",src:b[o].color,alt:x.ZP.get(D[o].titleKey)})]})]})})]})})}),(0,t.jsx)(O.Z,{}),(0,t.jsx)(F.Z,{})]})},fe=ve}}]);
