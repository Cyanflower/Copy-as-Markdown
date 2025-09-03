import * as vscode from 'vscode';
import * as path from 'path';
import { initializeI18n, t } from './i18n';

interface ExtensionConfig {
    includeFileName: boolean;
    includeFilePath: boolean;
    filePathBase: 'workspace' | 'absolute';
    languageMap: { [key: string]: string };
    addEllipsis: boolean;
    addEllipsisDetail: boolean;
    customTextExtensions: string[];
}

export function activate(context: vscode.ExtensionContext) {
    // 初始化 i18n
    initializeI18n();
    
    // 注册命令
    let disposable = vscode.commands.registerCommand('copyAsMarkdown.copySelected', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage(t('message.noActiveEditor'));
            return;
        }

        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage(t('message.noSelection'));
            return;
        }

        // 获取配置
        const config = getExtensionConfig();

        // 获取选中的文本
        const selectedText = editor.document.getText(selection);
        
        // 获取文件名和路径信息
        const fileInfo = getFileInfo(editor.document.uri, config);
        
        // 获取文件语言标识符用于代码块
        const languageId = getLanguageIdentifier(editor.document.languageId, config.languageMap);
        
        // 判断是否为全选
        const isFullSelection = isFullFileSelected(editor, selection);
        
        // 生成 Markdown 格式
        let markdownContent: string;
        
        if (isFullSelection || !config.addEllipsis) {
            // 全选情况或不添加省略号
            markdownContent = config.includeFileName 
                ? `${fileInfo}\n\`\`\`${languageId}\n${selectedText}\n\`\`\``
                : `\`\`\`${languageId}\n${selectedText}\n\`\`\``;
        } else {
            // 部分选择情况，智能添加省略号
            const ellipsisInfo = getEllipsisInfo(editor, selection, config.addEllipsisDetail);
            const topEllipsis = ellipsisInfo.topEllipsis ? ellipsisInfo.topEllipsis + '\n' : '';
            const bottomEllipsis = ellipsisInfo.bottomEllipsis ? '\n' + ellipsisInfo.bottomEllipsis : '';
            
            const prefix = config.includeFileName ? `${fileInfo}:\n` : '';
            markdownContent = `${prefix}\`\`\`${languageId}\n${topEllipsis}${selectedText}${bottomEllipsis}\n\`\`\``;
        }
        
        // 复制到剪切板
        try {
            await vscode.env.clipboard.writeText(markdownContent);
            vscode.window.showInformationMessage(t('message.copySuccess'));
        } catch (error) {
            vscode.window.showErrorMessage(t('message.copyFailed') + ': ' + error);
        }
    });

    // 注册文件资源管理器复制命令
    let disposable2 = vscode.commands.registerCommand('copyAsMarkdown.copyFiles', async (uri: vscode.Uri, uris: vscode.Uri[]) => {
        // 如果没有传入 uris，说明是单选，使用 uri
        const selectedUris = uris && uris.length > 0 ? uris : (uri ? [uri] : []);
        
        if (selectedUris.length === 0) {
            vscode.window.showErrorMessage(t('message.noFilesSelected'));
            return;
        }

        try {
            const markdownContents: string[] = [];
            let processedFileCount = 0;

            for (const selectedUri of selectedUris) {
                const stat = await vscode.workspace.fs.stat(selectedUri);
                
                if (stat.type === vscode.FileType.File) {
                    // 处理文件
                    const content = await processFile(selectedUri);
                    if (content) {
                        markdownContents.push(content);
                        processedFileCount++;
                    }
                } else if (stat.type === vscode.FileType.Directory) {
                    // 处理文件夹
                    const folderContents = await processFolder(selectedUri);
                    markdownContents.push(...folderContents.contents);
                    processedFileCount += folderContents.count;
                }
            }

            if (markdownContents.length > 0) {
                const finalContent = markdownContents.join('\n\n');
                await vscode.env.clipboard.writeText(finalContent);
                vscode.window.showInformationMessage(t('message.copyFilesSuccess', processedFileCount.toString()));
            } else {
                vscode.window.showWarningMessage(t('message.noFilesSelected'));
            }
        } catch (error) {
            vscode.window.showErrorMessage(t('message.copyFailed') + ': ' + error);
        }
    });

    context.subscriptions.push(disposable);
}

