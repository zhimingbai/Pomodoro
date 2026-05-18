# Pomodoro Timer

番茄钟桌面应用 — Electron + Vue 3 + TypeScript + Pinia。420×620 固定窗口，深色主题，中文界面。

## 功能

**计时器**

- 经典番茄钟循环：专注 → 短休 → 专注 → … → 长休（每 N 轮），循环往复
- 绝对时间戳计时，无漂移
- 暂停 / 继续 / 重置当前阶段 / 重置整个循环 / 跳过当前阶段
- 桌面通知：计时完成时弹出系统通知

**任务管理**

- 添加、勾选完成、双击删除任务
- 专注关联：将任务设为「当前专注」，计时首页和任务页同步显示
- 专注完成后自动清除关联，任务完成时也自动清除

**统计**

- 今日专注次数与分钟数、连续天数、本周活跃天与时长、总专注时长
- 本周柱状图（红色高亮今日）
- 今日记录列表（阶段标签、关联任务、时长、时间）
- 任务统计：待完成 / 已完成 / 专注过
- 无数据时展示预览假数据

**设置**

- 专注时长 / 短休时长 / 长休时长 / 长休间隔，均有描述和范围限制
- 循环预览条：专注 → 短休 × N → 长休
- 恢复默认设置（含确认弹窗）
- 清除所有数据（含危险确认弹窗）

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（HMR）
npx electron-vite dev

# 类型检查
npx vue-tsc --noEmit -p tsconfig.web.json --composite false
npx tsc --noEmit -p tsconfig.node.json --composite false
```

## 构建与打包

```bash
# 构建
npx electron-vite build

# 打包（按平台）
npx electron-builder --win     # Windows → dist/*.exe
npx electron-builder --mac     # macOS → dist/*.dmg
npx electron-builder --linux   # Linux → dist/AppImage 等
```

## 发布

```bash
git tag v1.0.0
git push gitee v1.0.0
```

然后在 Gitee 网页「发行版」页面基于 tag 创建 Release，上传 `dist/` 下的安装包。

## 项目结构

```
src/
├── main/            # Electron 主进程（窗口、IPC、文件读写）
│   ├── index.ts     # 入口，IPC 注册，app.setName
│   └── persistence.ts  # JSON 文件读写
├── preload/         # contextBridge 暴露 window.api
│   └── index.ts
└── renderer/
    └── src/
        ├── App.vue              # 根组件，标签页导航
        ├── components/          # UI 组件
        │   ├── TimerDisplay.vue     # 大时间显示 + 进度条
        │   ├── TimerControls.vue    # 开始/暂停/继续/重置/重置循环/跳过
        │   ├── SessionIndicator.vue # 循环圆点指示器
        │   ├── ActiveTaskBanner.vue # 当前专注任务横幅
        │   ├── TaskForm.vue         # 任务输入框
        │   ├── TaskItem.vue         # 单条任务（勾选/专注/删除）
        │   ├── TaskList.vue         # 任务列表
        │   ├── StatsOverview.vue    # 统计页（卡片+柱状图+记录列表）
        │   ├── SettingsPanel.vue    # 设置页（分组+循环预览+数据管理）
        │   └── ConfirmDialog.vue    # 确认弹窗
        ├── stores/              # Pinia 状态管理
        │   ├── timer.ts         # 计时引擎（绝对时间戳 + setInterval）
        │   ├── tasks.ts         # 任务 CRUD
        │   ├── settings.ts      # 设置读写
        │   └── history.ts       # 历史记录与统计
        ├── types/               # TypeScript 类型
        └── utils/               # 工具函数
```

## 数据存储

三层防护：

1. `localStorage` — 同步写，最可靠
2. 文件系统 `%APPDATA%/pomodoro/` — `settings.json` / `tasks.json` / `history.json`
3. 读取优先级：文件系统 → localStorage 回退

## 技术栈

- Electron 39
- Vue 3 + TypeScript
- Pinia
- electron-vite（构建）
- electron-builder（打包）
