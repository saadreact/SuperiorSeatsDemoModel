import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Text, Html, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

// Generate high-quality texture patterns with metallic support
const generateTexture = (type, color, pattern = 'none', stitching = 'none', isMetallic = false) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1024, 1024);

  if (type === 'pebbled') {
    // Enhanced pebbled texture
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const radius = Math.random() * 4 + 1;
      const alpha = Math.random() * 0.4 + 0.1;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
      
      // Add depth
      ctx.beginPath();
      ctx.arc(x + 1, y + 1, radius * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.3})`;
      ctx.fill();
    }
  } else if (type === 'leather') {
    // Enhanced leather texture with realistic grain
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const width = Math.random() * 40 + 20;
      const height = Math.random() * 50 + 25;
      
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
      ctx.fillRect(x, y, width, height);
    }
    
    // Add leather grain patterns
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const length = Math.random() * 120 + 60;
      const width = Math.random() * 3 + 1;
      
      ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.15})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + length, y + Math.random() * 30 - 15);
      ctx.stroke();
    }
  } else if (type === 'smooth') {
    // Enhanced smooth texture with subtle variations
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const alpha = Math.random() * 0.1;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }

  // Enhanced pattern overlays
  if (pattern === 'diamond') {
    // Dark strokes in multiply-like fashion for depth, with subtle highlights for shine
    const size = 60;
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.strokeStyle = `rgba(0, 0, 0, ${isMetallic ? 0.55 : 0.65})`;
    ctx.lineWidth = 2.5;
    for (let x = 0; x < 1024; x += size) {
      for (let y = 0; y < 1024; y += size) {
        ctx.beginPath();
        ctx.moveTo(x + size/2, y);
        ctx.lineTo(x + size, y + size/2);
        ctx.lineTo(x + size/2, y + size);
        ctx.lineTo(x, y + size/2);
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.restore();

    // Subtle inner highlight to simulate stitching catch-light
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = `rgba(255, 255, 255, ${isMetallic ? 0.18 : 0.12})`;
    ctx.lineWidth = 1;
    const inner = size * 0.6;
    const off = (size - inner) / 2;
    for (let x = 0; x < 1024; x += size) {
      for (let y = 0; y < 1024; y += size) {
        ctx.beginPath();
        ctx.moveTo(x + off + inner/2, y + off);
        ctx.lineTo(x + off + inner, y + off + inner/2);
        ctx.lineTo(x + off + inner/2, y + off + inner);
        ctx.lineTo(x + off, y + off + inner/2);
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.restore();
  } else if (pattern === 'quilted') {
    ctx.strokeStyle = isMetallic ? `rgba(255, 255, 255, 0.5)` : `rgba(255, 255, 255, 0.4)`;
    ctx.lineWidth = 2;
    const size = 45;
    for (let x = 0; x < 1024; x += size) {
      for (let y = 0; y < 1024; y += size) {
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2.5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Add inner circle
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/4, 0, Math.PI * 2);
        ctx.strokeStyle = isMetallic ? `rgba(255, 255, 255, 0.2)` : `rgba(255, 255, 255, 0.15)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  } else if (pattern === 'perforated') {
    ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
    const size = 12;
    for (let x = size; x < 1024; x += size * 2) {
      for (let y = size; y < 1024; y += size * 2) {
        ctx.beginPath();
        ctx.arc(x, y, size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add highlight for realism
        if (isMetallic) {
          ctx.beginPath();
          ctx.arc(x - 1, y - 1, size/3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, 0.4)`;
          ctx.fill();
          ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
        }
      }
    }
  }

  // Enhanced stitching patterns
  if (stitching === 'straight') {
    ctx.strokeStyle = `rgba(0, 0, 0, 0.7)`;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    for (let y = 30; y < 1024; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }
  } else if (stitching === 'cross') {
    ctx.strokeStyle = `rgba(0, 0, 0, 0.7)`;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    for (let x = 30; x < 1024; x += 60) {
      for (let y = 30; y < 1024; y += 60) {
        ctx.beginPath();
        ctx.moveTo(x - 15, y - 15);
        ctx.lineTo(x + 15, y + 15);
        ctx.moveTo(x + 15, y - 15);
        ctx.lineTo(x - 15, y + 15);
        ctx.stroke();
      }
    }
  } else if (stitching === 'zigzag') {
    ctx.strokeStyle = `rgba(0, 0, 0, 0.7)`;
    ctx.lineWidth = 3;
    for (let y = 30; y < 1024; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < 1024; x += 30) {
        ctx.lineTo(x + 15, y + 15);
        ctx.lineTo(x + 30, y);
      }
      ctx.stroke();
    }
  }

  return canvas.toDataURL();
};

// Auto-rotating group component
// function AutoRotatingChair({ children, isAutoRotating = true }) {
//   const groupRef = useRef();
//   
//   useFrame((state, delta) => {
//     if (groupRef.current && isAutoRotating) {
//       groupRef.current.rotation.y += delta * 0.2; // Slow rotation
//     }
//   });
//   
//   return <group ref={groupRef}>{children}</group>;
// }

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
function Chair({ materials, selectedPart, onPartClick, onModelLoad, isAutoRotating }) {
  const { scene } = useGLTF('/chair1_glb/chair1.glb');
  const chairRef = useRef();
  const [modelParts, setModelParts] = useState([]);
  const [error, setError] = useState(null);

  // Analyze model structure when it loads
  useEffect(() => {
    try {
      if (scene && onModelLoad) {
        // Apply transform directly to the scene so bounds are correct
        scene.position.set(0, -1.5, 0);
        scene.scale.set(2.2, 2.2, 2.2);
        scene.updateMatrixWorld(true);

        const parts = [];
        scene.traverse((child) => {
          if (child.isMesh) {
            // Store original material for reference
            if (!child.userData.originalMaterial) {
              child.userData.originalMaterial = child.material.clone();
            }
            // Also store base maps/colors so we can toggle patterns without changing material
            if (!child.userData.baseMapStored) {
              child.userData.baseColorHex = `#${child.material.color.getHexString()}`;
              child.userData.baseMap = child.material.map || null;
              child.userData.baseMapStored = true;
            }
            
            // Enhance material properties for realism
            if (child.material) {
              child.material.envMapIntensity = 1.5;
              child.material.roughness = 0.3;
              child.material.metalness = 0.1;
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
        
        // Compute overall bounds for camera fitting (after transform)
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const sphere = box.getBoundingSphere(new THREE.Sphere());
        const radius = sphere.radius || box.getSize(new THREE.Vector3()).length() * 0.5;
        
        setModelParts(parts);
        onModelLoad(parts, { center, radius });
      }
    } catch (err) {
      setError(err);
      console.error('Error loading model:', err);
    }
  }, [scene, onModelLoad]);

  // Apply materials to the model with enhanced properties
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          // Apply custom material if available for this part
          const partName = child.name.toLowerCase();
          if (materials[partName]) {
            child.material = materials[partName];
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [scene, materials]);

  // Handle part selection
  const handlePartClick = (event) => {
    event.stopPropagation();
    const partName = event.object.userData.partName;
    if (partName && onPartClick) {
      onPartClick(partName, event.object);
    }
  };

  // Highlight selected part with enhanced glow
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          if (child.name === selectedPart) {
            child.material.emissive = new THREE.Color(0x444444);
            child.material.emissiveIntensity = 0.3;
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
    />
  );
}

