import purgeCSS from '@fullhuman/postcss-purgecss';

// Sirf bootstrap CSS purge hoti hai, apni CSS untouched.
const bootstrapPurge = purgeCSS({
  content: ['./src/**/*.{astro,md,mdx,js,ts,html}'],
  safelist: {
    standard: [
      /^(html|body|a|p|img|hr|ul|ol|li|table|thead|tbody|tfoot|tr|th|td|caption|blockquote|pre|code|kbd|strong|em|small|button|input|select|textarea|label|form|figure|figcaption|h[1-6]|svg|path)$/,
      /^(active|show|fade|collapse|collapsing|disabled|is-open|is-hidden|copied)$/,
    ],
  },
});

export default {
  plugins: [
    {
      postcssPlugin: 'purge-bootstrap-only',
      Once(root, helpers) {
        const file = root.source?.input?.file || '';
        if (file.includes('bootstrap')) return bootstrapPurge.OnceExit?.(root, helpers) ?? bootstrapPurge.Once?.(root, helpers);
      },
    },
  ],
};
