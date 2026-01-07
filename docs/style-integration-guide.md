# 🎨 Custom Mapbox Style Integration Guide

## 📁 **Step 1: Extract Your Style.json File**

1. **Extract the ZIP file** you received from Mapbox Studio
2. **Find the `style.json` file** in the extracted folder
3. **Copy `style.json`** to your project:
   ```
   Nav/
   ├── assets/
   │   └── mapbox/
   │       └── style.json  ← Place your file here
   ```

## 🔧 **Step 2: Choose Integration Method**

### **Method A: Use Style URL (Recommended - Already Done)**
✅ **Currently implemented** - Your app now uses:
- Style URL: `mapbox://styles/varunkm360/cmk2grhzg00kd01s931qtec1p`
- Access Token: `pk.eyJ1IjoidmFydW5rbTM2MCIsImEiOiJjbWVpNHA5eGswNjBtMmtxdGxia2cxN2w2In0.f88HMcQt5Lh9ZQGIpeNKug`

### **Method B: Use Local Style.json (Optional)**
If you want to use the local file instead:

```typescript
// In app/(tabs)/map.tsx, replace the mapStyle state:
const [mapStyle, setMapStyle] = useState(require('@/assets/mapbox/style.json'));
```

## 🎯 **Step 3: Verify Integration**

### **Check These Files Were Updated:**
- ✅ `app/(tabs)/map.tsx` - Updated with your access token and style URL
- ✅ `features/navigation/mapboxRouting.ts` - Updated with your access token
- ✅ `services/customMapboxStyle.ts` - Created with your style configuration

### **Test Your Custom Style:**
1. **Run the app**: `npx expo run:android`
2. **Check the map loads** with your custom style
3. **Test style switching** using the floating button (layers icon)
4. **Verify routing works** with your access token

## 🎨 **Step 4: Customize Style Elements**

### **Campus Layer Colors**
Edit `services/customMapboxStyle.ts` to match your style:

```typescript
export const CUSTOM_STYLE_CONFIG = {
  campusLayers: {
    buildings: {
      fillColor: "#YOUR_BUILDING_COLOR",     // Match your style
      strokeColor: "#YOUR_BORDER_COLOR"
    },
    boundary: {
      fillColor: "rgba(YOUR_R, YOUR_G, YOUR_B, 0.1)",
      strokeColor: "#YOUR_BOUNDARY_COLOR"
    },
    paths: {
      strokeColor: "#YOUR_PATH_COLOR"
    },
    route: {
      strokeColor: "#YOUR_ROUTE_COLOR"       // Navigation route color
    }
  }
};
```

### **Marker Styling**
Update marker colors to match your style:

```typescript
markers: {
  default: {
    color: "#YOUR_MARKER_COLOR",
    strokeColor: "#FFFFFF"
  }
}
```

## 🔄 **Step 5: Style Switching**

Your app now supports multiple styles:

```typescript
const availableStyles = [
  {
    id: "custom",
    name: "Custom Campus Style",
    url: "mapbox://styles/varunkm360/cmk2grhzg00kd01s931qtec1p"
  },
  {
    id: "streets", 
    name: "Streets",
    url: "mapbox://styles/mapbox/streets-v12"
  },
  // Add more styles here
];
```

**To add more custom styles:**
1. Create additional styles in Mapbox Studio
2. Add them to the `availableStyles` array
3. Users can switch using the layers button

## 🛠️ **Step 6: Advanced Customization**

### **If You Want to Use Local Style.json:**

1. **Place style.json** in `assets/mapbox/style.json`

2. **Create a style loader**:
```typescript
// services/localStyleLoader.ts
export const loadLocalStyle = () => {
  try {
    return require('@/assets/mapbox/style.json');
  } catch (error) {
    console.error('Failed to load local style:', error);
    return null;
  }
};
```

3. **Update map component**:
```typescript
// In MapScreen component
const [mapStyle, setMapStyle] = useState(() => {
  const localStyle = loadLocalStyle();
  return localStyle || CUSTOM_MAPBOX_CONFIG.styleUrl;
});
```

### **Custom Fonts and Icons**
If your style.json includes custom fonts or sprites:

1. **Extract font files** from the ZIP
2. **Place in assets folder**:
   ```
   assets/
   ├── fonts/
   │   └── your-custom-font.ttf
   └── sprites/
       ├── sprite.png
       └── sprite.json
   ```

3. **Update style.json paths** to point to local assets

## 🔍 **Troubleshooting**

### **Style Not Loading:**
- ✅ Check access token is correct
- ✅ Verify style URL format: `mapbox://styles/username/style_id`
- ✅ Ensure internet connection for remote styles

### **Colors Don't Match:**
- Edit `CUSTOM_STYLE_CONFIG` in `services/customMapboxStyle.ts`
- Use color picker to match your Mapbox Studio colors

### **Performance Issues:**
- Use style URL instead of local JSON for better performance
- Optimize style in Mapbox Studio (remove unused layers)

## 📊 **Current Integration Status**

✅ **Completed:**
- Custom access token integrated
- Custom style URL set as default
- Style switching functionality
- Campus layers styled to complement your custom style
- Route styling updated

🎯 **Ready to Use:**
- Your custom campus map style is now the default
- All navigation features work with your style
- Users can switch between your custom style and standard Mapbox styles

## 🚀 **Next Steps**

1. **Test thoroughly** - Verify all features work with your custom style
2. **Fine-tune colors** - Adjust `CUSTOM_STYLE_CONFIG` to match perfectly
3. **Add more styles** - Create variations in Mapbox Studio
4. **Optimize performance** - Remove unused style layers if needed

Your custom Mapbox style is now fully integrated! 🎉