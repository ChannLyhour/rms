# SKYPARK Condotel & Residence — Brand Color Code & Design System

This directory contains the official digital brand color system and CSS stylesheets extracted directly from the SKYPARK Brand Identity assets.

---

## 🎨 Official Brand Color Codes

| Color Name | Role | HEX | RGB | HSL | Preview |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Primary Teal** | Primary Brand (Ocean Pine) | `#126973` | `rgb(18, 105, 115)` | `hsl(186, 73%, 26%)` | `██████` <br> ` #126973 ` |
| **Champagne Gold** | Secondary Brand (Sand Warmth) | `#F1D8C2` | `rgb(241, 216, 194)` | `hsl(28, 61%, 85%)` | `██████` <br> ` #F1D8C2 ` |
| **Secondary Black** | Deep Charcoal Noir | `#020202` | `rgb(2, 2, 2)` | `hsl(0, 0%, 1%)` | `██████` <br> ` #020202 ` |
| **Secondary White** | Warm Alabaster Ivory | `#F8F7F4` | `rgb(248, 247, 244)` | `hsl(45, 20%, 96%)` | `██████` <br> ` #F8F7F4 ` |

---

## 📁 File Structure

- **[`skypark.css`](./skypark.css)**: Master stylesheet with CSS variables, component styles (buttons, cards, badges), typography rules, and theme switching.
- **[`variables.css`](./variables.css)**: Pure CSS custom properties / tokens for direct import into existing CSS frameworks.
- **[`colors.css`](./colors.css)**: Atomic helper classes (`.bg-skypark-primary`, `.text-skypark-gold`, etc.).
- **[`tailwind.skypark.js`](./tailwind.skypark.js)**: Tailwind CSS theme extension file.
- **[`preview.html`](./preview.html)**: Interactive visual color palette and UI showcase with click-to-copy functionality and dark/light mode toggle.

---

## 🚀 How to Use in Your Project

### 1. Standard HTML / Webpage
```html
<link rel="stylesheet" href="./color-code/skypark.css">

<!-- Example Usage -->
<button class="skypark-btn skypark-btn-primary">Book Now</button>
<div class="skypark-card-luxury">Luxury Experience</div>
```

### 2. React / Vite Application
Import in `src/main.jsx` or `src/index.css`:
```css
@import '../SKYPARK Brand ID/color-code/skypark.css';
```

### 3. CSS Variables Usage
```css
.my-custom-element {
  background-color: var(--skypark-primary);
  color: var(--skypark-gold);
  border: 1px solid var(--skypark-teal-700);
}
```

### 4. Tailwind CSS Configuration
In `tailwind.config.js`:
```javascript
const skypark = require('./SKYPARK Brand ID/color-code/tailwind.skypark.js');

module.exports = {
  theme: {
    extend: {
      colors: skypark.colors,
      fontFamily: skypark.fontFamily,
    }
  }
};
```
Now you can use classes like `bg-skypark-primary`, `text-skypark-gold`, `bg-skypark-teal-500`, etc.

---

## 🔤 Brand Typography
- **Display / Header**: `KSMetika` (located in `../Font/`) or `Playfair Display`
- **Body / Sans**: `Montserrat` (located in `../Font/Montserrat/`)
