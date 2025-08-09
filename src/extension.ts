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
        addEllipsisDetail: config.get('addEllipsisDetail', false)
    };
}

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

export function deactivate() {}