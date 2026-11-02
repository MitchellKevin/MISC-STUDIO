import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const config = [
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Pages link with plain <a> on purpose: page-transition.ts plays the
      // curtain and then does a full navigation.
      '@next/next/no-html-link-for-pages': 'off',
      // static export, images are served as-is from public/
      '@next/next/no-img-element': 'off',
      // the copy is prose, full of apostrophes and quotes
      'react/no-unescaped-entities': 'off',
    },
  },
  { ignores: ['.next/**', 'out/**', 'next-env.d.ts', 'tools/**'] },
];

export default config;
