export default {
  'apps/web/**/*.{ts,tsx,js,jsx}': (files) => [
    `eslint --fix --config apps/web/eslint.config.js ${files.join(' ')}`,
    `prettier --write ${files.join(' ')}`,
  ],
  'packages/ui/**/*.{ts,tsx,js,jsx}': (files) => [
    `eslint --fix --config packages/ui/eslint.config.js ${files.join(' ')}`,
    `prettier --write ${files.join(' ')}`,
  ],
  'apps/api/**/*.{ts,js}': (files) => [
    `eslint --fix --config apps/api/eslint.config.js ${files.join(' ')}`,
    `prettier --write ${files.join(' ')}`,
  ],
  '*.{json,css,md,html}': 'prettier --write',
}
