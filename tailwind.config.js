/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        ink: { DEFAULT: '#0f1f3d', 2: '#3d4a63', 3: '#64708a' },
        page: '#f4f6f9',
        line: '#e3e7ee',
        brand: { 50: '#eef5fd', 100: '#d9e8fa', 500: '#2a78d6', 600: '#1f64b8', 700: '#184f95' },
        good: { 50: '#ecf7f0', 600: '#1a7f45', 700: '#146536' },
        warn: { 50: '#fdf5e6', 600: '#a96500', 700: '#8a5200' },
        bad: { 50: '#fcefee', 600: '#c03a39', 700: '#9e2a2a' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,31,61,0.05), 0 1px 3px rgba(15,31,61,0.06)',
        pop: '0 10px 30px rgba(15,31,61,0.16)',
      },
    },
  },
  plugins: [],
};
