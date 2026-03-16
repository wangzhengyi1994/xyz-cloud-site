# XYZ Cloud Site 重构计划：React + UmiJS 工程化

## 一、现状分析

| 指标 | 数值 |
|------|------|
| 文件 | 单文件 `index.html`（3161行） |
| CSS | ~1157 行内联 |
| JS | ~1860 行内联（6个 `<script>` 块） |
| HTML | ~840 行 |
| 外部 JS | three.min.js、TweenMax.min.js、topojson-client CDN |
| 静态资源 | 5 个 JSON 模型、1 张 JPG、2 个 SVG |

### 现有 Section 清单（9个模块）

| # | Section | 背景 | Three.js 特效 | Canvas 2D |
|---|---------|------|---------------|-----------|
| 1 | Navbar | dark | - | - |
| 2 | Hero | dark | ✅ 3D城市天际线（237行） | - |
| 3 | Announcement Bar | dark | - | - |
| 4 | Core Value Proposition | light | - | ✅ 线框立方体视差（344行） |
| 5 | End-to-End Platform | dark | ✅ 5000粒子变形（280行） | - |
| 6 | XYZ Cloud Story | light | - | ✅ 点阵SVG动画（242行） |
| 7 | Build Anything with AI | dark | - | - |
| 8 | Data Tunnel | dark | ✅ 数据隧道（136行） | - |
| 9 | Designed for Engineers | dark | - | - |
| 10 | Stats + 3D Globe | dark | ✅ 3D地球（325行） | - |
| 11 | Services CTA | image bg | - | - |
| 12 | Footer | dark | - | - |

---

## 二、目标技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React + UmiJS v4 |
| 语言 | TypeScript |
| UI 组件库 | Ant Design v5 |
| 样式 | LESS |
| 状态管理 | UmiJS Model Plugin |
| 国际化 | react-intl-universal (zh-CN / en-US) |
| 动画 | GSAP (替代 TweenMax) + Three.js r86 |
| 包管理器 | pnpm |

---

## 三、项目结构设计

```
xyz-cloud-site/
├── config/
│   ├── config.ts              # UmiJS 主配置
│   ├── route.ts               # 路由（单页面，只有 /）
│   └── theme.ts               # Ant Design 主题定制 + LESS 变量
├── src/
│   ├── pages/
│   │   └── index.tsx           # 首页入口，组合所有 Section
│   ├── components/
│   │   ├── Navbar/
│   │   │   ├── index.tsx
│   │   │   └── index.less
│   │   ├── HeroBanner/
│   │   │   ├── index.tsx       # 容器 + 文案
│   │   │   ├── index.less
│   │   │   └── CityScene.ts    # Three.js 城市天际线（纯 class）
│   │   ├── Announcement/
│   │   │   ├── index.tsx
│   │   │   └── index.less
│   │   ├── CoreValue/
│   │   │   ├── index.tsx       # 手风琴 + 容器
│   │   │   ├── index.less
│   │   │   └── CubeParallax.ts # Canvas 2D 立方体视差
│   │   ├── AIPlatform/
│   │   │   ├── index.tsx       # 5个Tab + 粒子容器
│   │   │   ├── index.less
│   │   │   └── ParticleMorph.ts # Three.js 粒子变形
│   │   ├── CloudStory/
│   │   │   ├── index.tsx
│   │   │   ├── index.less
│   │   │   └── DotMatrix.ts    # Canvas 2D 点阵动画
│   │   ├── BuildWithAI/
│   │   │   ├── index.tsx
│   │   │   └── index.less
│   │   ├── DataTunnel/
│   │   │   ├── index.tsx
│   │   │   ├── index.less
│   │   │   └── TunnelScene.ts  # Three.js 数据隧道
│   │   ├── Engineers/
│   │   │   ├── index.tsx       # AI Lab / Monitoring 切换交互
│   │   │   └── index.less
│   │   ├── StatsGlobe/
│   │   │   ├── index.tsx       # 统计数字 + 地球容器
│   │   │   ├── index.less
│   │   │   └── GlobeScene.ts   # Three.js 3D地球
│   │   ├── ServicesCTA/
│   │   │   ├── index.tsx
│   │   │   └── index.less
│   │   └── Footer/
│   │       ├── index.tsx
│   │       └── index.less
│   ├── hooks/
│   │   ├── useIntersectionObserver.ts  # 滚动可见性检测
│   │   ├── useThreeScene.ts            # Three.js 生命周期管理
│   │   └── useCountUp.ts              # 数字计数动画
│   ├── utils/
│   │   └── three-helpers.ts   # Three.js r86 兼容工具函数
│   ├── locales/
│   │   ├── en-US.json         # 英文文案（从 data-en 提取）
│   │   └── zh-CN.json         # 中文文案（从 data-cn 提取）
│   ├── assets/
│   │   ├── models/            # 5个粒子 JSON 模型
│   │   ├── images/            # services-bg.jpg, dot-matrix.svg
│   │   └── logo.svg
│   ├── style/
│   │   ├── variables.less     # 设计令牌（从 :root CSS 变量迁移）
│   │   ├── global.less        # 全局样式 reset
│   │   └── mixins.less        # 常用 mixin（scroll-fade-in 等）
│   ├── constants/
│   │   └── platform.ts        # 平台 Tab 配置数据
│   └── app.ts                 # 应用入口配置
├── public/
│   └── three.min.js           # Three.js r86（不走 npm，保留原版本）
├── package.json
├── tsconfig.json
├── .umirc.ts                  # 或 config/config.ts
└── pnpm-lock.yaml
```

