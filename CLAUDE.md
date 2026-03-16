# XYZ Cloud Site 项目指南

## 项目概述
单页营销网站，所有代码在 `index.html` 内联（~4000行HTML/CSS/JS），无构建工具，直接编辑部署。
- **线上地址:** https://wangzhengyi1994.github.io/xyz-cloud-site/
- **公司GitLab:** `gitlab.datacanvas.com`，分支 `features/oversea-gzq`
- **完整技术文档:** 见 `PROJECT_SUMMARY.md`

## 技术栈
- **Three.js r86**（本地 `three.min.js`）— 旧版API，见下方约束
- **TweenMax**（本地 `TweenMax.min.js`）
- **topojson-client@3** + **world-atlas countries-50m.json**（CDN）
- **字体:** JetBrains Mono + Courier Prime（Google Fonts）
- **无构建工具**，无 npm / webpack / vite

## ⚠️ Three.js r86 关键约束
- 必须用 `geometry.addAttribute()` 而非 `setAttribute()`
- `THREE.VertexColors` 是常量（不是 `true`）
- `THREE.Geometry` 可用（现代版已移除）
- `BufferGeometry` 构造函数签名与现代版不同
- **不要升级 Three.js 版本**，会导致全站特效崩溃

## 设计令牌（CSS变量）
```css
/* 品牌蓝色梯度 */
--color-blue-1: #f0f5ff  →  --color-blue-10: #0a0d66
--primary: --color-blue-6: #4362ff

/* 灰色梯度 */
--color-gray-1: #f8fafc  →  --color-gray-11: #060a10
--dark: --color-gray-10: #090e1a

/* 白色透明度梯度（深色背景上常用） */
--white-1: rgba(255,255,255,0.08)  →  --white-10: #ffffff
/* 注意: --white-5(0.40) 在深色背景上几乎看不到，标题至少用 --white-8(0.80) */

/* 字体 */
--font-family: 'JetBrains Mono', monospace

/* 响应式断点 */
CSS: @media (max-width: 1200px)
JS:  window.innerWidth < 800
```

## 网站结构（7个Section + 9个视觉特效）

### Section 1: Hero
- 3D城市天际线（Three.js + TweenMax），深色背景
- 品牌标题 + CTA按钮

### Section 2: Core Value Proposition（白色背景 `section-light`）
- 手风琴展开/收起
- 线框立方体视差动画（Canvas 2D）— 联动手风琴，3种模式（normal/expand/wireStorm）
- **注意：曾尝试改为深色背景但效果不好，已确认保持白色**

### Section 3: End-to-End AI Development Platform
- **5个平台Tab**（手风琴折叠式）：
  - Tab 0: Model Hub → `models/cloud-computing.json`
  - Tab 1: Development - Cloud Container Instances → `models/cloud-hosting.json`
  - Tab 2: Training - Extreme Core Training → `models/server.json`
  - Tab 3: Inference - Inference Service → `models/virtual-machine.json`
  - Tab 4: GPU Cluster - VKS Elastic Container Cluster → `models/access-control.json`
- **交互方式：hover触发**（mouseenter），不是click
- 默认显示图标+标题，hover/active时展开描述文字
- **3D粒子变形**（Three.js 5000粒子），Tab切换触发cascade morph动画
- Per-particle随机延迟 + 多种easing函数（expoOut/cubicInOut/elasticOut/backOut）
- 支持鼠标/触屏拖拽旋转

### Section 4: The XYZ Cloud Story
- 点阵SVG动画（Canvas 2D）— 涟漪+放大镜效果

### Section 5: Stats 统计数字
- 数字计数动画（IntersectionObserver触发）

### Section 6: Global Infrastructure
- **3D地球**（Three.js + TopoJSON countries-50m.json）
- 点阵网格 step=2（~16k点），含手动补充小岛（台湾、海南、斯里兰卡等）
- 16个城市 + 24条飞行弧线 + 脉冲扩散环
- 支持鼠标拖拽旋转
- **踩坑记录：**
  - step=1 太卡（65k点）
  - step=1.5 台湾消失（太窄）
  - 最终方案：step=2 + countries-50m.json高精度数据 + 手动补充岛屿点

### Section 7: Data Tunnel
- 数据隧道（Three.js）— 信号线动画

### Section 8: Footer
- CSS光谱动画

### Section 9: Cosmic Spectrum（已隐藏 `display:none`）

## 3D粒子模型文件
位于 `models/` 目录，由OBJ文件预处理生成：
```
models/
├── access-control.json    (~108KB, 5000顶点)
├── cloud-computing.json   (~109KB, 5000顶点)
├── cloud-hosting.json     (~108KB, 5000顶点)
├── server.json            (~108KB, 5000顶点)
└── virtual-machine.json   (~109KB, 5000顶点)
```
- 原始OBJ文件在 `/Users/dang/Desktop/10cf7031/OBJ/`（10-20MB，7-15万顶点）
- 预处理流程：提取`v x y z`顶点 → 居中 → 归一化到半径1.8 → 降采样到5000点 → 保存为JSON `{"vertices":[x,y,z,...]}`
- JSON格式：flat Float array，每3个数一个顶点，4位小数精度
- 如需替换模型：用同样流程预处理新OBJ → 替换对应JSON文件

## 关键JS API
```javascript
// 粒子变形：切换到第idx个形状
window.platformMorphTo(idx)

// 动态加载外部模型
window.platformLoadModel(url, tabIndex)
```

## 国际化
- 所有文本元素带 `data-en` 和 `data-cn` 属性
- 右上角语言切换按钮
- Hero标题用 `innerHTML`（含`<br>`换行）

## 性能优化
- 所有Three.js canvas使用 IntersectionObserver，离屏时暂停渲染
- 粒子动画用 `Float32Array` + `performance.now()` 手动插值（非逐粒子TweenMax）
- 地球 step=2 控制在 ~16k 点
- 模型文件预处理为轻量JSON（~108KB vs 原始20MB）

## 已知踩坑 & 设计决策
1. **Core Value背景**：深色效果不好，确认保持白色 `section-light`
2. **地球台湾显示**：需要 countries-50m.json（高精度）+ 手动补充岛屿点
3. **Tab交互**：hover触发，非click。标题颜色至少 `--white-8` 才可见
4. **Three.js版本**：r86不可升级，API完全不同于现代版
5. **OBJ模型**：必须预处理降采样，原始文件太大不能直接用

## 沟通偏好
- **中文沟通**
- 修改后直接 `git push origin main` 部署到 GitHub Pages
- 重要改动同步推送到公司 GitLab
