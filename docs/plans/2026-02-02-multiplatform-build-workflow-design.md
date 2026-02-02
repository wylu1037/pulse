# 多平台构建 GitHub Workflow 设计

**日期：** 2026-02-02
**目标：** 自动为 Linux、macOS、Windows 构建多架构可执行文件

## 需求

- **触发条件：** 每次推送到 main 分支时自动触发
- **目标平台：**
  - Linux: amd64, arm64
  - macOS: amd64, arm64
  - Windows: amd64
- **发布方式：** 自动发布到 GitHub Releases 的 "latest" release（每次覆盖旧版本）
- **版本管理：** 不使用版本号，统一为 "latest" release

## 总体架构

Workflow 包含 3 个 jobs，按顺序执行：

1. **build-frontend** - 构建前端资源（一次）
2. **build-backend** - 使用矩阵并行构建 5 个平台的后端二进制文件
3. **release** - 下载所有二进制文件并发布到 GitHub Releases

### 工作流程

```
build-frontend (一次性)
    ↓ 上传 pb_public artifact
build-backend (5 个并行任务)
    ↓ 每个平台上传独立 artifact
release (合并所有 artifacts)
    ↓ 删除旧 "latest" release
    ↓ 创建新 "latest" release
    ↓ 上传所有二进制文件
```

## 详细设计

### Job 1: build-frontend

**Runner:** `ubuntu-latest`

**步骤：**
1. 检出代码
2. 执行 `make frontend`（构建前端和 Next.js 输出）
3. 上传 `pb_public` 为 artifact（名称：`pb_public`）

**目的：** 一次性构建前端资源，减少后续 5 个后端构建的重复工作。

### Job 2: build-backend

**Runner:** 矩阵配置（根据平台选择）
- Linux 平台：`ubuntu-latest`
- macOS 平台：`macos-latest`（支持 Apple Silicon）
- Windows 平台：`windows-latest`

**矩阵变量：**
```yaml
matrix:
  include:
    - os: ubuntu-latest
      goos: linux
      goarch: amd64
      binary_name: pulse-linux-amd64
    - os: ubuntu-latest
      goos: linux
      goarch: arm64
      binary_name: pulse-linux-arm64
    - os: macos-latest
      goos: darwin
      goarch: amd64
      binary_name: pulse-darwin-amd64
    - os: macos-latest
      goos: darwin
      goarch: arm64
      binary_name: pulse-darwin-arm64
    - os: windows-latest
      goos: windows
      goarch: amd64
      binary_name: pulse-windows-amd64.exe
```

**步骤：**
1. 检出代码
2. 下载 `pb_public` artifact（从 build-frontend job）到项目根目录
3. 设置 Go 环境（版本 1.23 或最新稳定版）
4. 执行交叉编译：
   ```bash
   GOOS=${{ matrix.goos }} GOARCH=${{ matrix.goarch }} go build -o ${{ matrix.binary_name }} .
   ```
5. 上传二进制文件为 artifact（名称：`binary-${{ matrix.binary_name }}`）

**注意：**
- 使用环境变量 `GOOS` 和 `GOARCH` 实现交叉编译
- Windows 的二进制名称需要 `.exe` 后缀
- 每个平台的 runner 选择支持该架构的最佳编译

### Job 3: release

**Runner:** `ubuntu-latest`
**依赖：** `build-frontend` 和 `build-backend`

**步骤：**
1. 检出代码
2. 下载所有 5 个二进制文件 artifacts
3. 删除旧的 "latest" release（如果存在）：
   ```bash
   gh release delete latest --yes || true
   ```
4. 创建新的 "latest" release（无版本号，无生成说明）
5. 上传所有 5 个二进制文件到 release

**使用工具：** GitHub CLI (`gh`) - 内置在 GitHub Actions 中

## 二进制文件命名约定

最终 release 中的文件名：
- `pulse-linux-amd64`
- `pulse-linux-arm64`
- `pulse-darwin-amd64`
- `pulse-darwin-arm64`
- `pulse-windows-amd64.exe`

用户可以直接从 GitHub Releases 下载这些平台特定的可执行文件。

## 环保考虑

- 前端只构建一次，减少重复工作
- 后端使用并行构建，5 个平台同时编译
- 旧 release 自动删除，避免存储空间浪费
- 无需手动管理版本号

## 实现步骤

1. 创建 `.github/workflows/build.yml` 文件
2. 配置三个 jobs 和矩阵
3. 提交到 git
4. 测试：推送到 main 分支触发 workflow
