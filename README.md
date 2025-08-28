# 3D Chair Configurator

A professional 3D chair customization tool built with React, Three.js, and React Three Fiber. This application allows users to customize chair parts with different materials and textures in real-time.

## Features

- **Real-time 3D Visualization**: Interactive 3D model viewer with smooth camera controls
- **Material Customization**: Choose from 8 different premium materials with realistic textures
- **Part Selection**: Click on chair parts or use the control panel to select areas for customization
- **Auto-zoom**: Automatically zooms to selected parts for better visibility
- **Professional UI**: Clean, modern interface inspired by Seat Supply's design
- **Responsive Design**: Works on desktop and mobile devices
- **Texture Generation**: Procedurally generated textures for different material types

## Materials Available

- **Anchorage**: Pebbled-grain marine vinyl with subtle sheen
- **Leon**: Premium smooth vinyl with outstanding performance
- **Marlin**: High-performance faux leather with classic grain
- **Navy Blue**: Smooth vinyl in navy blue
- **Charcoal**: Pebbled-grain vinyl in charcoal
- **Cream**: Smooth vinyl in cream
- **Burgundy**: Faux leather in burgundy
- **Forest Green**: Pebbled-grain vinyl in forest green

## How to Use

1. **Select a Part**: Choose a chair part from the left panel or click directly on the 3D model
2. **Choose Material**: Select your preferred material from the available options
3. **Apply Changes**: Click on the 3D model to apply the selected material to the chosen part
4. **Auto-zoom**: The camera will automatically zoom to the selected part for better visibility
5. **Reset Options**: Use the reset buttons to clear materials or reset the camera view

## Technology Stack

- **React 19**: Modern React with hooks and functional components
- **Three.js**: 3D graphics library for WebGL rendering
- **React Three Fiber**: React renderer for Three.js
- **React Three Drei**: Useful helpers for React Three Fiber
- **Vite**: Fast build tool and development server

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd new-chair-configurator
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

## Project Structure

```
new-chair-configurator/
├── public/
│   └── chair1_glb/
│       └── chair1.glb          # 3D model file
├── src/
│   ├── App.jsx                 # Main application component
│   ├── App.css                 # Styles for the application
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global styles
├── package.json                # Project dependencies and scripts
└── README.md                   # Project documentation
```

## Key Components

### App.jsx
- Main application component with state management
- Material and part selection logic
- 3D scene setup and camera controls

### Chair Component
- Loads and renders the GLB model
- Handles material application
- Manages part selection and highlighting

### CameraController
- Handles camera zooming to selected parts
- Smooth camera animations
- Orbit controls for model navigation

### MaterialPreview
- Displays material swatches with textures
- Handles material selection
- Shows material information

## Customization

### Adding New Materials
To add new materials, modify the `availableMaterials` array in `App.jsx`:

```javascript
{
  name: 'New Material',
  color: new THREE.Color('#hexcolor'),
  type: 'smooth', // 'smooth', 'pebbled', or 'leather'
  texture: null
}
```

### Modifying Textures
The texture generation function in `App.jsx` can be customized to create different texture patterns for each material type.

### Adding New Models
Replace the `chair1.glb` file in the `public/chair1_glb/` directory with your own 3D model. The application will automatically detect and list all mesh parts in the model.

## Performance Optimizations

- **Suspense**: Used for loading states and error boundaries
- **Texture Caching**: Generated textures are cached and reused
- **Efficient Rendering**: Only updates materials when necessary
- **Smooth Animations**: Optimized camera movements and transitions

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is open source and available under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions, please open an issue on the project repository.
