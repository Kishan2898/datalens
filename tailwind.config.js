export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#09111f',
        mist: '#f5f7fb',
        signal: '#0ea5e9',
        glow: '#22c55e',
        amber: '#f59e0b',
      },
      boxShadow: {
        soft: '0 20px 45px rgba(15, 23, 42, 0.08)',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at top, rgba(14, 165, 233, 0.16), transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.9), rgba(245,247,251,0.96))',
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
