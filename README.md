# 3D Scene Editor

A modern, interactive 3D scene editor built with React Three Fiber and TypeScript. Create, manipulate, and design 3D scenes with an intuitive interface.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSahanpw11%2F3d_scene_editor&project-name=3d-scene-editor&repository-name=3d_scene_editor)

## Features

### 🎯 Core Functionality
- **Object Creation**: Add 3D primitives (cubes and spheres)
- **Transform Controls**: Translate, rotate, and scale objects with visual gizmos
- **Multi-Selection**: Select multiple objects with Ctrl+click for bulk operations
- **Precision Input**: Numeric input fields for exact positioning and scaling

### 🎨 Visual Features
- **Material System**: Customize object colors, roughness, metalness, and emissive properties
- **Lighting**: Professional lighting setup with shadows and environment mapping
- **Grid System**: Snap-to-grid functionality for precise positioning
- **Theme Support**: Light and dark mode with persistent preferences

### ⚡ Advanced Tools
- **Undo/Redo**: Full history system with Ctrl+Z/Ctrl+Y support
- **Save/Load**: Export and import scenes as JSON files
- **Command Palette**: Quick access to all functions with Ctrl+K
- **Real-time Stats**: Performance monitoring and object count display

### 🎛️ User Interface
- **Modern Design**: Clean, professional interface with smooth animations
- **Responsive Layout**: Sidebar panels with organized tool sections
- **Keyboard Shortcuts**: Efficient workflow with comprehensive hotkeys
- **Notifications**: Minimal, non-intrusive feedback system

## Technology Stack

- **React 19** - Modern React with latest features
- **TypeScript** - Full type safety and IntelliSense
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers and abstractions
- **Vite** - Fast build tool and development server

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Sahanpw11/3d_scene_editor.git
cd 3d_scene_editor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be available in the `dist` directory.

## Usage

### Basic Operations

1. **Adding Objects**: Use the toolbar to add cubes or spheres to the scene
2. **Selecting Objects**: Click on objects to select them, or use Ctrl+click for multi-selection
3. **Transforming Objects**: 
   - Press `G` for translate mode
   - Press `R` for rotate mode
   - Press `S` for scale mode
   - Use the precision input panel for exact values

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+K` | Open command palette |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `G` | Translate mode |
| `R` | Rotate mode |
| `S` | Scale mode |
| `Delete` | Delete selected objects |
| `Ctrl+D` | Duplicate selected objects |

### Scene Management

- **Save Scene**: Use the save button to download your scene as a JSON file
- **Load Scene**: Import previously saved scenes using the load button
- **Clear Scene**: Remove all objects from the current scene

## Project Structure

```
src/
├── components/           # React components
│   ├── Scene/           # 3D scene components
│   ├── UI/              # User interface components
│   └── Controls/        # 3D interaction controls
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── App.tsx              # Main application component
```

### Component Architecture

- **Modular Design**: Each component has a single responsibility
- **Type Safety**: Full TypeScript coverage with strict typing
- **State Management**: Clean React state with custom hooks
- **Performance**: Optimized rendering with React.memo and useCallback

## Development

### Code Quality

The project follows strict TypeScript and React best practices:

- **Type Safety**: All components and functions are fully typed
- **ESLint**: Configured with React and TypeScript rules
- **Modular Structure**: Clear separation of concerns
- **Clean State Management**: Local React state with custom hooks

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Type checking
npm run type-check
```

### Adding New Features

1. Create components in the appropriate directory
2. Define TypeScript interfaces in `src/types/`
3. Add custom hooks in `src/hooks/` for stateful logic
4. Update the main App component to integrate new features

## Contributing

1. Follow the existing code style and TypeScript patterns
2. Ensure all new features are properly typed
3. Test thoroughly before submitting changes
4. Update documentation for new features


