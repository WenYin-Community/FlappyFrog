# Flappy Frog

基于 Phaser 2.x 的浏览器游戏，使用 Vite 构建。

## 快速开始

```bash
npm run dev      # 开发模式
npm run build    # 生产构建
npm run preview  # 预览构建
npm run test:e2e # E2E 测试
```

## 项目结构

```
FlappyFrog/
├── src/                 # 源代码（ES Modules）
├── public/             # 静态资源
│   ├── images/         # 图片
│   ├── sounds/         # 音频
│   └── icons/          # 图标
├── tests/              # E2E 测试
├── index.html          # 入口 HTML
├── vite.config.js      # Vite 配置
└── package.json
```

## 特性

- 现代 ES Modules 架构
- 键盘支持（空格键/上箭头跳跃）
- 响应式设计
- localStorage 持久化最高分
- 安全 URL 参数解析
- E2E 测试（Playwright）

## 配置

通过 URL 参数调整游戏设置：

```
?gravity=40&speed=390&gap=300&debug=true
```

支持的参数：
- `gravity` - 重力
- `flap` - 跳跃力度
- `speed` - 游戏速度
- `gap` - 管道间隙
- `ceiling` - 是否允许天花板碰撞
- `debug` - 调试模式
- `scoreSounds` - 音效数量
- `hurtSounds` - 受伤音效数量

## 许可证

MIT License
