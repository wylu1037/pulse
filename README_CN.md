# Pulse - Changelog 管理系统

基于 PocketBase + Next.js 的现代化 Changelog 发布系统，支持单文件部署。

## 特性

- ✨ **现代化 UI** - 基于 Next.js 15 + Tailwind CSS + shadcn/ui
- 🎯 **功能完整** - 搜索、筛选、分页、视图切换
- 🌙 **暗色模式** - 自动跟随系统或手动切换
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🚀 **单文件部署** - 一个可执行文件包含前后端
- 🔧 **零配置后台** - PocketBase 内置管理界面

## 快速开始

### 开发环境

**前置要求**:

- Node.js 18+
- pnpm

**1. 准备并启动后端（PocketBase）**

```bash
# 下载对应系统的二进制文件
chmod +x setup.sh && ./setup.sh

# 启动服务
./pocketbase serve
```

首次启动会自动运行数据库迁移，创建所有表和初始数据。  
访问 http://localhost:8090/\_/ 创建管理员账号。

**2. 安装前端依赖**

```bash
cd frontend
pnpm install
```

**3. 启动前端开发服务器**

```bash
pnpm run dev
```

访问 http://localhost:3000 查看效果。

### 生产部署

由于 `build.sh` 脚本已被移除，请使用手动构建：

**手动构建**

```bash
# 1. 构建前端
cd frontend
pnpm run build
cd ..

# 2. 部署到 PocketBase
rm -rf pb_public/*
cp -r frontend/out/* pb_public/

# 3. 启动服务
./pocketbase serve --http="0.0.0.0:8090"
```

现在访问 http://localhost:8090 即可看到完整应用！

- 前端: `http://localhost:8090`
- 后台: `http://localhost:8090/_/`

## 使用指南

### 发布 Changelog

1. 访问 http://localhost:8090/\_/ 登录后台
2. 进入 `changelogs` collection
3. 点击 "New record" 创建新条目
4. 填写字段：
   - **title**: Changelog 标题
   - **description**: 详细描述（支持 Markdown）
   - **version**: 版本号（如 v1.2.0）
   - **date**: 发布日期
   - **tags**: 选择标签（可多选）
5. 保存后立即在前端显示

### 管理标签

后台 `tags` collection 中可以管理标签：

- **name**: 标签名称（如"New Feature"）
- **slug**: URL 友好标识符（如"new-feature"）
- **color**: 十六进制颜色代码（如 #3B82F6）
- **icon**: Lucide 图标名称（如"Sparkles"）
- **order**: 显示顺序

## 技术栈

- **后端**: PocketBase v0.22.26（Go + SQLite）
- **前端**: Next.js 15 + React 19
- **样式**: Tailwind CSS 4 + shadcn/ui
- **语言**: TypeScript

## 项目结构

```
pulse/
├── pocketbase                # 可执行文件 (通过脚本下载)
├── setup.sh                  # PocketBase 环境准备脚本
├── pb_migrations/            # 数据库迁移
├── pb_public/                # 前端构建产物
├── pb_data/                  # SQLite 数据库
├── frontend/                 # 前端源码
│   ├── app/                 # Next.js 路由
│   ├── components/          # React 组件
│   ├── lib/                 # 工具和 API
│   └── public/              # 静态资源
└── docs/                    # 设计文档
```

## 常见问题

**Q: 如何备份数据？**  
A: 复制 `pb_data/` 目录即可。

**Q: 如何修改端口？**  
A: 启动时指定：`./pocketbase serve --http="0.0.0.0:YOUR_PORT"`

**Q: 前端如何连接自定义后端地址？**  
A: 在 `frontend/.env.local` 中设置 `NEXT_PUBLIC_PB_URL=https://your-api.com`

## License

MIT

## 致谢

- 前端模板基于 [magicuidesign/changelog-template](https://github.com/magicuidesign/changelog-template)
- 后端使用 [PocketBase](https://pocketbase.io/)
