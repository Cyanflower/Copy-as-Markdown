import * as vscode from 'vscode';

interface I18nMessages {
    // 消息提示
    'message.noActiveEditor': string;
    'message.noSelection': string;
    'message.copySuccess': string;
    'message.copyFailed': string;
    'message.noFilesSelected': string;
    'message.copyFilesSuccess': string;
    'message.fileReadError': string;
    'message.unsupportedFileType': string;
    // 省略号详细信息
    'ellipsis.above.lines': string;
    'ellipsis.below.lines': string;
    'ellipsis.above.line': string;
    'ellipsis.below.line': string;
}

const messages: { [locale: string]: I18nMessages } = {
    'zh-cn': {
        'message.noActiveEditor': '没有活动的编辑器',
        'message.noSelection': '请先选择要复制的内容',
        'message.copySuccess': '已复制为 Markdown 格式',
        'message.copyFailed': '复制失败',
        'ellipsis.above.lines': '省略上方 {0} 行...',
        'ellipsis.below.lines': '省略下方 {0} 行...',
        'ellipsis.above.line': '省略上方 1 行...',
        'ellipsis.below.line': '省略下方 1 行...',
        'message.noFilesSelected': '没有选择文件',
        'message.copyFilesSuccess': '已复制 {0} 个文件为 Markdown 格式',
        'message.fileReadError': '读取文件失败: {0}',
        'message.unsupportedFileType': '不支持的文件类型: {0}'
    },
    'en': {
        'message.noActiveEditor': 'No active editor',
        'message.noSelection': 'Please select content to copy first',
        'message.copySuccess': 'Copied as Markdown format',
        'message.copyFailed': 'Copy failed',
        'ellipsis.above.lines': 'Omitted {0} lines above...',
        'ellipsis.below.lines': 'Omitted {0} lines below...',
        'ellipsis.above.line': 'Omitted 1 line above...',
        'ellipsis.below.line': 'Omitted 1 line below...',
        'message.noFilesSelected': 'No files selected',
        'message.copyFilesSuccess': 'Copied {0} files as Markdown format',
        'message.fileReadError': 'Failed to read file: {0}',
        'message.unsupportedFileType': 'Unsupported file type: {0}'
    }
};

let currentLocale: string = 'en';

export function initializeI18n() {
    const vscodeLang = vscode.env.language.toLowerCase();
    
    // 映射 VSCode 语言到我们支持的语言
    if (vscodeLang.startsWith('zh')) {
        currentLocale = 'zh-cn';
    } else {
        currentLocale = 'en';
    }
}

export function t(key: keyof I18nMessages, ...args: string[]): string {
    const message = messages[currentLocale]?.[key] || messages['en'][key] || key;
    
    // 简单的字符串替换，支持 {0}, {1} 等占位符
    return message.replace(/\{(\d+)\}/g, (match, index) => {
        return args[parseInt(index)] || match;
    });
}

export function getCurrentLocale(): string {
    return currentLocale;
}