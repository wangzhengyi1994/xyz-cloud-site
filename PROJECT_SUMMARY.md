# XYZ Cloud Site — 完整项目概要

## 1. 文件结构

| 文件 | 大小 | 说明 |
|---|---|---|
| `index.html` | ~139 KB, ~3887行 | 单文件站点，所有HTML/CSS/JS内联 |
| `dot-matrix.svg` | ~543 KB | 点阵SVG图形（1915×924px，数千个`<rect>`元素） |
| `three.min.js` | ~517 KB | Three.js r86（本地打包） |
| `TweenMax.min.js` | ~112 KB | GreenSock TweenMax（本地打包） |

**总体积约1.34 MB**，部署在 GitHub Pages (`wangzhengyi1994.github.io/xyz-cloud-site/`)。

---

## 2. 页面结构（从上到下）

1. **语言切换按钮** — 固定右上角，EN/CN 切换
2. **导航栏** — 固定顶部64px，含Logo + 6个导航链接 + SIGN UP / LOG IN
3. **Hero区** — 960px高，`#140AAC`背景，Three.js 3D城市场景 + 标语
4. **公告栏** — 102px白色背景
5. **Core Value Proposition** — 左侧3项手风琴 + 右侧Canvas 2D线框立方体动画
6. **AI开发平台** — 左侧5个Tab + 右侧Three.js粒子变形（球→方→锥→菱→环）
7. **XYZ Cloud Story** — 左侧文字 + 右侧dot-matrix.svg点阵动画
8. **Build Anything with AI** — 3张卡片（DeepSeek-R1, Llama 3, Dify）
9. **Data Tunnel** — 30vh高，Three.js信号隧道动画
10. **Designed for Engineers #1** — 网格装饰（含斜线纹理）+ 终端代码展示
11. **Designed for Engineers #2** — 3个统计数字动画 + Three.js 3D地球
12. **Services CTA** — 渐变背景，联系信息
13. **Footer** — CSS光谱动画背景 + Logo + 导航 + 联系方式
14. **Cosmic Spectrum（已隐藏）** — `display:none`，GSAP滚动动画光谱可视化

---

## 3. CSS设计令牌

### 颜色
```css
/* Blue Scale (10级) */
--color-blue-1: #f0f5ff
--color-blue-2: #e6edff
--color-blue-3: #bdceff
--color-blue-4: #94adff
--color-blue-5: #6b89ff
--color-blue-6: #4362ff    /* 主品牌色 */
--color-blue-7: #2e44d9
--color-blue-8: #1d2cb3
--color-blue-9: #0f188c
--color-blue-10: #0a0d66

/* Gray Scale (11级) */
--color-gray-1: #f8fafc
--color-gray-2: #f1f5f9
--color-gray-3: #e1e7ef
--color-gray-4: #c8d5e5
--color-gray-5: #9eacbf
--color-gray-6: #65758b
--color-gray-7: #48566a
--color-gray-8: #344256
--color-gray-9: #0f1728
--color-gray-10: #090e1a   /* 深色背景 */
--color-gray-11: #060a10

/* White Alpha Scale (10级) */
--color-white-1: rgba(255,255,255,0.08)
--color-white-2: rgba(255,255,255,0.10)
--color-white-3: rgba(255,255,255,0.20)
--color-white-4: rgba(255,255,255,0.30)
--color-white-5: rgba(255,255,255,0.40)
--color-white-6: rgba(255,255,255,0.50)
--color-white-7: rgba(255,255,255,0.60)
--color-white-8: rgba(255,255,255,0.80)
--color-white-9: rgba(255,255,255,0.90)
--color-white-10: #ffffff

/* 语义别名 */
--primary: #4362ff
--primary-hover: #6b89ff
--primary-active: #2e44d9
--dark: #090e1a
--color-orange-6: #ff8400
```

### 字体
```css
--font-family: 'JetBrains Mono', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-family-code: 'Courier Prime', 'JetBrains Mono', monospace
--font-weight-normal: 300
--font-weight-strong: 500

/* 字号 */
--font-size-sm: 12px
--font-size: 14px
--font-size-lg: 16px
--font-size-xl: 20px
--font-size-heading-6: 16px
--font-size-heading-5: 20px
--font-size-heading-4: 24px
--font-size-heading-3: 32px
--font-size-heading-2: 40px
--font-size-heading-1: 48px
--font-size-heading-0: 72px

/* 行高 */
--line-height-heading-0: 80px
--line-height-heading-1: 56px
--line-height-heading-2: 48px
```