/**
 * 获取扩展配置
 */
function getExtensionConfig(): ExtensionConfig {
    const config = vscode.workspace.getConfiguration('copyAsMarkdown');
    
    return {
        includeFileName: config.get('includeFileName', true),
        includeFilePath: config.get('includeFilePath', false),
        filePathBase: config.get('filePathBase', 'workspace'),
        languageMap: config.get('languageMap', {}),
        addEllipsis: config.get('addEllipsis', true),
        addEllipsisDetail: config.get('addEllipsisDetail', false),
        customTextExtensions: config.get<string[]>('customTextExtensions', [])
    };
}

// ====================================
// 文件选择复制部分
// ====================================


/**
 * 获取文件信息（文件名或路径）
 */
function getFileInfo(uri: vscode.Uri, config: ExtensionConfig): string {
    if (!config.includeFileName) {
        return '';
    }

    const fileName = path.basename(uri.fsPath) || 'untitled';
    
    if (!config.includeFilePath) {
        return fileName;
    }

    if (config.filePathBase === 'absolute') {
        return uri.fsPath;
    } else {
        // 相对于工作区
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            const relativePath = vscode.workspace.asRelativePath(uri);
            return relativePath;
        }
        return fileName;
    }
}

/**
 * 获取语言标识符用于 Markdown 代码块
 */
function getLanguageIdentifier(languageId: string, customMap: { [key: string]: string }): string {
    // 首先检查用户自定义映射
    if (customMap[languageId]) {
        return customMap[languageId];
    }

    // 默认映射
    const defaultLanguageMap: { [key: string]: string } = {
        'javascript': 'javascript',
        'typescript': 'typescript',
        'python': 'python',
        'java': 'java',
        'csharp': 'csharp',
        'cpp': 'cpp',
        'c': 'c',
        'html': 'html',
        'css': 'css',
        'scss': 'scss',
        'json': 'json',
        'xml': 'xml',
        'yaml': 'yaml',
        'markdown': 'markdown',
        'shell': 'bash',
        'powershell': 'powershell',
        'sql': 'sql',
        'go': 'go',
        'rust': 'rust',
        'php': 'php',
        'ruby': 'ruby',
        'swift': 'swift',
        'kotlin': 'kotlin',
        'vue': 'html',
        'jsx': 'javascript',
        'tsx': 'typescript'
    };
    
    return defaultLanguageMap[languageId] || languageId;
}

/**
 * 判断是否选中了整个文件内容
 */
function isFullFileSelected(editor: vscode.TextEditor, selection: vscode.Selection): boolean {
    const document = editor.document;
    
    // 判断选择的起始位置是否在文档开头（忽略前导空白）
    const firstLine = document.lineAt(0);
    const firstNonWhitespaceChar = firstLine.firstNonWhitespaceCharacterIndex;
    
    // 判断选择的结束位置是否在文档末尾（忽略尾随空白）
    const lastLineIndex = document.lineCount - 1;
    const lastLine = document.lineAt(lastLineIndex);
    
    // 检查是否选择了从开头到结尾的内容
    const isFromStart = selection.start.line === 0 && selection.start.character <= firstNonWhitespaceChar;
    const isToEnd = selection.end.line === lastLineIndex && selection.end.character >= lastLine.text.length;
    
    return isFromStart && isToEnd;
}

/**
 * 获取省略号信息：判断选择范围上方和下方是否有内容
 */
