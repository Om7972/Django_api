# 🎨 FlowSpace AI - Component Style Guide

Quick reference for applying Tailwind CSS with glassmorphism, neumorphism, and claymorphism effects.

---

## 📦 Button Styles

### Glass Button (Frosted Glass Effect)
```jsx
<button className="glass-button px-6 py-3">
  Click Me
</button>
```
**Use Case**: Secondary actions, subtle CTAs

### Clay Button (3D Clay Effect)
```jsx
<button className="clay-button px-6 py-3">
  Primary Action
</button>
```
**Use Case**: Primary actions, main CTAs

### Neumorphic Button (Soft Extruded)
```jsx
<button className="neuo-button px-6 py-3">
  Toggle/Option
</button>
```
**Use Case**: Toggles, settings, subtle interactions

---

## 📇 Card Styles

### Glass Card
```jsx
<div className="glass-card p-6">
  <h3 className="gradient-text-primary">Title</h3>
  <p className="text-gray-300">Content</p>
</div>
```
**Features**: Transparent, backdrop blur, hover lift effect

### Neumorphic Card
```jsx
<div className="neuo-card p-6">
  <div className="text-3xl font-bold gradient-text">82</div>
  <p className="text-gray-400">Metric Label</p>
</div>
```
**Features**: Soft shadows, monochromatic, embedded look

### Clay Card
```jsx
<div className="clay-card p-6">
  <h3 className="text-white font-bold">Important Content</h3>
</div>
```
**Features**: Vibrant, rounded, prominent, playful

---

## 🏷️ Badge Styles

### Glass Badge
```jsx
<span className="badge-glass">
  New Feature
</span>
```

### Clay Badge
```jsx
<span className="badge-clay">
  Premium
</span>
```

---

## 👤 Avatar Styles

### Glass Avatar
```jsx
<img 
  src="user.jpg" 
  alt="User"
  className="avatar-glass w-12 h-12"
/>
```

### Clay Avatar
```jsx
<img 
  src="user.jpg" 
  alt="User"
  className="avatar-clay w-12 h-12"
/>
```

---

## 📝 Input Styles

### Neumorphic Input
```jsx
<input 
  type="text"
  placeholder="Enter text..."
  className="neuo-input w-full"
/>
```

### Select Dropdown
```jsx
<select className="neuo-input w-full">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

---

## 🎨 Text Styles

### Gradient Text (Primary)
```jsx
<h1 className="gradient-text">
  FlowSpace AI
</h1>
```

### Gradient Text (Secondary)
```jsx
<h2 className="gradient-text-primary">
  Dashboard
</h2>
```

### Regular Text Colors
```jsx
<p className="text-gray-300">Body text</p>
<p className="text-gray-400">Muted text</p>
<p className="text-indigo-400">Accent text</p>
```

---

## 🎭 Animation Classes

### Floating Animation
```jsx
<div className="animate-float">
  Floating element
</div>
```

### Slow Float
```jsx
<div className="animate-float-slow">
  Slowly floating element
</div>
```

### Pulse Glow
```jsx
<div className="animate-pulse-glow">
  Glowing element
</div>
```

### Gradient Shift
```jsx
<div className="animate-gradient">
  Animated gradient background
</div>
```

---

## 🌟 Special Effects

### Glass Hover Effect
```jsx
<div className="glass-card glass-card-hover">
  Lifts on hover
</div>
```

### 3D Transform
```jsx
<div className="perspective-1000">
  <div className="transform-3d rotate-y-6">
    3D rotated element
  </div>
</div>
```

### Backdrop Blur Background
```jsx
<div className="fixed inset-0 bg-black/80 backdrop-blur-sm">
  Modal overlay with blur
</div>
```

---

## 📐 Layout Utilities

### Container
```jsx
<div className="container mx-auto px-6">
  Centered content
</div>
```

### Grid Layout
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} className="glass-card p-6">
      {item.content}
    </div>
  ))}
</div>
```