### 间距
```css
/* Margin */
--margin-xxs: 4px   --margin-xs: 8px   --margin-sm: 12px
--margin: 16px      --margin-md: 20px  --margin-lg: 24px
--margin-xl: 32px   --margin-xxl: 40px --margin-xxxl: 80px

/* Padding */
--padding-xxs: 4px  --padding-xs: 8px  --padding-sm: 12px
--padding: 16px     --padding-md: 20px --padding-lg: 24px
--padding-xl: 32px  --padding-xl2: 40px
--padding-xl3: 80px --padding-xl4: 120px

/* Border Radius */
--border-radius-xs: 2px
--border-radius-sm: 4px
--border-radius:    6px
--border-radius-lg: 8px
--border-radius-xl: 24px
```

---

## 4. 9个JavaScript特效详解

### 特效1: Hero 3D城市 (Three.js + TweenMax)
- **引擎:** Three.js r86 + TweenMax
- **场景:** 100栋随机方块建筑（移动端50栋）+ 线框叠加层
- **粒子:** 300个蓝色三角形粒子（移动端150个），组成旋转烟雾群
- **光线:** 60条移动光线（蓝/白色，TweenMax yoyo动画）
- **灯光:** AmbientLight(4) + SpotLight(20, 投射阴影) + PointLight(0.5)
- **交互:** 鼠标移动驱动城市旋转
- **优化:** IntersectionObserver离屏暂停渲染，移动端禁用阴影

### 特效2: 粒子变形 (Three.js)
- **引擎:** Three.js r86
- **粒子:** 5000个白色点（移动端2500个），PointsMaterial size 0.02
- **5种预生成形状:** 球体(r=1.8) → 立方体(2.8) → 金字塔(h=3.2) → 菱形(h=3.5) → 环面(R=1.4,r=0.5)
- **变形:** 线性插值67帧，cubic ease-in-out缓动
- **联动:** `window.platformMorphTo(idx)` 由Tab点击触发

### 特效3: 线框立方体视差 (Canvas 2D)
- **引擎:** 纯Canvas 2D + 手写3D矩阵运算（rotX/rotY/rotZ + 透视投影 fov=800）
- **几何体:**
  - 立方体：8顶点12边
  - 钻石/八面体：6顶点12边
- **3种模式（联动手风琴Tab）:**
  - Mode 0: 5个嵌套立方体，缩放[40,65,95,130,170]，递减透明度
  - Mode 1: 5个等大立方体(55)沿Z轴堆叠，zOffset[-80,-40,0,40,80]
  - Mode 2: 5个嵌套钻石/八面体，缩放[50,80,115,155]
- **色差效果:** 每条边画4次（红偏移-1.5px / 绿居中 / 蓝偏移+1.5px / 白核心）
- **装饰:** 中心发光球(径向渐变) + 7个RGB分裂十字星 + 虚线RGB连线到鼠标
- **交互:** 鼠标视差旋转(lerp 0.04)，离开时自动旋转(tY += 0.003)

