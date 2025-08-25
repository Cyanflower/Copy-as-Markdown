# Copy as Markdown

一个 VSCode 扩展，用于将选中的代码智能复制为 Markdown 格式，并自动添加文件信息和智能格式化。

[English Documentation](README.md)

## 功能特性

- 🚀 **右键菜单集成**：直接通过右键菜单使用"复制为md"功能
- 📁 **自动文件信息**：自动包含当前文件名和可选的文件路径
- 🎯 **智能省略号**：根据选择上下文智能添加省略号
- 🌈 **语言自动识别**：自动检测文件类型并设置正确的代码块语言标识符
- 📋 **一键复制**：处理后的 Markdown 内容直接复制到剪贴板
- ⌨️ **快捷键支持**：通过可自定义的热键快速访问
- 🌍 **国际化支持**：自动适应您的 VSCode 语言设置
- ⚙️ **高度可配置**：丰富的自定义选项
- 📂 **资源管理器集成**：在资源管理器中右键文件/文件夹复制整个内容
- 🗂️ **多文件支持**：一次选择并复制多个文件或文件夹
- 🔄 **递归文件夹处理**：自动处理文件夹中的所有文本文件

## 使用方法

### 复制选中代码
1. 在 VSCode 中打开任意代码文件
2. 选择您想要复制的代码片段
3. 右键点击选中的内容
4. 从上下文菜单中选择"复制为md"
5. 格式化的 Markdown 内容现已复制到剪贴板

### 复制整个文件/文件夹
1. 在资源管理器面板中，右键点击一个或多个文件/文件夹
2. 从上下文菜单中选择"复制为md"
3. 所有选中的文件将作为 Markdown 代码块复制
4. 文件夹将递归处理，包含所有文本文件

**其他使用方式：**
- 使用快捷键：`Ctrl+Alt+C`（Windows/Linux）或 `Cmd+Shift+C`（macOS）
- 打开命令面板（`Ctrl+Shift+P`）并搜索"复制为md"

## 输出格式

### 单文件选择
````
filename.py
```python
def hello_world():
    print("Hello, World!")
    return "success"
```
````

### 多文件选择
````
utils.py
```python
def helper_function():
    return "helper"
```

main.js
```javascript
console.log("Hello World");
```
````

### 选择部分内容时（智能省略号）

#### 选择文件开头部分
````
filename.py:
```python
def hello_world():
    print("Hello, World!")
...
```
````

#### 选择文件中间部分
````
filename.py:
```python
...
def hello_world():
    print("Hello, World!")
...
```
````

#### 选择文件结尾部分
````
filename.py:
```python
...
def hello_world():
    print("Hello, World!")
```
````

#### 详细省略号模式（可选）
````
src/utils.py:
```python
省略上方 15 行...
def hello_world():
    print("Hello, World!")
省略下方 8 行...
```
````

## 支持的文件类型

扩展自动检测并处理文本文件，包括：

- **编程语言**：JavaScript、TypeScript、Python、Java、C/C++/C#、Go、Rust、PHP、Ruby、Swift、Kotlin 等
- **Web 技术**：HTML、CSS、SCSS、Vue、React（JSX/TSX）
- **数据格式**：JSON、XML、YAML、TOML
- **配置文件**：.env、.ini、.conf、.properties
- **脚本文件**：Shell、PowerShell、批处理文件
- **文档**：Markdown、纯文本
- **特殊文件**：Dockerfile、Makefile、.gitignore

在文件夹处理过程中自动跳过二进制文件。

## 配置选项

### 基础设置
- `copyAsMarkdown.includeFileName`：是否包含文件名（默认：`true`）
- `copyAsMarkdown.includeFilePath`：是否包含文件路径 - 需要启用文件名选项（默认：`false`）
- `copyAsMarkdown.filePathBase`：文件路径显示方式（默认：`"workspace"`）
  - `"workspace"`：相对于 VSCode 工作区
  - `"absolute"`：系统绝对路径

### 省略号设置
- `copyAsMarkdown.addEllipsis`：部分选择时是否添加省略号（默认：`true`）
- `copyAsMarkdown.addEllipsisDetail`：是否显示详细的行数信息 - 需要启用省略号选项（默认：`false`）

### 语言映射
- `copyAsMarkdown.languageMap`：代码块的自定义语言映射（默认：`{}`）

