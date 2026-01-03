#!/usr/bin/env node

/**
 * 构建 CLI 入口文件
 * 创建独立的 CLI 入口文件，包含 shebang
 * 该脚本在 tsc 编译后运行，为 CLI 添加正确的 shebang 并设置执行权限
 */

import { writeFileSync, chmodSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// 获取当前脚本目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// dist 目录和 CLI 入口文件路径
const distDir = join(__dirname, '../dist');
const cliEntryPath = join(distDir, 'cli-entry.js');

// 确保 dist 目录存在
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

/**
 * CLI 入口文件内容
 * 注意：这里导入的是 cli.js（由 TypeScript 编译生成）
 */
const cliEntryContent = `#!/usr/bin/env node

/**
 * 盘古 CLI 入口文件
 * 自动生成，请勿手动编辑
 * 
 * @description 这是 CLI 的真正入口点，负责：
 * 1. 提供 Node.js 可执行的 shebang
 * 2. 导入并执行 main 函数
 * 3. 处理未捕获的错误
 */

import { main } from './cli.js';

// 执行主函数并处理错误
main().catch(error => {
  console.error('❌ 未处理的错误:', error);
  process.exit(1);
});
`;

// 写入 CLI 入口文件
writeFileSync(cliEntryPath, cliEntryContent, 'utf-8');

// 在 Unix 系统上设置执行权限（0o755 = rwxr-xr-x）
if (process.platform !== 'win32') {
  chmodSync(cliEntryPath, 0o755);
}

console.log('✅ CLI 入口文件已创建:', cliEntryPath);
