/** @type {import('eslint').Linter.Config} */
const config = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    // Add any custom rules here
  },
  ignorePatterns: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
};

module.exports = config;
