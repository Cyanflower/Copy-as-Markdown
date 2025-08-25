# Copy as Markdown

A VSCode extension that copies selected code as Markdown format with intelligent formatting and file information.

[中文文档](README.zh-cn.md)

## Features

- 🚀 **Context Menu Integration**: Right-click to use "Copy as Markdown" directly
- 📁 **Auto File Info**: Automatically includes current filename and optional path
- 🎯 **Smart Ellipsis**: Intelligently adds ellipsis based on selection context
- 🌈 **Language Detection**: Automatically detects file type and sets correct code block language
- 📋 **One-Click Copy**: Processed Markdown content copied directly to clipboard
- ⌨️ **Keyboard Shortcuts**: Quick access via customizable hotkeys
- 🌍 **i18n Support**: Automatically adapts to your VSCode language settings
- ⚙️ **Highly Configurable**: Extensive customization options
- 📂 **Explorer Integration**: Right-click files/folders in Explorer to copy entire contents
- 🗂️ **Multi-File Support**: Select and copy multiple files or folders at once
- 🔄 **Recursive Folder Processing**: Automatically processes all text files in folders

## Usage

### Copy Selected Code
1. Open any code file in VSCode
2. Select the code snippet you want to copy
3. Right-click on the selection
4. Choose "Copy as Markdown" from the context menu
5. The formatted Markdown content is now in your clipboard

### Copy Entire Files/Folders
1. In the Explorer panel, right-click on one or more files/folders
2. Choose "Copy as Markdown" from the context menu
3. All selected files will be copied as Markdown code blocks
4. Folders will be processed recursively, including all text files

**Alternative methods:**
- Use keyboard shortcut: `Ctrl+Alt+C` (Windows/Linux) or `Cmd+Shift+C` (macOS)
- Open Command Palette (`Ctrl+Shift+P`) and search for "Copy as Markdown"

## Output Formats

### Single File Selection
````
filename.py
```python
def hello_world():
    print("Hello, World!")
    return "success"
```
````

### Multiple Files
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

### Partial Code Selection (Smart Ellipsis)

#### Selection from File Beginning
````
filename.py:
```python
def hello_world():
    print("Hello, World!")
...
```
````

#### Selection from File Middle
````
filename.py:
```python
...
def hello_world():
    print("Hello, World!")
...
```
````

#### Selection from File End
````
filename.py:
```python
...
def hello_world():
    print("Hello, World!")
```
````

#### With Detailed Ellipsis (Optional)
````
src/utils.py:
```python
Omitted 15 lines above...
def hello_world():
    print("Hello, World!")
Omitted 8 lines below...
```
````

## Supported File Types

The extension automatically detects and processes text files including:

- **Programming Languages**: JavaScript, TypeScript, Python, Java, C/C++/C#, Go, Rust, PHP, Ruby, Swift, Kotlin, etc.
- **Web Technologies**: HTML, CSS, SCSS, Vue, React (JSX/TSX)
- **Data Formats**: JSON, XML, YAML, TOML
- **Configuration Files**: .env, .ini, .conf, .properties
- **Scripts**: Shell, PowerShell, Batch files
- **Documentation**: Markdown, plain text
- **Special Files**: Dockerfile, Makefile, .gitignore

Binary files are automatically skipped during folder processing.

## Configuration Options

### Basic Settings
- `copyAsMarkdown.includeFileName`: Whether to include filename (default: `true`)
- `copyAsMarkdown.includeFilePath`: Whether to include file path - requires filename option (default: `false`)
- `copyAsMarkdown.filePathBase`: File path display mode (default: `"workspace"`)
  - `"workspace"`: Relative to VSCode workspace
  - `"absolute"`: System absolute path

### Ellipsis Settings
- `copyAsMarkdown.addEllipsis`: Whether to add ellipsis for partial selections (default: `true`)
- `copyAsMarkdown.addEllipsisDetail`: Whether to show detailed line count information - requires ellipsis option (default: `false`)