### Flex Layout
```jsx
<div className="flex justify-center items-center space-x-4">
  <button className="clay-button">Action 1</button>
  <button className="glass-button">Action 2</button>
</div>
```

---

## 🎯 Common Patterns

### Stat Card
```jsx
<div className="neuo-card p-6">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-gray-400 text-sm">Metric Name</h3>
    <span className="badge-clay">+12%</span>
  </div>
  <div className="text-3xl font-bold gradient-text">
    2,845
  </div>
</div>
```

### Feature Card
```jsx
<div className="glass-card glass-card-hover p-6 overflow-hidden">
  <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
    <img 
      src="feature.jpg" 
      alt="Feature"
      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
    <div className="absolute bottom-4 left-4 text-4xl">🚀</div>
  </div>
  <h3 className="text-xl font-bold mb-3 gradient-text-primary">
    Feature Title
  </h3>
  <p className="text-gray-300 text-sm">
    Feature description goes here...
  </p>
  <button className="neuo-button mt-4 w-full text-sm">
    Learn More →
  </button>
</div>
```

### Action Button Group
```jsx
<div className="space-y-3">
  <button className="clay-button w-full py-3">
    🚀 Primary Action
  </button>
  <button className="neuo-button w-full py-3">
    ⚙️ Secondary Action
  </button>
  <button className="glass-button w-full py-3">
    ℹ️ Tertiary Action
  </button>
</div>
```

### Modal Dialog
```jsx
<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
  <motion.div 
    className="glass-card p-8 max-w-md w-full"
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
  >
    <h3 className="text-2xl font-bold mb-4 gradient-text">
      Modal Title
    </h3>
    <p className="text-gray-300 mb-6">
      Modal content goes here...
    </p>
    <div className="flex space-x-3">
      <button className="flex-1 clay-button">
        Confirm
      </button>
      <button className="flex-1 neuo-button">
        Cancel
      </button>
    </div>
  </motion.div>
</div>
```

---

## 🎨 Color Reference

### Background Gradients
```jsx
// Main app background
bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900

// Hero section
bg-gradient-to-r from-cyan-500 to-blue-600

// Success state
bg-gradient-to-r from-green-500 to-emerald-600

// Warning state
bg-gradient-to-r from-yellow-500 to-orange-500

// Error state
bg-gradient-to-r from-red-500 to-pink-600
```

### Shadow Utilities
```jsx
shadow-neuo-light  // Light theme neumorphism
shadow-neuo-dark   // Dark theme neumorphism
shadow-glass       // Glassmorphism glow
shadow-clay        // Claymorphism depth
```

---

## 📱 Responsive Breakpoints

```jsx
// Mobile first approach
className="px-4 md:px-6 lg:px-8"

// Grid adaptation
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// Text sizing
className="text-lg md:text-xl lg:text-2xl"

// Spacing
className="py-4 md:py-6 lg:py-8"
```

---

## ⚡ Performance Tips

1. **Use transform instead of position** for animations
2. **Leverage GPU acceleration** with `transform` and `opacity`
3. **Avoid inline styles** - use Tailwind classes
4. **Batch animations** with stagger delays
5. **Use will-change sparingly** - only on animated elements

---

## ♿ Accessibility Checklist

- ✅ Maintain contrast ratio (text gray-300+ on dark backgrounds)
- ✅ Provide focus states for interactive elements
- ✅ Use semantic HTML (buttons, links, headings)
- ✅ Include aria-labels where needed
- ✅ Ensure keyboard navigation works
- ✅ Test with screen readers

---

## 🔧 Customization

All styles can be customized in:
- `tailwind.config.js` - Theme colors, shadows, animations
- `index.css` - Global utility classes
- Component files - Individual overrides

Example: Change primary gradient
```javascript
// tailwind.config.js
colors: {
  primary: {
    500: '#your-color',
    600: '#your-darker-color',
  }
}
```

---

**Happy Coding! 🎨✨**
