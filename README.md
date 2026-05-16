# Pomodoro Timer

番茄钟桌面应用，基于 Electron + Vue 3 + TypeScript 构建。

## 功能

- 经典番茄钟循环：25 分钟专注 → 5 分钟短休 → 每 4 轮一次 15 分钟长休
- 系统通知：计时结束时弹出桌面通知
- 任务管理：添加、完成、删除任务，可关联到当前番茄钟
- 统计：今日 / 本周 / 总计番茄数，连续天数
- 自定义时长：各阶段时长均可配置

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（带热更新）
npx electron-vite dev

# 类型检查
npx vue-tsc --noEmit -p tsconfig.web.json --composite false
npx tsc --noEmit -p tsconfig.node.json --composite false
```

## 构建

```bash
# Windows
npx electron-vite build && npx electron-builder --win

# macOS
npx electron-vite build && npx electron-builder --mac

# Linux
npx electron-vite build && npx electron-builder --linux
```

构建产物在 `dist/` 目录下。

## 技术栈

- Electron 39
- Vue 3 + TypeScript
- Pinia 状态管理
- electron-vite 构建工具
- electron-builder 打包

## 项目结构

```
src/
├── main/            # Electron 主进程（窗口、IPC、文件读写）
├── preload/         # contextBridge 安全暴露 API
└── renderer/        # Vue 3 前端
    └── src/
        ├── components/   # 8 个 Vue 组件
        ├── stores/       # 4 个 Pinia store（settings/timer/tasks/history）
        ├── types/        # TypeScript 类型定义
        └── utils/        # 工具函数
```

数据持久化在 `%APPDATA%/pomodoro/`，包含 `settings.json`、`tasks.json`、`history.json`。