function getEllipsisInfo(editor: vscode.TextEditor, selection: vscode.Selection, useDetail: boolean): {
    topEllipsis: string;
    bottomEllipsis: string;
} {
    const document = editor.document;
    
    // 计算上方省略的行数
    let aboveLineCount = 0;
    let hasContentAbove = false;
    
    if (selection.start.line > 0) {
        // 检查选择起始行之前的所有行是否有非空白内容
        for (let i = 0; i < selection.start.line; i++) {
            const line = document.lineAt(i);
            if (line.text.trim().length > 0) {
                hasContentAbove = true;
                aboveLineCount++;
            }
        }
        
        // 如果选择不是从行首开始，检查同一行选择前面是否有内容
        if (selection.start.character > 0) {
            const currentLine = document.lineAt(selection.start.line);
            const beforeSelection = currentLine.text.substring(0, selection.start.character);
            if (beforeSelection.trim().length > 0) {
                hasContentAbove = true;
            }
        }
    }
    
    // 计算下方省略的行数
    let belowLineCount = 0;
    let hasContentBelow = false;
    const lastLineIndex = document.lineCount - 1;
    
    if (selection.end.line < lastLineIndex) {
        // 检查选择结束行之后的所有行是否有非空白内容
        for (let i = selection.end.line + 1; i <= lastLineIndex; i++) {
            const line = document.lineAt(i);
            if (line.text.trim().length > 0) {
                hasContentBelow = true;
                belowLineCount++;
            }
        }
    }
    
    // 如果选择不是到行尾结束，检查同一行选择后面是否有内容
    if (selection.end.line <= lastLineIndex) {
        const currentLine = document.lineAt(selection.end.line);
        const afterSelection = currentLine.text.substring(selection.end.character);
        if (afterSelection.trim().length > 0) {
            hasContentBelow = true;
        }
    }
    
    // 生成省略号文本
    let topEllipsis = '';
    let bottomEllipsis = '';
    
    if (hasContentAbove) {
        if (useDetail && aboveLineCount > 0) {
            topEllipsis = aboveLineCount === 1 
                ? t('ellipsis.above.line')
                : t('ellipsis.above.lines', aboveLineCount.toString());
        } else {
            topEllipsis = '...';
        }
    }
    
    if (hasContentBelow) {
        if (useDetail && belowLineCount > 0) {
            bottomEllipsis = belowLineCount === 1 
                ? t('ellipsis.below.line')
                : t('ellipsis.below.lines', belowLineCount.toString());
        } else {
            bottomEllipsis = '...';
        }
    }
    
    return {
        topEllipsis,
        bottomEllipsis
    };
}


// ====================================
// 资源管理器选择复制部分
// ====================================

/**
 * 处理单个文件
 */
async function processFile(uri: vscode.Uri): Promise<string | null> {
    try {
        const config = getExtensionConfig();
        
        // 检查文件是否为文本文件
        if (!isTextFile(uri.fsPath, config)) {
            console.log(t('message.unsupportedFileType', path.basename(uri.fsPath)));
            return null;
        }

        // 读取文件内容
        const fileContent = await vscode.workspace.fs.readFile(uri);
        const textContent = Buffer.from(fileContent).toString('utf8');
        
        // 获取文件信息
        const fileInfo = getFileInfo(uri, config);
        
        // 获取语言标识符
        const languageId = getLanguageIdentifierFromPath(uri.fsPath, config.languageMap);
        
        // 生成 Markdown 格式
        const markdownContent = config.includeFileName 
            ? `${fileInfo}\n\`\`\`${languageId}\n${textContent}\n\`\`\``
            : `\`\`\`${languageId}\n${textContent}\n\`\`\``;
        
        return markdownContent;
    } catch (error) {
        vscode.window.showErrorMessage(t('message.fileReadError', path.basename(uri.fsPath)));
        return null;
    }
}

/**
 * 处理文件夹（递归）
 */