---

## 四、关键设计决策

### 1. Three.js r86 处理方案
- **不升级**，不走 npm 安装
- `three.min.js` 放 `public/` 目录，在 HTML 模板中用 `<script>` 引入
- 在 `config.ts` 中配置 `externals: { three: 'THREE' }`
- 每个 Three.js 特效封装为独立 class（不是 React 组件），由 `useThreeScene` Hook 管理生命周期

### 2. 特效封装模式（useThreeScene Hook）
```typescript
// hooks/useThreeScene.ts
export function useThreeScene(
  containerRef: RefObject<HTMLDivElement>,
  SceneClass: new (container: HTMLElement) => IScene,
  deps?: any[]
) {
  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new SceneClass(containerRef.current);
    scene.init();
    // IntersectionObserver 控制渲染启停
    const observer = new IntersectionObserver(([entry]) => {
      entry.isIntersecting ? scene.start() : scene.stop();
    });
    observer.observe(containerRef.current);
    return () => { scene.dispose(); observer.disconnect(); };
  }, deps);
}
```

### 3. 国际化方案
- 从现有 `data-en` / `data-cn` 属性提取所有文案
- 生成 `en-US.json` 和 `zh-CN.json`
- 使用 `react-intl-universal`，组件中用 `intl.get('hero.title')` 替代
- 全局 Context 管理当前语言状态

### 4. LESS 设计令牌
```less
// style/variables.less
@primary: #4362ff;
@primary-hover: #6b89ff;
@dark: #090e1a;
@white-8: rgba(255,255,255,0.80);
@white-6: rgba(255,255,255,0.50);
@white-2: rgba(255,255,255,0.10);
// ... 完整迁移现有 CSS 变量
```

### 5. 滚动动画
- `scroll-fade-in` 效果封装为 `useIntersectionObserver` Hook
- 组件通过 `className` + `ref` 实现，不再依赖全局 CSS 动画

---

## 五、执行步骤

### Phase 1：脚手架搭建
1. 在新目录 `xyz-cloud-site-react/` 初始化 UmiJS 4 项目
2. 配置 `pnpm`、TypeScript、LESS
3. 配置 Ant Design v5 主题（品牌色、字体）
4. 配置 Three.js r86 external
5. 配置 react-intl-universal
6. 迁移设计令牌到 `variables.less`
7. 提取国际化文案到 JSON

### Phase 2：静态组件迁移（无特效）
8. Navbar 组件
9. Announcement 组件
10. CoreValue 组件（手风琴交互）
11. AIPlatform 组件（Tab hover 交互）
12. CloudStory 组件
13. BuildWithAI 组件
14. Engineers 组件（**加上 AI Lab / Monitoring 切换交互**）
15. StatsGlobe 组件（数字计数）
16. ServicesCTA 组件
17. Footer 组件
18. 首页 `pages/index.tsx` 组合所有组件

### Phase 3：Three.js 特效迁移
19. `useThreeScene` Hook + `IScene` 接口
20. HeroBanner/CityScene.ts（城市天际线）
21. AIPlatform/ParticleMorph.ts（粒子变形）
22. StatsGlobe/GlobeScene.ts（3D地球）
23. DataTunnel/TunnelScene.ts（数据隧道）

### Phase 4：Canvas 2D 特效迁移
24. CoreValue/CubeParallax.ts（立方体视差）
25. CloudStory/DotMatrix.ts（点阵动画）

### Phase 5：集成验证
26. 全部组件集成、滚动动画验证
27. 国际化切换测试
28. 响应式（< 1200px / < 800px）验证
29. 性能验证（IntersectionObserver 离屏暂停）
30. 部署测试

---

## 六、风险项

| 风险 | 影响 | 应对 |
|------|------|------|
| Three.js r86 与现代打包工具冲突 | 构建失败 | 用 externals 方案，不走模块化 |
| TweenMax 老版本 API | 动画不兼容 | 评估是否直接用 GSAP 3 替代 |
| topojson-client CDN | 同上 | 改为 pnpm 安装正式包 |
| 单页 3161 行拆分后遗漏 | 功能缺失 | 逐 section 对比验证 |
