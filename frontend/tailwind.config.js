/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        amazon: {
          primary:   "#FF9900",   // accent / search button
          header:    "#131921",   // top navbar
          nav:       "#232F3E",   // secondary nav + footer
          btn:       "#FFD814",   // Add to Cart
          buy:       "#FFA41C",   // Buy Now
          link:      "#007185",   // text links
          text:      "#0F1111",   // body text
          muted:     "#565959",   // secondary text
          border:    "#DDD",      // card borders
          bg:        "#F3F3F3",   // page background
          red:       "#CC0C39",   // badges, errors
          green:     "#067D62",   // in stock, success
        }
      },
      fontFamily: {
        amazon: ['"Amazon Ember"', '"Segoe UI"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
