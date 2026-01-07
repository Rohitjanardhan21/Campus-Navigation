# 🧭 Campus Navigation App

A modern React Native campus navigation app with **real-time GPS navigation**, **custom Mapbox styles**, and **turn-by-turn voice directions** for seamless campus exploration.

## ✨ Key Features

- 🗺️ **Custom Mapbox Integration** - Beautiful campus-optimized map design
- 🧭 **Real-time Navigation** - Turn-by-turn directions with voice guidance
- 🔍 **Smart Search** - Find 25+ campus locations with category filtering
- 🎨 **Dark/Light Themes** - Adaptive UI with theme switching
- 📍 **GPS Tracking** - High-accuracy location services
- 🎯 **Multiple Map Styles** - Custom, Streets, Satellite, and Outdoors views

## 🛠️ Tech Stack

- **React Native + Expo** - Cross-platform mobile framework
- **TypeScript** - Type-safe development
- **Mapbox Maps SDK** - Custom maps and navigation
- **Mapbox Directions API** - Real road-based routing
- **expo-location** - GPS and location services
- **expo-speech** - Voice guidance

## 📋 Requirements

See `requirements.txt` for detailed system requirements and dependencies.

**Quick Requirements:**
- Node.js 18+
- Android Studio (Android) or Xcode (iOS)
- Expo CLI
- GPS-enabled device for testing

## � Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Rohitjanardhan21/Nav-modified.git
cd Nav-modified

# 2. Install dependencies
npm install

# 3. Install Expo CLI (if not installed)
npm install -g @expo/cli

# 4. Start development server
npx expo start

# 5. Run on device/emulator
npx expo run:android    # Android
npx expo run:ios        # iOS (macOS only)
```

## � Useage

1. **Search** - Tap search bar and type destination
2. **Navigate** - Select location and tap "Start Navigation"
3. **Follow** - Get turn-by-turn directions with voice guidance
4. **Customize** - Switch themes and map styles as needed

## 🏗️ Project Structure

```
Nav/
├── app/                    # Expo Router pages
├── components/             # UI components
├── hooks/                  # Custom React hooks
├── services/               # Mapbox integration
├── features/navigation/    # Navigation logic
├── src/data/              # Campus data (25+ locations)
├── assets/mapbox/         # Custom map styles
└── docs/                  # Documentation
```

## ⚙️ Configuration

- **Campus Data**: Edit `src/data/campusPlaces.ts` to add/modify locations
- **Map Center**: Update coordinates in `app/(tabs)/map.tsx`
- **Custom Style**: Place your `style.json` in `assets/mapbox/`
- **Mapbox Tokens**: Already configured with custom access token

## 🐛 Troubleshooting

- **Map not loading**: Check internet connection and Mapbox token
- **Location issues**: Enable GPS and grant location permissions
- **Build errors**: Run `npx expo prebuild --clean` and rebuild

## 📄 License

Private educational project - All rights reserved

## 🙏 Acknowledgments

Built with [Expo](https://expo.dev), [Mapbox](https://www.mapbox.com), and [Turf.js](https://turfjs.org)
