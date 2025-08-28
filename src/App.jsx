import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

// Generate texture patterns with more sophisticated options
const generateTexture = (type, color, pattern = 'none', stitching = 'none') => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 512, 512);

  if (type === 'pebbled') {
    // Add pebbled texture
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 3 + 1;
      const alpha = Math.random() * 0.4 + 0.1;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }
  } else if (type === 'leather') {
    // Add leather texture with wrinkles
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const width = Math.random() * 30 + 15;
      const height = Math.random() * 40 + 20;
      
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.15})`;
      ctx.fillRect(x, y, width, height);
    }
    
    // Add leather grain
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const length = Math.random() * 100 + 50;
      const width = Math.random() * 2 + 1;
      
      ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + length, y + Math.random() * 20 - 10);
      ctx.stroke();
    }
  } else if (type === 'smooth') {
    // Add subtle noise for smooth texture
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const alpha = Math.random() * 0.08;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Add pattern overlays
  if (pattern === 'diamond') {
    ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
    ctx.lineWidth = 2;
    const size = 40;
    for (let x = 0; x < 512; x += size) {
      for (let y = 0; y < 512; y += size) {
        ctx.beginPath();
        ctx.moveTo(x + size/2, y);
        ctx.lineTo(x + size, y + size/2);
        ctx.lineTo(x + size/2, y + size);
        ctx.lineTo(x, y + size/2);
        ctx.closePath();
        ctx.stroke();
      }
    }
  } else if (pattern === 'quilted') {
    ctx.strokeStyle = `rgba(255, 255, 255, 0.4)`;
    ctx.lineWidth = 1;
    const size = 30;
    for (let x = 0; x < 512; x += size) {
      for (let y = 0; y < 512; y += size) {
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  } else if (pattern === 'perforated') {
    ctx.fillStyle = `rgba(0, 0, 0, 0.2)`;
    const size = 8;
    for (let x = size; x < 512; x += size * 2) {
      for (let y = size; y < 512; y += size * 2) {
        ctx.beginPath();
        ctx.arc(x, y, size/2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Add stitching patterns
  if (stitching === 'straight') {
    ctx.strokeStyle = `rgba(0, 0, 0, 0.6)`;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    for (let y = 20; y < 512; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
  } else if (stitching === 'cross') {
    ctx.strokeStyle = `rgba(0, 0, 0, 0.6)`;
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    for (let x = 20; x < 512; x += 40) {
      for (let y = 20; y < 512; y += 40) {
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 10);
        ctx.lineTo(x + 10, y + 10);
        ctx.moveTo(x + 10, y - 10);
        ctx.lineTo(x - 10, y + 10);
        ctx.stroke();
      }
    }
  } else if (stitching === 'zigzag') {
    ctx.strokeStyle = `rgba(0, 0, 0, 0.6)`;
    ctx.lineWidth = 2;
    for (let y = 20; y < 512; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < 512; x += 20) {
        ctx.lineTo(x + 10, y + 10);
        ctx.lineTo(x + 20, y);
      }
      ctx.stroke();
    }
  }

  return canvas.toDataURL();
};

// Loading component
function Loader() {
  return (
    <Html center>
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading 3D Model...</p>
      </div>
    </Html>
  );
}

// Error boundary component
function ErrorFallback({ error }) {
  return (
    <Html center>
      <div className="error">
        <h3>Something went wrong</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    </Html>
  );
}

// Chair component that loads the GLB model
function Chair({ materials, selectedPart, onPartClick, onModelLoad }) {
  const { scene } = useGLTF('/chair1_glb/chair1.glb');
  const chairRef = useRef();
  const [modelParts, setModelParts] = useState([]);
  const [error, setError] = useState(null);

  // Analyze model structure when it loads
  useEffect(() => {
    try {
      if (scene && onModelLoad) {
        const parts = [];
        scene.traverse((child) => {
          if (child.isMesh) {
            // Store original material for reference
            if (!child.userData.originalMaterial) {
              child.userData.originalMaterial = child.material.clone();
            }
            
            // Add to parts list
            parts.push({
              name: child.name,
              mesh: child,
              boundingBox: new THREE.Box3().setFromObject(child)
            });
            
            // Add click handler
            child.userData.partName = child.name;
            child.userData.clickable = true;
          }
        });
        
        setModelParts(parts);
        onModelLoad(parts);
      }
    } catch (err) {
      setError(err);
      console.error('Error loading model:', err);
    }
  }, [scene, onModelLoad]);

  // Apply materials to the model
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          // Apply custom material if available for this part
          const partName = child.name.toLowerCase();
          if (materials[partName]) {
            child.material = materials[partName];
          }
        }
      });
    }
  }, [scene, materials]);

  // Handle part selection and zoom
  const handlePartClick = (event) => {
    event.stopPropagation();
    const partName = event.object.userData.partName;
    if (partName && onPartClick) {
      onPartClick(partName, event.object);
    }
  };

  // Highlight selected part
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          if (child.name === selectedPart) {
            child.material.emissive = new THREE.Color(0x333333);
            child.material.emissiveIntensity = 0.2;
          } else {
            child.material.emissive = new THREE.Color(0x000000);
            child.material.emissiveIntensity = 0;
          }
        }
      });
    }
  }, [selectedPart, scene]);

  if (error) {
    return <ErrorFallback error={error} />;
  }

  return (
    <primitive 
      ref={chairRef}
      object={scene} 
      onClick={handlePartClick}
      scale={[1.8, 1.8, 1.8]}
      position={[0, -0.3, 0]}
    />
  );
}

// Camera controller for zooming to parts
function CameraController({ selectedPart, modelParts, isZoomed, onZoomChange }) {
  const controlsRef = useRef();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (selectedPart && modelParts.length > 0 && !isAnimating) {
      const part = modelParts.find(p => p.name === selectedPart);
      if (part && controlsRef.current) {
        setIsAnimating(true);
        
        // Calculate target position (center of the part)
        const boundingBox = part.boundingBox;
        const center = boundingBox.getCenter(new THREE.Vector3());
        
        // Calculate distance based on part size - much closer for detail view
        const size = boundingBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const distance = maxDim * 1.2; // Much closer zoom for better detail
        
        // Animate camera to part
        controlsRef.current.target.copy(center);
        controlsRef.current.update();
        
        // Smooth camera movement
        const camera = controlsRef.current.object;
        const startPosition = camera.position.clone();
        const endPosition = center.clone().add(
          new THREE.Vector3(distance, distance * 0.2, distance)
        );
        
        let progress = 0;
        const animate = () => {
          progress += 0.04;
          if (progress <= 1) {
            camera.position.lerpVectors(startPosition, endPosition, progress);
            controlsRef.current.update();
            requestAnimationFrame(animate);
          } else {
            setIsAnimating(false);
            onZoomChange(true);
          }
        };
        animate();
      }
    }
  }, [selectedPart, modelParts, isAnimating, onZoomChange]);

  // Only reset zoom when explicitly requested via resetZoom button
  useEffect(() => {
    if (!isZoomed && controlsRef.current && !isAnimating) {
      setIsAnimating(true);
      const camera = controlsRef.current.object;
      const startPosition = camera.position.clone();
      const endPosition = new THREE.Vector3(4, 2.5, 4);
      const startTarget = controlsRef.current.target.clone();
      const endTarget = new THREE.Vector3(0, 0, 0);
      
      let progress = 0;
      const animate = () => {
        progress += 0.03;
        if (progress <= 1) {
          camera.position.lerpVectors(startPosition, endPosition, progress);
          controlsRef.current.target.lerpVectors(startTarget, endTarget, progress);
          controlsRef.current.update();
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };
      animate();
    }
  }, [isZoomed, isAnimating]);

  return (
    <OrbitControls 
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={0.8}
      maxDistance={isZoomed ? 5 : 12}
      dampingFactor={0.05}
      enableDamping={true}
      rotateSpeed={1.0}
      panSpeed={1.0}
      zoomSpeed={1.0}
      enableKeys={true}
      keyPanSpeed={7.0}
      screenSpacePanning={true}
      maxPolarAngle={Math.PI}
      minPolarAngle={0}
    />
  );
}

// Material preview component
function MaterialPreview({ material, name, isSelected, onClick }) {
  return (
    <div 
      className={`material-preview ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div 
        className="material-swatch"
        style={{ 
          backgroundImage: material.texture ? `url(${material.texture})` : 'none',
          backgroundColor: material.color ? `#${material.color.getHexString()}` : '#888888'
        }}
      />
      <span className="material-name">{name}</span>
    </div>
  );
}

