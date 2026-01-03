/**
 * 类型定义测试
 * @description 测试 TypeScript 类型定义的正确性
 */

import { describe, it, expectTypeOf } from 'vitest';
import type { DevConfig, DemoOption } from '../src/types.js';

describe('类型定义', () => {
  describe('DemoOption', () => {
    it('应该具有正确的属性类型', () => {
      // 创建一个符合 DemoOption 类型的对象
      const demo: DemoOption = {
        name: 'Test Demo',
        value: 'test',
        description: '测试演示项目',
        package: '@test/demo',
      };

      // 验证类型
      expectTypeOf(demo.name).toBeString();
      expectTypeOf(demo.value).toBeString();
      expectTypeOf(demo.description).toBeString();
      expectTypeOf(demo.package).toBeString();
    });
  });

  describe('DevConfig', () => {
    it('应该具有正确的属性类型', () => {
      // 创建一个符合 DevConfig 类型的对象
      const config: DevConfig = {
        projectName: 'quizerjs',
        packageManager: 'pnpm',
        demos: [],
      };

      // 验证类型
      expectTypeOf(config.projectName).toEqualTypeOf<string | undefined>();
      expectTypeOf(config.packageManager).toEqualTypeOf<string | undefined>();
      expectTypeOf(config.demos).toEqualTypeOf<DemoOption[]>();
    });

    it('应该允许可选的 projectName 和 packageManager', () => {
      // 只提供必需的 demos 字段
      const minimalConfig: DevConfig = {
        demos: [],
      };

      // 验证最小配置是有效的
      expectTypeOf(minimalConfig).toMatchTypeOf<DevConfig>();
    });
  });
});