// Enhanced camera controller
function CameraController({ selectedPart, modelParts, isZoomed, onZoomChange, bounds, zoomOnClickEnabled, isAutoRotating }) {
  const controlsRef = useRef();
  const [isAnimating, setIsAnimating] = useState(false);
  const hasFittedRef = useRef(false);

  // Fit camera to whole model using bounds
  const fitToBounds = () => {
    if (!bounds || !controlsRef.current) return;
    const camera = controlsRef.current.object;
    const target = bounds.center.clone();
    const radius = bounds.radius;
    const fov = (camera.fov * Math.PI) / 180;
    const distance = radius / Math.tan(fov / 2) + radius * 0.5; // comfortable padding

    controlsRef.current.target.copy(target);
    controlsRef.current.update();

    const start = camera.position.clone();
    const end = target.clone().add(new THREE.Vector3(distance, distance * 0.25, distance));
    let t = 0;
    const animate = () => {
      t += 0.04;
      if (t <= 1) {
        camera.position.lerpVectors(start, end, t);
        controlsRef.current.update();
        requestAnimationFrame(animate);
      }
    };
    animate();
  };

  // Initial fit
  useEffect(() => {
    if (bounds && !hasFittedRef.current) {
      hasFittedRef.current = true;
      fitToBounds();
    }
  }, [bounds]);

  // Focus on selected part (zoom in), but only if zoomOnClickEnabled is true
  useEffect(() => {
    if (!zoomOnClickEnabled) return;
    if (selectedPart && modelParts.length > 0 && controlsRef.current) {
      const part = modelParts.find(p => p.name === selectedPart);
      if (!part) return;
      setIsAnimating(true);
      const boundingBox = part.boundingBox;
      const center = boundingBox.getCenter(new THREE.Vector3());
      const size = boundingBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      const camera = controlsRef.current.object;
      const fov = (camera.fov * Math.PI) / 180;
      const distance = (maxDim * 0.55) / Math.tan(fov / 2);

      controlsRef.current.target.copy(center);
      controlsRef.current.update();

      const startPosition = camera.position.clone();
      const endPosition = center.clone().add(new THREE.Vector3(distance, distance * 0.15, distance));
      let progress = 0;
      const animate = () => {
        progress += 0.05;
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
  }, [selectedPart, modelParts, onZoomChange, zoomOnClickEnabled]);

  // Reset zoom fits back to full model
  useEffect(() => {
    if (!isZoomed) {
      fitToBounds();
    }
  }, [isZoomed]);

  return (
    <OrbitControls 
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={0.2}
      maxDistance={50} // never restrict zooming out
      dampingFactor={0.05}
      enableDamping={true}
      rotateSpeed={0.9}
      panSpeed={0.9}
      zoomSpeed={1.1}
      enableKeys={true}
      keyPanSpeed={7.0}
      screenSpacePanning={true}
      maxPolarAngle={Math.PI - 0.05}
      minPolarAngle={0.05}
      autoRotate={isAutoRotating}
      autoRotateSpeed={0.2}
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

// PBR texture set cache loader (uses assets from 'Modeller new')
const pbrCache = {};
const getPBRUrls = (setId) => {
  const dir = setId === '02' ? '../../Modeller new/textures/02/' : '../../Modeller new/textures/01/';
  return {
    color: new URL(`${dir}01 - Default_Base_color.jpg`, import.meta.url).href,
    normal: new URL(`${dir}01 - Default_Normal_OpenGL.jpg`, import.meta.url).href,
    roughness: new URL(`${dir}01 - Default_Roughness.jpg`, import.meta.url).href,
    metalness: new URL(`${dir}01 - Default_Metallic.jpg`, import.meta.url).href,
    ao: new URL(`${dir}01 - Default_Mixed_AO.jpg`, import.meta.url).href,
  };
};
const loadPBRSet = (setId) => {
  if (pbrCache[setId]) return pbrCache[setId];
  const loader = new THREE.TextureLoader();
  const urls = getPBRUrls(setId);
  const tColor = loader.load(urls.color);
  tColor.colorSpace = THREE.SRGBColorSpace;
  const tNormal = loader.load(urls.normal);
  const tRough = loader.load(urls.roughness);
  const tMetal = loader.load(urls.metalness);
  const tAO = loader.load(urls.ao);
  [tColor, tNormal, tRough, tMetal, tAO].forEach(t => {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 1);
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
  });
  pbrCache[setId] = { map: tColor, normalMap: tNormal, roughnessMap: tRough, metalnessMap: tMetal, aoMap: tAO };
  return pbrCache[setId];
};

// Apply PBR texture set to a specific mesh material (non-destructive to other properties)
const applyPBRSetToPart = (partName, setId, modelParts, materials, setMaterials) => {
  const lower = partName.toLowerCase();
  const part = modelParts.find(p => p.name.toLowerCase() === lower);
  if (!part || !part.mesh) return;

  // Helper to clone-and-apply to one mesh name
  const applyToMesh = (mesh, keyName) => {
    const current = materials[keyName] || mesh.material;
    const updated = current.clone();
    if (setId === 'none') {
      updated.map = mesh.userData.baseMap || null;
      updated.normalMap = null;
      updated.roughnessMap = null;
      updated.metalnessMap = null;
      updated.aoMap = null;
      updated.color = new THREE.Color(mesh.userData.baseColorHex || `#${current.color.getHexString()}`);
    } else {
      const maps = loadPBRSet(setId) || loadPBRSet('01');
      updated.color = new THREE.Color('#ffffff');
      updated.map = maps.map;
      updated.normalMap = maps.normalMap;
      updated.roughnessMap = maps.roughnessMap;
      updated.metalnessMap = maps.metalnessMap;
      updated.aoMap = maps.aoMap;
      updated.roughness = 0.5;
      updated.metalness = 0.4;
    }
    updated.needsUpdate = true;
    setMaterials(prev => ({ ...prev, [keyName]: updated }));
  };

  // Apply to the clicked mesh and any siblings that share its name stem (covers multi-piece headrests)
  const stem = part.mesh.name.toLowerCase().split(/[^a-z0-9]+/)[0];
  modelParts.forEach(p => {
    const key = p.name.toLowerCase();
    if (key.includes(stem)) {
      applyToMesh(p.mesh, key);
    }
  });
};

// Main App component
function App() {
  const [selectedPart, setSelectedPart] = useState(null);
  const [materials, setMaterials] = useState({});
  const [availableParts, setAvailableParts] = useState([]);
  const [modelParts, setModelParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [clickToZoomEnabled, setClickToZoomEnabled] = useState(true);
  const [modelBounds, setModelBounds] = useState(null);
  
  const [availableMaterials, setAvailableMaterials] = useState([
    { 
      name: 'Anchorage', 
      color: new THREE.Color('#2c3e50'), 
      type: 'pebbled', 
      texture: null,
      metallic: false
    },
    { 
      name: 'Leon Premium', 
      color: new THREE.Color('#34495e'), 
      type: 'smooth', 
      texture: null,
      metallic: true
    },
    { 
      name: 'Marlin Leather', 
      color: new THREE.Color('#7f8c8d'), 
      type: 'leather', 
      texture: null,
      metallic: false
    },
    { 
      name: 'Navy Blue', 
      color: new THREE.Color('#1e3a8a'), 
      type: 'smooth', 
      texture: null,
      metallic: false
    },
    { 
      name: 'Charcoal Metallic', 
      color: new THREE.Color('#374151'), 
      type: 'pebbled', 
      texture: null,
      metallic: true
    },
    { 
      name: 'Cream', 
      color: new THREE.Color('#fef3c7'), 
      type: 'smooth', 
      texture: null,
      metallic: false
    },
    { 
      name: 'Burgundy', 
      color: new THREE.Color('#7c2d12'), 
      type: 'leather', 
      texture: null,
      metallic: false
    },
    { 
      name: 'Forest Green', 
      color: new THREE.Color('#166534'), 
      type: 'pebbled', 
      texture: null,
      metallic: false
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

  // Generate textures for materials with metallic support
  useEffect(() => {
    const materialsWithTextures = availableMaterials.map(material => ({
      ...material,
      texture: generateTexture(
        material.type, 
        `#${material.color.getHexString()}`, 
        selectedPattern.type, 
        selectedStitching.type,
        material.metallic
      )
    }));
    setAvailableMaterials(materialsWithTextures);
    setSelectedMaterial(materialsWithTextures[0]);
  }, [selectedPattern, selectedStitching]);

  // Handle model load
  const handleModelLoad = (parts, bounds) => {
    setModelParts(parts);
    const partNames = parts.map(part => part.name);
    setAvailableParts(partNames);
    setModelBounds(bounds);
    setIsLoading(false);
  };

  // Compute a good camera distance from bounds and fov
  const getFitDistance = (radius, fovDeg = 60) => {
    const fov = (fovDeg * Math.PI) / 180;
    return radius / Math.sin(fov / 2);
  };

  // Apply enhanced material to selected part
  const applyMaterial = (partName, material) => {
    try {
      const textureLoader = new THREE.TextureLoader();
      const colorMap = material.texture ? textureLoader.load(material.texture) : null;
      
      if (colorMap) {
        colorMap.wrapS = THREE.RepeatWrapping;
        colorMap.wrapT = THREE.RepeatWrapping;
        colorMap.repeat.set(3, 3);
        colorMap.generateMipmaps = true;
        colorMap.minFilter = THREE.LinearMipmapLinearFilter;
        colorMap.magFilter = THREE.LinearFilter;
      }

      // If a part already has a material with PBR maps, reuse them for realism
      let preservedMaps = {};
      const lower = partName.toLowerCase();
      const existing = modelParts.find(p => p.name.toLowerCase() === lower);
      if (existing && existing.mesh && existing.mesh.material) {
        const m = existing.mesh.material;
        preservedMaps = {
          normalMap: m.normalMap || null,
          roughnessMap: m.roughnessMap || null,
          metalnessMap: m.metalnessMap || null,
          aoMap: m.aoMap || null,
          displacementMap: m.displacementMap || null
        };
      }

      const newMaterial = new THREE.MeshStandardMaterial({
        color: material.color,
        roughness: material.metallic ? 0.15 : (material.type === 'leather' ? 0.4 : material.type === 'pebbled' ? 0.75 : 0.55),
        metalness: material.metallic ? 0.7 : 0.15,
        map: colorMap,
        envMapIntensity: material.metallic ? 2.0 : 1.2,
        transparent: false,
        side: THREE.FrontSide,
        ...preservedMaps
      });

      setMaterials(prev => ({
        ...prev,
        [lower]: newMaterial
      }));
    } catch (error) {
      console.error('Error applying material:', error);
    }
  };

  // Apply pattern to a specific part's material
  const applyPatternToPart = (partName, patternType) => {
    const lower = partName.toLowerCase();
    const part = modelParts.find(p => p.name.toLowerCase() === lower);
    if (!part || !part.mesh) return;

    const mesh = part.mesh;
    const currentMaterial = materials[lower] || mesh.material;

    // Restore base (no pattern) without changing color/material
    if (patternType === 'none') {
      const restored = currentMaterial.clone();
      restored.map = mesh.userData.baseMap || null;
      restored.needsUpdate = true;
      setMaterials(prev => ({
        ...prev,
        [lower]: restored
      }));
      return;
    }

    // Build a patterned color map procedurally using the current base color
    const baseHex = mesh.userData.baseColorHex || `#${currentMaterial.color.getHexString()}`;
    const isMetallic = (currentMaterial.metalness || 0) >= 0.5;
    const dataUrl = generateTexture('smooth', baseHex, patternType, selectedStitching.type, isMetallic);

    const textureLoader = new THREE.TextureLoader();
    const colorMap = textureLoader.load(dataUrl);
    colorMap.wrapS = THREE.RepeatWrapping;
    colorMap.wrapT = THREE.RepeatWrapping;
    colorMap.repeat.set(3, 3);
    colorMap.generateMipmaps = true;
    colorMap.minFilter = THREE.LinearMipmapLinearFilter;
    colorMap.magFilter = THREE.LinearFilter;

    // Preserve existing PBR maps and color; only swap the base map
    const updated = currentMaterial.clone();
    updated.map = colorMap;
    updated.needsUpdate = true;

    setMaterials(prev => ({
      ...prev,
      [lower]: updated
    }));
  };

  // Handle part selection
  const handlePartClick = (partName, mesh) => {
    setSelectedPart(partName);
    if (clickToZoomEnabled) {
      setIsZoomed(true);
    }
  };

  // Handle material selection - only when explicitly chosen
  const handleMaterialSelect = (material) => {
    setSelectedMaterial(material);
    if (selectedPart) {
      applyMaterial(selectedPart, material);
    }
  };

  // Handle pattern selection - mapped to Modeller-new PBR sets
  const handlePatternSelect = (pattern) => {
    setSelectedPattern(pattern);
    if (!selectedPart) return;

    // Map UI patterns to available folders
    // Use set '02' for Diamond by default (falls back internally to '01' if not found)
    const setId = pattern.type === 'diamond' ? '02' : 'none';
    applyPBRSetToPart(selectedPart, setId, modelParts, materials, setMaterials);
  };

  // Handle stitching selection
  const handleStitchingSelect = (stitching) => {
    setSelectedStitching(stitching);
    
    const materialsWithTextures = availableMaterials.map(material => ({
      ...material,
      texture: generateTexture(material.type, `#${material.color.getHexString()}`, selectedPattern.type, stitching.type, material.metallic)
    }));
    setAvailableMaterials(materialsWithTextures);
    
    if (selectedPart && selectedMaterial) {
      const updatedMaterial = materialsWithTextures.find(m => m.name === selectedMaterial.name);
      if (updatedMaterial) {
        setSelectedMaterial(updatedMaterial);
        applyMaterial(selectedPart, updatedMaterial);
      }
    }
  };

  // Reset functions
  const resetView = () => {
    setSelectedPart(null);
    setIsAutoRotating(true);
  };

  const resetZoom = () => {
    if (modelBounds) {
      setIsZoomed(false);
    } else {
      setIsZoomed(false);
    }
    setSelectedPart(null); // also deselect on zoom out
    setIsAutoRotating(true);
  };

  const resetMaterials = () => {
    setMaterials({});
  };

  const resetAll = () => {
    setMaterials({});
    setSelectedPart(null);
    setIsZoomed(false);
    setIsAutoRotating(true);
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
            <h4>{selectedMaterial.name} {selectedMaterial.metallic && '(Metallic)'}</h4>
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
              {selectedMaterial.metallic && <li>Metallic finish with enhanced shine</li>}
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
            <p>6. The chair auto-rotates for better viewing</p>
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
          camera={{ position: [5, 3, 5], fov: 60 }}
          style={{ 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            width: '100%',
            height: '100%'
          }}
          dpr={[1, 2]}
          shadows
          gl={{ antialias: true, shadowMapEnabled: true, shadowMapType: THREE.PCFSoftShadowMap, physicallyCorrectLights: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
          onPointerMissed={() => setSelectedPart(null)}
        >
          {/* Global fill */}
          <ambientLight intensity={0.25} />
          <hemisphereLight args={[0xffffff, 0x222233, 0.5]} />
          {/* Key light (front-right) */}
          <directionalLight 
            position={[6, 7, 8]} 
            intensity={1.8} 
            castShadow 
            shadow-mapSize-width={2048} 
            shadow-mapSize-height={2048}
            shadow-bias={-0.0005}
          />
          {/* Fill light (front-left lower) */}
          <directionalLight position={[-6, 3, 5]} intensity={0.8} />
          {/* Rim light (behind) to pop backrest edges */}
          <directionalLight position={[0, 6, -8]} intensity={1.0} />
          {/* Focused spot to reveal backrest stitching */}
          <spotLight 
            position={[0, 8, 2]} 
            intensity={1.6} 
            angle={0.35} 
            penumbra={0.7} 
            castShadow 
            shadow-mapSize-width={2048} 
            shadow-mapSize-height={2048} 
            shadow-bias={-0.0003}
          />
          
          <Suspense fallback={<Loader />}>
            <Chair 
              materials={materials}
              selectedPart={selectedPart}
              onPartClick={handlePartClick}
              onModelLoad={handleModelLoad}
              isAutoRotating={isAutoRotating}
            />
          </Suspense>
          
          <CameraController 
            selectedPart={selectedPart}
            modelParts={modelParts}
            isZoomed={isZoomed}
            onZoomChange={setIsZoomed}
            bounds={modelBounds}
            zoomOnClickEnabled={clickToZoomEnabled}
            isAutoRotating={isAutoRotating}
          />
          
          <ContactShadows opacity={0.35} scale={20} blur={2.5} far={8} color="#000000" />
          <Environment preset="warehouse" />
        </Canvas>
        
        {/* Viewer Controls */}
        <div className="viewer-controls">
          <button onClick={resetView}>Reset View</button>
          <button onClick={resetZoom}>Reset Zoom</button>
          <button onClick={resetMaterials}>Reset Materials</button>
          <button onClick={resetAll}>Reset All</button>
          <button onClick={() => setIsAutoRotating(!isAutoRotating)}>
            {isAutoRotating ? 'Stop Rotation' : 'Start Rotation'}
          </button>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={clickToZoomEnabled} onChange={(e) => setClickToZoomEnabled(e.target.checked)} />
            Click to Zoom
          </label>
        </div>
      </div>
    </div>
  );
}

export default App;