// Pattern preview component
function PatternPreview({ pattern, name, isSelected, onClick }) {
  return (
    <div 
      className={`pattern-preview ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div 
        className="pattern-swatch"
        style={{ 
          backgroundImage: pattern.texture ? `url(${pattern.texture})` : 'none',
          backgroundColor: '#f8fafc'
        }}
      />
      <span className="pattern-name">{name}</span>
    </div>
  );
}

// Main App component
function App() {
  const [selectedPart, setSelectedPart] = useState(null);
  const [materials, setMaterials] = useState({});
  const [availableParts, setAvailableParts] = useState([]);
  const [modelParts, setModelParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [availableMaterials, setAvailableMaterials] = useState([
    { 
      name: 'Anchorage', 
      color: new THREE.Color('#2c3e50'), 
      type: 'pebbled', 
      texture: null 
    },
    { 
      name: 'Leon', 
      color: new THREE.Color('#34495e'), 
      type: 'smooth', 
      texture: null 
    },
    { 
      name: 'Marlin', 
      color: new THREE.Color('#7f8c8d'), 
      type: 'leather', 
      texture: null 
    },
    { 
      name: 'Navy Blue', 
      color: new THREE.Color('#1e3a8a'), 
      type: 'smooth', 
      texture: null 
    },
    { 
      name: 'Charcoal', 
      color: new THREE.Color('#374151'), 
      type: 'pebbled', 
      texture: null 
    },
    { 
      name: 'Cream', 
      color: new THREE.Color('#fef3c7'), 
      type: 'smooth', 
      texture: null 
    },
    { 
      name: 'Burgundy', 
      color: new THREE.Color('#7c2d12'), 
      type: 'leather', 
      texture: null 
    },
    { 
      name: 'Forest Green', 
      color: new THREE.Color('#166534'), 
      type: 'pebbled', 
      texture: null 
    }
  ]);
  const [selectedMaterial, setSelectedMaterial] = useState(availableMaterials[0]);
  
  const [availablePatterns] = useState([
    { name: 'None', type: 'none', texture: null },
    { name: 'Diamond', type: 'diamond', texture: null },
    { name: 'Quilted', type: 'quilted', texture: null },
    { name: 'Perforated', type: 'perforated', texture: null }
  ]);
  const [selectedPattern, setSelectedPattern] = useState(availablePatterns[0]);
  
  const [availableStitching] = useState([
    { name: 'None', type: 'none' },
    { name: 'Straight', type: 'straight' },
    { name: 'Cross', type: 'cross' },
    { name: 'Zigzag', type: 'zigzag' }
  ]);
  const [selectedStitching, setSelectedStitching] = useState(availableStitching[0]);

  // Generate textures for materials
  useEffect(() => {
    const materialsWithTextures = availableMaterials.map(material => ({
      ...material,
      texture: generateTexture(material.type, `#${material.color.getHexString()}`, selectedPattern.type, selectedStitching.type)
    }));
    setAvailableMaterials(materialsWithTextures);
    setSelectedMaterial(materialsWithTextures[0]);
  }, [selectedPattern, selectedStitching]);

  // Handle model load
  const handleModelLoad = (parts) => {
    setModelParts(parts);
    // Extract part names for the UI
    const partNames = parts.map(part => part.name);
    setAvailableParts(partNames);
    setIsLoading(false);
  };

  // Apply material to selected part
  const applyMaterial = (partName, material) => {
    try {
      const textureLoader = new THREE.TextureLoader();
      const texture = material.texture ? textureLoader.load(material.texture) : null;
      
      if (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
      }

      const newMaterial = new THREE.MeshStandardMaterial({
        color: material.color,
        roughness: material.type === 'leather' ? 0.3 : material.type === 'pebbled' ? 0.8 : 0.6,
        metalness: 0.1,
        map: texture
      });

      setMaterials(prev => ({
        ...prev,
        [partName.toLowerCase()]: newMaterial
      }));
    } catch (error) {
      console.error('Error applying material:', error);
    }
  };

  // Handle part selection
  const handlePartClick = (partName, mesh) => {
    setSelectedPart(partName);
    // Don't automatically apply material - just zoom to the part
  };

  // Handle material selection
  const handleMaterialSelect = (material) => {
    setSelectedMaterial(material);
    
    // Apply to currently selected part only if a part is selected
    if (selectedPart) {
      applyMaterial(selectedPart, material);
    }
  };

  // Handle pattern selection
  const handlePatternSelect = (pattern) => {
    setSelectedPattern(pattern);
    
    // Regenerate textures with new pattern
    const materialsWithTextures = availableMaterials.map(material => ({
      ...material,
      texture: generateTexture(material.type, `#${material.color.getHexString()}`, pattern.type, selectedStitching.type)
    }));
    setAvailableMaterials(materialsWithTextures);
    
    // Apply to currently selected part only if a part is selected
    if (selectedPart && selectedMaterial) {
      const updatedMaterial = materialsWithTextures.find(m => m.name === selectedMaterial.name);
      if (updatedMaterial) {
        setSelectedMaterial(updatedMaterial);
        applyMaterial(selectedPart, updatedMaterial);
      }
    }
  };

  // Handle stitching selection
  const handleStitchingSelect = (stitching) => {
    setSelectedStitching(stitching);
    
    // Regenerate textures with new stitching
    const materialsWithTextures = availableMaterials.map(material => ({
      ...material,
      texture: generateTexture(material.type, `#${material.color.getHexString()}`, selectedPattern.type, stitching.type)
    }));
    setAvailableMaterials(materialsWithTextures);
    
    // Apply to currently selected part only if a part is selected
    if (selectedPart && selectedMaterial) {
      const updatedMaterial = materialsWithTextures.find(m => m.name === selectedMaterial.name);
      if (updatedMaterial) {
        setSelectedMaterial(updatedMaterial);
        applyMaterial(selectedPart, updatedMaterial);
      }
    }
  };

  // Reset view - clear selection but keep zoom
  const resetView = () => {
    setSelectedPart(null);
    // Don't reset zoom - let user control it manually
  };

  // Reset zoom only - return to full chair view
  const resetZoom = () => {
    setIsZoomed(false);
  };

  // Reset materials - clear materials but keep selection and zoom
  const resetMaterials = () => {
    setMaterials({});
    // Don't reset selection or zoom - let user control them
  };

  // Reset everything - complete reset
  const resetAll = () => {
    setMaterials({});
    setSelectedPart(null);
    setIsZoomed(false);
    setSelectedMaterial(availableMaterials[0]);
    setSelectedPattern(availablePatterns[0]);
    setSelectedStitching(availableStitching[0]);
  };

  return (
    <div className="configurator">
      {/* Left Panel - Controls */}
      <div className="controls-panel">
        <div className="header">
          <h1>Chair Configurator</h1>
          <p>Customize your chair with premium materials</p>
        </div>

        {/* Part Selection */}
        <div className="section">
          <h3>Select Part to Customize</h3>
          {selectedPart && (
            <div className="selected-part-indicator">
              <span>Currently selected: <strong>{selectedPart.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong></span>
            </div>
          )}
          {isLoading ? (
            <div className="loading">Loading model parts...</div>
          ) : (
            <div className="parts-grid">
              {availableParts.map((part) => (
                <button
                  key={part}
                  className={`part-button ${selectedPart === part ? 'selected' : ''}`}
                  onClick={() => setSelectedPart(part)}
                >
                  {part.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Material Selection */}
        <div className="section">
          <h3>Choose Material</h3>
          <div className="materials-grid">
            {availableMaterials.map((material) => (
              <MaterialPreview
                key={material.name}
                material={material}
                name={material.name}
                isSelected={selectedMaterial.name === material.name}
                onClick={() => handleMaterialSelect(material)}
              />
            ))}
          </div>
        </div>

        {/* Pattern Selection */}
        <div className="section">
          <h3>Surface Pattern</h3>
          <div className="patterns-grid">
            {availablePatterns.map((pattern) => (
              <PatternPreview
                key={pattern.name}
                pattern={pattern}
                name={pattern.name}
                isSelected={selectedPattern.name === pattern.name}
                onClick={() => handlePatternSelect(pattern)}
              />
            ))}
          </div>
        </div>

        {/* Stitching Selection */}
        <div className="section">
          <h3>Stitching Style</h3>
          <div className="stitching-grid">
            {availableStitching.map((stitching) => (
              <button
                key={stitching.name}
                className={`stitching-button ${selectedStitching.name === stitching.name ? 'selected' : ''}`}
                onClick={() => handleStitchingSelect(stitching)}
              >
                {stitching.name}
              </button>
            ))}
          </div>
        </div>

        {/* Material Info */}
        <div className="section">
          <h3>Material Information</h3>
          <div className="material-info">
            <h4>{selectedMaterial.name}</h4>
            <p>
              {selectedMaterial.type === 'pebbled' && 'Pebbled-grain marine vinyl with subtle sheen'}
              {selectedMaterial.type === 'smooth' && 'Premium smooth vinyl with outstanding performance'}
              {selectedMaterial.type === 'leather' && 'High-performance faux leather with classic grain'}
            </p>
            <ul>
              <li>UV resistant</li>
              <li>Water repellent</li>
              <li>Easy to clean</li>
              <li>Made in USA</li>
            </ul>
          </div>
        </div>

        {/* Instructions */}
        <div className="section">
          <h3>How to Use</h3>
          <div className="instructions">
            <p>1. Click on any chair part to zoom in and select it</p>
            <p>2. Choose your preferred material from the left panel</p>
            <p>3. Select surface pattern and stitching style</p>
            <p>4. Materials will be applied to the selected part</p>
            <p>5. Use "Reset Zoom" to return to full chair view</p>
            <p>6. Use "Reset All" to clear all customizations</p>
            <p><strong>Camera Controls:</strong></p>
            <p>• Left click + drag to rotate</p>
            <p>• Right click + drag to pan</p>
            <p>• Scroll to zoom in/out</p>
          </div>
        </div>
      </div>

      {/* Right Panel - 3D Viewer */}
      <div className="viewer-panel">
        <Canvas
          camera={{ position: [4, 2.5, 4], fov: 75 }}
          style={{ 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            width: '100%',
            height: '100%'
          }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Suspense fallback={<Loader />}>
            <Chair 
              materials={materials}
              selectedPart={selectedPart}
              onPartClick={handlePartClick}
              onModelLoad={handleModelLoad}
            />
          </Suspense>
          
          <CameraController 
            selectedPart={selectedPart}
            modelParts={modelParts}
            isZoomed={isZoomed}
            onZoomChange={setIsZoomed}
          />
          
          <Environment preset="studio" />
        </Canvas>
        
        {/* Viewer Controls */}
        <div className="viewer-controls">
          <button onClick={resetView}>Reset View</button>
          <button onClick={resetZoom}>Reset Zoom</button>
          <button onClick={resetMaterials}>Reset Materials</button>
          <button onClick={resetAll}>Reset All</button>
        </div>
      </div>
    </div>
  );
}

export default App;