### Language Mapping
- `copyAsMarkdown.languageMap`: Custom language mapping for code blocks (default: `{}`)

**Example configuration:**
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

## Smart Features

### Intelligent Ellipsis
- **Content above**: Adds `...` above code block
- **Content below**: Adds `...` below code block
- **Content both sides**: Adds ellipsis on both sides
- **Full selection or no other content**: No ellipsis added
- **Detailed mode**: Shows actual line counts (e.g., "Omitted 5 lines above...")

### Automatic File Detection
- Automatically detects current filename with extension
- Supports unsaved files (displays as "untitled")
- Optional file path display with workspace-relative or absolute paths

### Explorer Integration
- **Single Selection**: Right-click any file to copy its entire content
- **Multi-Selection**: Select multiple files/folders and copy all at once
- **Folder Processing**: Recursively processes all text files in selected folders
- **Smart Filtering**: Only processes text files, skips binary files automatically

### Language Mapping
- Maps file extensions to Markdown code block identifiers
- Supports custom language mapping for special cases
- Ensures proper syntax highlighting across different platforms

## Installation

### From VSCode Marketplace
1. Open VSCode
2. Press `Ctrl+Shift+X` to open Extensions panel
3. Search for "Copy as Markdown"
4. Click Install

### From VSIX File
1. Download the `.vsix` file
2. In VSCode, press `Ctrl+Shift+P` to open Command Palette
3. Type "Extensions: Install from VSIX"
4. Select the downloaded `.vsix` file

## Keyboard Shortcuts

**Default shortcuts:**
- Windows/Linux: `Ctrl+Alt+C`
- macOS: `Cmd+Shift+C`

**To customize shortcuts:**
1. Press `Ctrl+Shift+P` to open Command Palette
2. Type "Preferences: Open Keyboard Shortcuts"
3. Search for "copyAsMarkdown.copySelected"
4. Set your preferred key combination

## Use Cases

- 📝 **Technical Documentation**: Quickly insert code snippets into Markdown documents
- 💬 **Code Sharing**: Share formatted code in chat tools or forums
- 📚 **Tutorial Creation**: Create programming tutorials with code examples
- 🐛 **Issue Reporting**: Submit formatted code in GitHub Issues
- 📖 **Blog Writing**: Prepare code examples for technical blogs
- 👨‍🏫 **Teaching**: Create educational materials with properly formatted code
- 📦 **Project Documentation**: Copy entire project structures as documentation
- 🔄 **Code Migration**: Transfer code between different platforms maintaining formatting

## Internationalization

The extension automatically adapts to your VSCode language settings:
- **English**: Default language
- **简体中文**: Full Chinese localization
- More languages coming soon!

## Changelog

### 0.0.2
- ✨ **Explorer Integration**: Right-click files/folders in Explorer to copy as Markdown
- 📂 **Multi-File Support**: Select and copy multiple files or folders at once
- 🔄 **Recursive Processing**: Automatically processes all text files in folders
- 🎯 **Smart File Detection**: Automatically detects and filters text files
- 🌐 **Extended Language Support**: Enhanced file type detection and language mapping

### 0.0.1
- 🎉 Initial release
- ✨ Context menu "Copy as Markdown" functionality
- 🧠 Intelligent ellipsis detection
- 🏷️ Automatic filename and language detection
- 📋 One-click clipboard copy
- ⚙️ Comprehensive configuration options
- 🌍 i18n support (English & Chinese)
- ⌨️ Keyboard shortcuts

## Contributing

Contributions are welcome! Please feel free to submit Issues and Pull Requests.

### Development Setup
1. Clone the repository
2. Run `npm install`
3. Open in VSCode
4. Press `F5` to start debugging

## License

[MIT License](LICENSE)

## Feedback & Support

If you encounter any issues or have feature suggestions:

1. Submit an Issue on GitHub
2. Leave feedback in the VSCode extension comments
3. Rate the extension - your support matters!

**Enjoy more efficient code sharing!** 🎉