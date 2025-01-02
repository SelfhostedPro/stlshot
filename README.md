# stlshot

A powerful 3D model viewer and screenshot capture tool built with Next.js, Three.js, and React Three Fiber. Stlshot allows you to view, manipulate, and capture high-quality screenshots of STL files from multiple angles.

## Features

- **3D Model Viewing**
  - Load and view multiple STL files simultaneously
  - Orthographic camera with customizable settings
  - Real-time model manipulation (rotation, zoom, pan)
  - Edge detection and outline rendering

- **Advanced Screenshot Capabilities**
  - Capture current view
  - Automated multi-angle captures (front, back, sides, corners)
  - Batch capture across all loaded models
  - Screenshot preview and management
  - Export screenshots as ZIP archives

- **Customizable Scene Settings**
  - Camera controls (FOV, zoom, position)
  - Canvas rendering options
  - Material and edge appearance
  - Scene component management

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. **Loading Models**
   - Click the "Upload File" button to load STL files
   - Multiple files can be loaded simultaneously
   - Models appear in the top preview panel

2. **Viewing Models**
   - Use mouse/touch controls to rotate and zoom
   - Switch between loaded models using the model selector
   - Customize view settings in the scene manager

3. **Taking Screenshots**
   - Single View: Capture the current camera angle
   - All Views: Automatically capture from preset angles
   - All Models: Batch capture all angles for all loaded models
   - Access screenshots in the sidebar gallery
   - Export all screenshots as a ZIP file

## Technical Stack

- **Framework**: Next.js 15.1
- **3D Rendering**: Three.js, React Three Fiber
- **State Management**: Zustand
- **Storage**: IndexedDB for model and screenshot data
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS

## License

[MIT License](LICENSE)