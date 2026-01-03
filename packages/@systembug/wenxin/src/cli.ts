#!/usr/bin/env node

/**
 * 文心 CLI 入口
 *
 * 文心雕龙，雕琢文档之美
 * 支持 JSDoc 和 TypeScript 的通用 API 文档生成工具
 */

import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { generateDocs } from './index.js';
import { getDefaultConfig } from './config.js';
import { generateConfigTemplate } from './commands/init.js';
import type { ApiDocConfig } from './types.js';

const program = new Command();

program
  .name('wenxin')
  .description('文心 - 通用 API 文档生成工具，支持 JSDoc 和 TypeScript')
  .version('0.1.0');

// init 命令：生成配置文件
program
  .command('init')
  .description('生成文心配置文件模板（可选，零配置已足够）')
  .option('-f, --force', '强制覆盖已存在的配置文件')
  .option('--format <format>', '配置文件格式 (ts|js|json)', 'json')
  .action(async (options: { force?: boolean; format?: string }) => {
    const rootDir = process.cwd();
    const format = (options.format || 'json') as 'ts' | 'js' | 'json';
    const configFileName = `wenxin.config.${format}`;
    const configPath = join(rootDir, configFileName);

    // 检查文件是否已存在
    if (existsSync(configPath) && !options.force) {
      console.error(chalk.yellow(`配置文件已存在: ${configFileName}`));
      console.log(chalk.blue('使用 --force 选项可覆盖现有文件'));
      process.exit(1);
    }

    try {
      const spinner = ora('正在生成配置文件...').start();
      const content = generateConfigTemplate(format);
      writeFileSync(configPath, content, 'utf-8');
      spinner.succeed(chalk.green(`配置文件已生成: ${configFileName}`));

      console.log(chalk.blue('\n💡 提示：'));
      console.log(chalk.gray(' - 配置文件完全可选，文心支持零配置'));
      console.log(chalk.gray(' - 只需配置需要覆盖自动检测的部分'));
      console.log(chalk.gray(' - 删除配置文件即可恢复零配置模式'));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`生成配置文件失败: ${errorMessage}`));
      process.exit(1);
    }
  });

// 主命令：生成文档
program
  .option('-c, --config <path>', '配置文件路径')
  .option('-m, --mode <mode>', '文档生成模式: jsdoc, typedoc, hybrid', 'hybrid')
  .option('-o, --output <dir>', '输出目录')
  .option('--jsdoc-only', '仅使用 JSDoc')
  .option('--typedoc-only', '仅使用 TypeDoc')
  .option('--no-merge', '不合并类型信息')
  .action(async (options) => {
    try {
      // 构建配置选项
      const configOptions: Partial<ApiDocConfig> = {};

      if (options.mode) {
        configOptions.mode = options.mode as any;
      }

      if (options.jsdocOnly) {
        configOptions.mode = 'jsdoc';
      } else if (options.typedocOnly) {
        configOptions.mode = 'typedoc';
      }

      if (options.output) {
        configOptions.jsdoc = {
          opts: { destination: options.output },
        };
        configOptions.typedoc = {
          out: options.output,
        };
      }

      if (options.noMerge) {
        configOptions.mergeTypes = false;
      }

      // 显示启动信息
      const spinner = ora({
        text: '正在生成文档...',
        color: 'cyan',
      }).start();

      // 生成文档
      const result = await generateDocs(options.config, configOptions);

      if (result.success) {
        spinner.succeed(chalk.green('文档生成成功！'));
        console.log(chalk.blue('📁 输出目录:'), chalk.cyan(result.outputDir));
        if (result.filesProcessed) {
          console.log(
            chalk.blue('📄 处理文件数:'),
            chalk.cyan(result.filesProcessed),
          );
        }
        process.exit(0);
      } else {
        spinner.fail(chalk.red('文档生成失败'));
        console.error(chalk.red('错误信息:'), result.error);
        process.exit(1);
      }
    } catch (error) {
      const spinner = ora();
      spinner.fail(chalk.red('发生错误'));
      console.error(chalk.red('详情:'), error);
      process.exit(1);
    }
  });

// 添加子命令：显示默认配置
program
  .command('config')
  .description('显示默认配置')
  .action(() => {
    const spinner = ora('正在加载配置...').start();
    const config = getDefaultConfig();
    spinner.stop();
    console.log(chalk.blue('默认配置:'));
    console.log(JSON.stringify(config, null, 2));
  });

// 解析命令行参数
program.parse();