### 特效4: 点阵动画 (Canvas 2D)
- **数据源:** fetch加载dot-matrix.svg，DOMParser解析所有`<rect>`元素
- **着色:** 12%的点随机着蓝色(#4362ff)
- **涟漪:** mouseenter时涟漪以12px/帧扩展，mouseleave时收缩
- **放大镜:** 鼠标90px半径内的点额外放大20%，smoothstep过渡
- **优化:** 仅在动画进行中运行requestAnimationFrame

### 特效5: 3D地球 (Three.js + TopoJSON)
- **引擎:** Three.js r86 + topojson-client@3
- **数据:** CDN加载Natural Earth land-110m.json（55KB）
- **陆地检测:** 射线法点内多边形(pointInRing/pointInPolygon)
- **点阵:** 2度网格，经度按cos(lat)修正
  - 海洋点: #48566a, size 0.012, 50%透明度
  - 陆地点: 白色, size 0.022, 95%透明度
- **城市:** 16个（北京/上海/深圳/东京/首尔/新加坡/孟买/迪拜/伦敦/巴黎/法兰克福/纽约/旧金山/洛杉矶/圣保罗/悉尼），蓝色圆+发光环
- **飞行弧线:** 24条二次贝塞尔曲线，弧高=距离×0.35+半径
- **交互:** 鼠标/触摸拖拽旋转，无操作时自动旋转0.002rad/帧

### 特效6: 数据隧道 (Three.js)
- **引擎:** Three.js r86
- **参数:** 80条线，94个信号，spreadHeight=55, curveLength=80, straightLength=200
- **路径:** 余弦曲线(curvePower=0.8265) + 波浪(sin, speed=2.48, height=0.145)
- **信号:** AdditiveBlending，拖尾长度3，随机分配车道，循环时重新分配
- **优化:** IntersectionObserver离屏暂停

### 特效7: Footer光谱 (纯CSS)
- 9条渐变列，blur(40px)，opacity 0.8
- @keyframes spectrumFloat: translateY ±8%, scaleY 1.05↔0.95
- 各列不同duration(5.5s-7.2s)和delay，形成异步波浪

### 特效8: 统计数字动画
- IntersectionObserver(threshold 0.3)触发
- 2000ms cubic ease-out从0计数到目标值
- 仅触发一次

### 特效9: Cosmic Spectrum（已隐藏 display:none）
- GSAP 3.13.0 + ScrollTrigger + SplitText
- 全屏SVG光谱柱滚动动画，9种配色主题
- 音效(whoosh/glitch/click-reverb)，默认关闭
- 彩虹波浪标题动画

---

## 5. 外部依赖

| 依赖 | 来源 | 用途 |
|---|---|---|
| JetBrains Mono (300-700) | Google Fonts | 全站UI字体 |
| Courier Prime (400, 700) | Google Fonts | 代码字体 |
| topojson-client@3 | jsDelivr CDN | 地球TopoJSON解析 |
| world-atlas land-110m.json | jsDelivr CDN | 地球陆地数据 |
| GSAP 3.13.0 | jsDelivr CDN | 隐藏的Cosmic Spectrum |
| GSAP ScrollTrigger 3.13.0 | jsDelivr CDN | 隐藏的Cosmic Spectrum |
| GSAP SplitText 3.13.0 | jsDelivr CDN | 隐藏的Cosmic Spectrum |

**本地依赖:** three.min.js (r86), TweenMax.min.js, dot-matrix.svg

---

## 6. 响应式断点

### CSS断点: `@media (max-width: 1200px)`
- 导航栏缩紧间距
- Hero标题 72px → 48px
- 所有 `.section-row` 改为纵向堆叠 (flex-direction: column)
- 左侧面板宽度改为 100%
- Footer "ANC" 文字 200px → 100px

### JS端: `window.innerWidth <= 800`
- Hero: 建筑100→50，粒子300→150，光线60→30，禁用阴影
- 粒子变形: 5000→2500

---

## 7. 交互功能清单

| 功能 | 触发 | 效果 |
|---|---|---|
| 中英文切换 | 点击 `#langBtn` | 遍历所有 `data-en/data-cn` 属性切换文本 |
| 手风琴 | 点击 `.accordion-header` | 切换 active/collapsed + 联动立方体模式(0/1/2) |
| 平台Tab | 点击 `.platform-tab` | 切换 active + 粒子变形到对应形状 |
| Hero鼠标视差 | mousemove / touch | 城市旋转跟随鼠标 |
| 立方体鼠标视差 | mousemove / mouseleave | 立方体旋转 + RGB连线 + 十字光标 |
| 点阵悬停 | mouseenter/leave/move | 涟漪扩展/收缩 + 放大镜 |
| 地球拖拽 | mousedown+move+up / touch | 自由旋转地球 |
| 统计动画 | 滚动进入视口(0.3) | 数字从0计数到目标值(2000ms) |

---

## 8. CSS装饰细节

- **十字角标:** 每个 `.section-inner` 底部左右角有11×11px的"+"标记，通过 `::before`/`::after` 伪元素 + 双向 linear-gradient 实现。亮色section用 `var(--dark)`，深色section用 `rgba(255,255,255,0.5)`
- **斜线纹理:** Engineers网格中上排1,3,5格 + 下排2,4,6格有45度重复斜线（`repeating-linear-gradient(45deg)`），10%白色透明度，8px间距

---

## 9. 技术约束与注意事项

- **Three.js r86:** 使用旧版API — `geometry.addAttribute()` 而非 `setAttribute()`，`THREE.VertexColors` 常量而非 `true`，`THREE.Geometry` 而非 `BufferGeometry`
- **单文件架构:** 所有HTML/CSS/JS在index.html中内联，无模块化
- **无构建工具:** 无webpack/vite/npm，直接编辑文件部署
- **品牌名:** 导航栏"XYZ Cloud" / Footer"AlayaNeW Cloud" / 版权"DataCanvas" / CLI命令前缀"anc"
- **隐藏内容:** Cosmic Spectrum虽然 `display:none`，但GSAP CDN脚本仍会加载
