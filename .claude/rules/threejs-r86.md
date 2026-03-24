---
globs: index.html
---

# Three.js r86 约束（不可违反）

## API 差异（r86 vs 现代版）
- `geometry.addAttribute()` — 不是 `setAttribute()`
- `THREE.VertexColors` — 是常量，不是 `true`
- `THREE.Geometry` — 可用（现代版已移除）
- `BufferGeometry` 构造函数签名与现代版不同
- **绝对不要升级 Three.js 版本**，会导致全站 9 个特效崩溃

## 性能约束
- 所有 Three.js canvas 用 IntersectionObserver 离屏暂停
- 粒子动画用 Float32Array + performance.now() 手动插值
- 地球 step=2（~16k 点），step=1 太卡（65k 点）
- 3D 模型必须预处理降采样到 5000 点

## 单文件架构
所有代码内联在 index.html（~4000行），无构建工具。修改时注意不要破坏其他区块的 JS 作用域。
