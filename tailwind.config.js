/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. Point to ALL files that use Tailwind classes
  content: [
    "./pages/**/*.html",      // Your HTML files
    "./public/js/**/*.js"     // Your JS files (because you have innerHTML strings with classes)
  ],
  theme: {
    extend: {
      colors: {
        // I standardized your blues here. 
        // Use 'ranconBlue' for the main dark brand color (Client site)
        // Use 'adminBlue' if you want the lighter admin panel color
        ranconBlue: '#005a8d', 
        adminBlue: '#076C99',
        
        ranconRed: '#d32f2f', 
        bgGray: '#F3F4F6'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif']
      },
      // Merged animations from both Admin and Index
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-up': 'scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'zoom-in': 'zoomIn 0.3s ease-out forwards'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        zoomIn: { 
            '0%': { transform: 'scale(0.9)', opacity: '0' }, 
            '100%': { transform: 'scale(1)', opacity: '1' } 
        }
      },
      boxShadow: {
        'premium': '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
        'glow': '0 0 15px rgba(0, 90, 141, 0.3)'
      }
    },
  },
  plugins: [],
}