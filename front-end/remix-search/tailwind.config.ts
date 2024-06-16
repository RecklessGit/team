import type { Config } from 'tailwindcss';

module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '480px', // Custom extra small breakpoint
        sm: '640px', // Small breakpoint
        md: '768px', // Medium breakpoint
        lg: '1024px', // Large breakpoint
        xl: '1280px', // Extra large breakpoint
        '2xl': '1536px', // 2XL breakpoint
      },
      gridTemplateColumns: {
        'dynamic': 'repeat(auto-fill, minmax(250px, 1fr))',
      },
    },
  },
  plugins: [],
} satisfies Config;
