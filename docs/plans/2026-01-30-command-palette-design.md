# Command Palette 设计方案

**日期**: 2026-01-30  
**设计目标**: 使用 shadcn/ui Command 组件替代现有的搜索/筛选 UI，提升产品的现代感和交互体验

---

## 当前状态

现有的过滤栏包括三个组件：
1. **SearchBar** - 搜索 changelog
2. **TagFilter** - 按标签筛选
3. **ViewSwitcher** - 切换视图模式（时间线/紧凑）

用户已将这部分 UI 注释掉，准备用更高级的方案替换。

---

## 设计方案

### 方案选择

采用**方案 A：全局命令面板（Cmd+K）**，理由：
- 最符合"产品更高级"的诉求
- Command 面板是当前最流行的现代 UI 模式（Vercel、Linear、GitHub 都在用）
- 用户体验一流 - 键盘导航 + 模糊搜索 = 极致效率
- 界面更简洁 - 移除常驻的搜索/筛选栏，页面更聚焦内容

---

## 整体架构

### 触发器设计

在页面右上角（`ThemeToggle` 旁边）添加触发按钮：
- 显示 `⌘K` 或 `Ctrl+K` 图标
- 点击或按快捷键都能打开命令面板
- 使用 shadcn/ui 的 `Command` + `Dialog` 组合实现模态面板

### 命令面板布局

面板采用 3 层结构：

#### 1. 搜索输入框（顶部）
- 实时搜索 changelog 标题和内容
- 显示搜索图标和占位符 "Type to search or filter..."

#### 2. 命令分组（中间主体）
- **Group 1: Search Results** - 动态显示匹配的 changelog 条目
- **Group 2: Filter by Tag** - 所有可用标签列表（带颜色图标）
- **Group 3: View Mode** - 时间线视图 / 紧凑视图选项

#### 3. 快捷键提示（底部）
- 显示 `↑↓` 导航、`Enter` 选择、`Esc` 关闭

---

## 交互逻辑

### 搜索功能
- 用户输入时，实时过滤 changelogs
- 如果有匹配结果，显示在 "Search Results" 分组下
- 每个结果显示：标题、版本号、日期
- 按 `Enter` 或点击某条结果 → 滚动到该 changelog 并高亮

### 标签筛选
- 显示所有标签，每个标签带颜色和图标（复用现有 TagFilter 的样式）
- 点击某个标签 → 关闭命令面板 → 页面筛选出该标签的 changelogs
- 当前激活的标签会显示 ✓ 标记
- 支持"清除筛选"选项（如果有激活标签）

### 视图切换
- 两个选项：Timeline View / Compact View
- 当前激活的视图显示 ✓ 标记
- 点击 → 关闭面板 → 切换视图模式

---

## 状态管理

命令面板组件需要接收以下 props（从 `page.tsx` 传入）：

```tsx
interface CommandPaletteProps {
  changelogs: Changelog[]     // 用于搜索结果
  tags: Tag[]                 // 所有标签
  activeTag: string | null    // 当前激活的标签
  viewMode: "timeline" | "compact"
  onSearch: (query: string) => void       // 触发搜索
  onTagSelect: (tagId: string) => void    // 选择标签
  onViewChange: (mode: "timeline" | "compact") => void  // 切换视图
}
```

---

## 实现细节

### 组件文件结构

```
frontend/components/
├── command-palette.tsx       # 主命令面板组件
└── ui/
    ├── command.tsx            # shadcn/ui Command 组件（需安装）
    └── dialog.tsx             # shadcn/ui Dialog 组件（需安装）
```

### 安装依赖

需要添加 shadcn/ui 组件：
```bash
pnpm dlx shadcn@latest add command dialog
```

### 核心实现要点

**1. 快捷键监听**
- 使用 `useEffect` 监听 `Cmd+K` / `Ctrl+K`
- 阻止浏览器默认行为（避免触发浏览器搜索）

**2. 搜索实现**
- 本地模糊搜索：使用简单的 `filter` + `toLowerCase().includes()`
- 搜索范围：changelog 的 `title` 和 `description`

**3. 样式细节**
- 面板宽度：`max-w-2xl`（640px）
- 标签显示：复用现有 TagFilter 中的颜色和图标样式
- 当前激活项：显示右侧 `✓` 图标（使用 `lucide-react` 的 `Check` 图标）

**4. 页面集成**
- 在 `app/page.tsx` 中：
  - 移除注释的 `SearchBar`、`TagFilter`、`ViewSwitcher`
  - 在右上角 `ThemeToggle` 旁边添加命令面板触发按钮
  - 命令面板组件放在页面根级别（与内容并列）

---

## 功能清单

这个命令面板将提供：
- ✅ **Cmd+K 快捷键** - 快速打开面板
- ✅ **实时搜索** - 模糊匹配 changelog
- ✅ **标签筛选** - 可视化标签列表
- ✅ **视图切换** - 时间线/紧凑模式
- ✅ **键盘导航** - 完全支持上下选择、回车确认

---

## 用户体验优势

1. **更现代** - 采用业界主流的 Command Palette 模式
2. **更高效** - 键盘优先操作，无需鼠标点击
3. **更简洁** - 移除常驻筛选栏，页面更聚焦内容
4. **可发现性** - 所有功能集中在一个面板，降低学习成本
