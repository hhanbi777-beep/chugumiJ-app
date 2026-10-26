// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', 'src/db/migrations/*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // as const 객체 + 같은 이름의 유니언 타입 패턴 허용
      '@typescript-eslint/no-redeclare': 'off',
    },
  },
  {
    rules: {
      // 다른 기능의 내부 파일 직접 import 금지: @/features/<기능> (index.ts)로만
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*'],
              message: '다른 기능은 @/features/<기능> (index.ts)로만 import 하세요.',
            },
          ],
        },
      ],
    },
  },
  {
    // shared는 기능을 몰라야 한다
    files: ['src/shared/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['@/features/*'], message: 'shared에서 features를 import 하지 마세요.' }] },
      ],
    },
  },
]);
