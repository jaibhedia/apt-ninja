# Aptos Coin Ninja - React Version

A React.js rewrite of the Aptos Coin Ninja game, preserving all original aesthetics, animations, design, feel, and functionality.

## Overview

Aptos Coin Ninja is a fruit ninja-style game where players slash Aptos tokens to earn points while avoiding bombs. This React version maintains:

- ✅ All original visual design and aesthetics
- ✅ Smooth animations and particle effects
- ✅ Game mechanics and scoring system
- ✅ Responsive design for mobile and desktop
- ✅ Local storage for best scores
- ✅ Complete game flow (Start → Game → Results)

## Features

### Game Mechanics
- **Slash Aptos tokens** for 10 points each
- **Avoid bombs** or lose a life
- **3 lives total** - game ends when all lives are lost
- **Progressive difficulty** with increasing item spawn rates
- **Accuracy tracking** and detailed statistics

### Visual Features
- **Particle effects** on coin slashing
- **Screen flash** effects for wrong slashes
- **Animated coin sprites** with rotation
- **Slash trail effects** following mouse/touch
- **Responsive canvas** that adapts to screen size
- **Dark/light theme support** via CSS variables

### Technical Features
- **React hooks** for game state management
- **Canvas-based rendering** for smooth 60fps gameplay
- **Touch and mouse support** for all devices
- **Modular component architecture**
- **Custom hooks** for game logic separation
- **Performance optimized** with useCallback and useMemo

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to play the game.

## Project Structure

```
src/
├── components/           # React components
│   ├── StartScreen.js   # Welcome screen with play button
│   ├── GameScreen.js    # Main game interface
│   ├── ResultsScreen.js # End game statistics
│   └── ParticleContainer.js # Particle effects system
├── hooks/               # Custom React hooks
│   ├── useGameState.js  # Core game state management
│   ├── useGameLoop.js   # Game loop and rendering
│   └── useSlashDetection.js # Mouse/touch slash detection
├── styles/              # CSS and design system
│   └── design-system.css # Complete original styles
├── App.js              # Main app component
└── index.js            # React app entry point
```

## Game Components

### StartScreen
- Displays game title and instructions
- Shows best score from localStorage
- Animated Aptos logo with floating effect
- Play button to start the game

### GameScreen
- Real-time score and lives display
- Canvas-based game area with coin rendering
- Slash trail visualization
- Pause/resume functionality

### ResultsScreen  
- Final score and statistics
- Accuracy percentage calculation
- New best score detection and celebration
- Play again and main menu options

## Custom Hooks

### useGameState
Manages core game state including:
- Current screen (start/game/results)
- Score, lives, and statistics
- Game running and pause states
- Local storage integration

### useGameLoop
Handles game rendering and updates:
- Coin spawning with weighted randomization
- Physics simulation (falling, rotation)
- Canvas rendering with effects
- 60fps game loop management

### useSlashDetection
Processes user input for slashing:
- Mouse and touch event handling
- Line-to-circle collision detection
- Slash trail visualization
- Particle effect triggering

## Item Types

The game features 2 different item types with weighted spawning:

| Item | Symbol | Color | Points | Spawn Weight | Effect |
|------|---------|-------|--------|--------------|--------|
| Aptos Token | APT | Black/White | +10 | 90% | Score increase |
| Bomb | 💣 | Dark Gray | 0 | 10% | Lose life |

## Controls

- **Desktop**: Click and drag to slash tokens
- **Mobile**: Touch and drag to slash tokens
- **Pause**: Click pause button during gameplay
- **Navigation**: Use on-screen buttons for menu navigation

## Performance

The React version maintains the original's performance with:
- Canvas rendering at 60fps
- Efficient particle system
- Optimized collision detection
- Memory-conscious component updates
- Smooth animations on all devices

## Browser Support

- Chrome 60+ (recommended)
- Firefox 60+
- Safari 12+
- Edge 79+
- Mobile browsers with canvas support

## Build

To create a production build:

```bash
npm run build
```

This creates a `build` folder with optimized assets ready for deployment.

## Original Features Preserved

Every aspect of the original game has been carefully preserved:

- **Visual Design**: Exact color scheme, typography, and layout
- **Animations**: Floating logos, particle effects, screen flashes
- **Game Feel**: Responsive controls, satisfying feedback
- **Scoring System**: Identical point values and statistics
- **Mobile Support**: Touch controls and responsive layout
- **Performance**: Smooth 60fps gameplay on all devices

The React architecture makes the code more maintainable while keeping the exact same user experience as the original vanilla JavaScript version.