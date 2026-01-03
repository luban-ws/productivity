/**
 * 配置文件读取模块
 * @description 支持 JSON 和 YAML 格式的配置文件读取
 * 
 * 功能：
 * - 自动查找配置文件（优先级：yaml > yml > json）
 * - 解析 JSON 和 YAML 格式
 * - 验证配置结构
 * - 提供默认配置
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import type { DevConfig, DemoOption } from './types.js';

/**
 * 默认配置（如果找不到配置文件时使用）
 */
const DEFAULT_CONFIG: DevConfig = {
  projectName: 'quizerjs',
  packageManager: 'pnpm',
  demos: [],
};

/**
 * 查找配置文件
 * 按优先级查找：dev.config.yaml > dev.config.yml > dev.config.json
 */
function findConfigFile(cwd: string = process.cwd()): string | null {
  const configFiles = [
    join(cwd, 'dev.config.yaml'),
    join(cwd, 'dev.config.yml'),
    join(cwd, 'dev.config.json'),
  ];

  for (const file of configFiles) {
    if (existsSync(file)) {
      return file;
    }
  }

  return null;
}

/**
 * 读取配置文件
 */
export function loadConfig(cwd?: string): DevConfig {
  const configFile = findConfigFile(cwd);

  if (!configFile) {
    // 没有找到配置文件，返回默认配置
    console.warn('⚠️  未找到 dev.config.json 或 dev.config.yaml，使用默认配置');
    return DEFAULT_CONFIG;
  }

  try {
    const content = readFileSync(configFile, 'utf-8');
    const ext = configFile.split('.').pop()?.toLowerCase();

    let config: DevConfig;

    if (ext === 'yaml' || ext === 'yml') {
      // 解析 YAML
      config = yaml.load(content) as DevConfig;
    } else {
      // 解析 JSON
      config = JSON.parse(content) as DevConfig;
    }

    // 验证配置
    if (!config.demos || !Array.isArray(config.demos)) {
      throw new Error('配置文件必须包含 demos 数组');
    }

    // 验证每个 demo 选项
    for (const demo of config.demos) {
      if (!demo.name || !demo.value || !demo.package) {
        throw new Error('每个 demo 必须包含 name、value 和 package 字段');
      }
    }

    return {
      ...DEFAULT_CONFIG,
      ...config,
    };
  } catch (error) {
    console.error(`❌ 读取配置文件失败: ${configFile}`);
    console.error(error instanceof Error ? error.message : String(error));
    console.warn('⚠️  使用默认配置');
    return DEFAULT_CONFIG;
  }
}

/**
 * 获取 Demo 选项列表
 */
export function getDemoOptions(config: DevConfig): DemoOption[] {
  return config.demos || [];
}