async function processFolder(uri: vscode.Uri): Promise<{ contents: string[], count: number }> {
    const contents: string[] = [];
    let count = 0;

    try {
        const entries = await vscode.workspace.fs.readDirectory(uri);
        
        for (const [name, type] of entries) {
            const childUri = vscode.Uri.joinPath(uri, name);
            
            if (type === vscode.FileType.File) {
                const content = await processFile(childUri);
                if (content) {
                    contents.push(content);
                    count++;
                }
            } else if (type === vscode.FileType.Directory) {
                // 递归处理子文件夹
                const folderResult = await processFolder(childUri);
                contents.push(...folderResult.contents);
                count += folderResult.count;
            }
        }
    } catch (error) {
        console.error('Error processing folder:', error);
    }

    return { contents, count };
}

/**
 * 根据文件路径获取语言标识符
 */
function getLanguageIdentifierFromPath(filePath: string, customMap: { [key: string]: string }): string {
    const ext = path.extname(filePath).toLowerCase();
    
    // 文件扩展名到语言的映射
    const extensionToLanguage: { [key: string]: string } = {
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.py': 'python',
        '.java': 'java',
        '.cs': 'csharp',
        '.cpp': 'cpp',
        '.cc': 'cpp',
        '.cxx': 'cpp',
        '.c': 'c',
        '.h': 'c',
        '.hpp': 'cpp',
        '.html': 'html',
        '.htm': 'html',
        '.css': 'css',
        '.scss': 'scss',
        '.sass': 'scss',
        '.less': 'css',
        '.json': 'json',
        '.xml': 'xml',
        '.yaml': 'yaml',
        '.yml': 'yaml',
        '.md': 'markdown',
        '.sh': 'bash',
        '.bash': 'bash',
        '.zsh': 'bash',
        '.ps1': 'powershell',
        '.sql': 'sql',
        '.go': 'go',
        '.rs': 'rust',
        '.php': 'php',
        '.rb': 'ruby',
        '.swift': 'swift',
        '.kt': 'kotlin',
        '.vue': 'html',
        '.svelte': 'html',
        '.toml': 'toml',
        '.ini': 'ini',
        '.cfg': 'ini',
        '.conf': 'ini'
    };

    const languageFromExt = extensionToLanguage[ext];
    
    // 检查用户自定义映射
    if (languageFromExt && customMap[languageFromExt]) {
        return customMap[languageFromExt];
    }
    
    return languageFromExt || 'text';
}

/**
 * 判断是否为文本文件
 */
function isTextFile(filePath: string, config: ExtensionConfig): boolean {
    const ext = path.extname(filePath).toLowerCase();
    
    // 支持的文本文件扩展名
    const defaultTextExtensions  = [
        '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cs', '.cpp', '.cc', '.cxx', '.c', '.h', '.hpp',
        '.html', '.htm', '.css', '.scss', '.sass', '.less', '.json', '.xml', '.yaml', '.yml', '.md',
        '.sh', '.bash', '.zsh', '.ps1', '.sql', '.go', '.rs', '.php', '.rb', '.swift', '.kt',
        '.vue', '.svelte', '.toml', '.ini', '.cfg', '.conf', '.txt', '.log', '.env', '.gitignore',
        '.dockerfile', '.makefile', '.cmake', '.gradle', '.properties', '.bat', '.cmd'
    ];
    // 规范化用户自定义的扩展名（确保都以 '.' 开头且为小写），然后与默认列表合并
    const customExtensions = config.customTextExtensions.map(customExt => 
        (customExt.startsWith('.') ? customExt : '.' + customExt).toLowerCase()
    );

    const allTextExtensions = [...defaultTextExtensions, ...customExtensions];

    // 无扩展名的特殊文件
    const basename = path.basename(filePath).toLowerCase();
    const specialFiles = ['dockerfile', 'makefile', 'cmakefile', 'rakefile', 'gemfile'];
    
    return allTextExtensions .includes(ext) || specialFiles.includes(basename) || ext === '';
}

export function deactivate() {}