**配置示例：**
```json
{
  "copyAsMarkdown.includeFileName": true,
  "copyAsMarkdown.includeFilePath": true,
  "copyAsMarkdown.filePathBase": "workspace",
  "copyAsMarkdown.addEllipsis": true,
  "copyAsMarkdown.addEllipsisDetail": true,
  "copyAsMarkdown.languageMap": {
    "vue": "html",
    "jsx": "javascript",
    "tsx": "typescript"
  }
}
```

## 智能特性

### 智能省略号
- **上方有内容**：在代码块上方添加 `...`
- **下方有内容**：在代码块下方添加 `...`
- **上下都有内容**：在代码块上下都添加省略号
- **全选或无其他内容**：不添加省略号
- **详细模式**：显示实际行数（例如："省略上方 5 行..."）

### 自动文件检测
- 自动检测当前文件的完整文件名（包含扩展名）
- 支持未保存的文件（显示为 "untitled"）
- 可选的文件路径显示，支持工作区相对路径或绝对路径

### 资源管理器集成
- **单选**：右键任意文件复制其完整内容
- **多选**：选择多个文件/文件夹一次性复制全部
- **文件夹处理**：递归处理选中文件夹中的所有文本文件
- **智能过滤**：只处理文本文件，自动跳过二进制文件

### 语言映射
- 将文件扩展名映射为 Markdown 代码块标识符
- 支持特殊情况的自定义语言映射
- 确保在不同平台上正确的语法高亮显示

## 安装方法

### 从 VSCode 市场安装
1. 打开 VSCode
2. 按 `Ctrl+Shift+X` 打开扩展面板
3. 搜索 "Copy as Markdown"
4. 点击安装

### 从 VSIX 文件安装
1. 下载 `.vsix` 文件
2. 在 VSCode 中按 `Ctrl+Shift+P` 打开命令面板
3. 输入 "Extensions: Install from VSIX"
4. 选择下载的 `.vsix` 文件

## 快捷键

**默认快捷键：**
- Windows/Linux：`Ctrl+Alt+C`
- macOS：`Cmd+Shift+C`

**自定义快捷键：**
1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 "Preferences: Open Keyboard Shortcuts"
3. 搜索 "copyAsMarkdown.copySelected"
4. 设置您喜欢的按键组合

## 使用场景

- 📝 **技术文档编写**：快速将代码片段插入到 Markdown 文档中
- 💬 **代码分享**：在聊天工具或论坛中分享格式化的代码
- 📚 **教程制作**：创建包含代码示例的编程教程
- 🐛 **问题报告**：在 GitHub Issues 中提交格式化的代码
- 📖 **博客写作**：为技术博客准备代码示例
- 👨‍🏫 **教学**：创建包含正确格式代码的教育材料
- 📦 **项目文档**：将整个项目结构复制为文档
- 🔄 **代码迁移**：在不同平台间传输代码并保持格式

## 国际化

扩展会自动适应您的 VSCode 语言设置：
- **English**：默认语言
- **简体中文**：完整中文本地化
- 更多语言即将推出！

## 更新日志

### 0.0.2
- ✨ **资源管理器集成**：在资源管理器中右键文件/文件夹复制为 Markdown
- 📂 **多文件支持**：一次选择并复制多个文件或文件夹
- 🔄 **递归处理**：自动处理文件夹中的所有文本文件
- 🎯 **智能文件检测**：自动检测并过滤文本文件
- 🌐 **扩展语言支持**：增强的文件类型检测和语言映射

### 0.0.1
- 🎉 初始版本发布
- ✨ 右键菜单"复制为md"功能
- 🧠 智能省略号检测
- 🏷️ 自动文件名和语言检测
- 📋 一键剪贴板复制
- ⚙️ 全面的配置选项
- 🌍 国际化支持（英文和中文）
- ⌨️ 快捷键支持

## 贡献

欢迎贡献！请随时提交 Issues 和 Pull Requests。

### 开发环境设置
1. 克隆仓库
2. 运行 `npm install`
3. 在 VSCode 中打开
4. 按 `F5` 开始调试

## 许可证

[MIT License](LICENSE)

## 反馈与支持

如果您遇到任何问题或有功能建议：

1. 在 GitHub 上提交 Issue
2. 在 VSCode 扩展评论区留下反馈
3. 为扩展评分 - 您的支持很重要！

**享受更高效的代码分享体验！** 🎉