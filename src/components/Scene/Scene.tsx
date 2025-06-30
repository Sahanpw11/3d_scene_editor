import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, ContactShadows, Sky } from '@react-three/drei';
import { Mesh } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { SceneObject } from './SceneObject';
import { CustomTransformControls } from '../Controls/TransformControls';
import type { SceneObject as SceneObjectType, SceneSettings } from '../../types/scene';

interface SceneProps {
  objects: SceneObjectType[];
  selectedObjectIds: string[]; // Changed to array
  transformMode: 'translate' | 'rotate' | 'scale';
  settings: SceneSettings;
  onSelectObjects: (objectIds: string[]) => void; // Changed to array
  onUpdateObject: (objectId: string, updates: Partial<SceneObjectType>) => void;
}

const Lighting: React.FC<{ enableShadows: boolean }> = ({ enableShadows }) => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={1.2} 
        castShadow={enableShadows}
        shadow-mapSize={[4096, 4096]}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />
      <directionalLight 
        position={[-5, 10, -5]} 
        intensity={0.3} 
        color="#a8d8ff"
      />
      <hemisphereLight
        args={["#87CEEB", "#362d1a", 0.5]}
      />
    </>
  );
};

const EnhancedGroundPlane: React.FC<{ showShadows: boolean }> = ({ showShadows }) => {
  return (
    <>
      {/* Main ground plane */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]} 
        receiveShadow={showShadows}
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#f8fafc"
          roughness={0.8}
          metalness={0.0}
          envMapIntensity={0.1}
        />
      </mesh>
      
      {/* Use ContactShadows only when regular shadows are disabled for better performance */}
      {!showShadows && (
        <ContactShadows
          position={[0, -0.005, 0]}
          opacity={0.3}
          scale={20}
          blur={1.5}
          far={8}
          resolution={256}
          color="#000000"
        />
      )}
      
      {/* Subtle reflection */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.02, 0]}
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#ffffff"
          transparent
          opacity={0.05}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </>
  );
};

export const Scene: React.FC<SceneProps> = ({
  objects,
  selectedObjectIds,
  transformMode,
  settings,
  onSelectObjects,
  onUpdateObject,
}) => {
  const selectedObjectId = selectedObjectIds.length === 1 ? selectedObjectIds[0] : null;
  const selectedObject = objects.find(obj => obj.id === selectedObjectId);
  const [selectedMesh, setSelectedMesh] = useState<Mesh | null>(null);
  const meshRefs = useRef<Map<string, Mesh>>(new Map());
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);

  // Update selected mesh when selection changes
  useEffect(() => {
    if (selectedObjectId) {
      const mesh = meshRefs.current.get(selectedObjectId);
      setSelectedMesh(mesh || null);
    } else {
      setSelectedMesh(null);
    }
  }, [selectedObjectId]);

  const handleMeshRef = (objectId: string) => (mesh: Mesh | null) => {
    if (mesh) {
      meshRefs.current.set(objectId, mesh);
      // If this is the selected object, update the selected mesh immediately
      if (objectId === selectedObjectId) {
        setSelectedMesh(mesh);
      }
    } else {
      meshRefs.current.delete(objectId);
      // If this was the selected mesh, clear it
      if (objectId === selectedObjectId) {
        setSelectedMesh(null);
      }
    }
  };

  return (
    <Canvas
      camera={{ position: [8, 8, 8], fov: 50 }}
      shadows={settings.showShadows}
      style={{ background: 'linear-gradient(to bottom, #e0f2fe, #f0f9ff)' }}
      onPointerMissed={() => onSelectObjects([])}
    >
      <Lighting enableShadows={settings.showShadows} />
      
      {/* Environment */}
      <Environment preset="dawn" />
      <Sky
        distance={450000}
        sunPosition={[10, 15, 10]}
        inclination={0}
        azimuth={0.25}
      />
      
      {/* Enhanced ground plane */}
      <EnhancedGroundPlane showShadows={settings.showShadows} />
      
      {/* Grid helper */}
      {settings.showGrid && (
        <Grid 
          args={[30, 30]} 
          position={[0, 0, 0]}
          cellSize={settings.snapSize}
          cellThickness={0.5}
          cellColor="#cbd5e1"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#94a3b8"
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />
      )}
      
      {/* Scene objects */}
      {objects.map((object) => (
        <SceneObject
          key={object.id}
          ref={handleMeshRef(object.id)}
          object={object}
          isSelected={selectedObjectIds.includes(object.id)}
          onSelect={() => onSelectObjects([object.id])}
        />
      ))}
      
      {/* Transform controls for selected object */}
      {selectedObject && selectedMesh && (
        <CustomTransformControls
          mode={transformMode}
          targetMesh={selectedMesh}
          onObjectChange={(updates: Partial<SceneObjectType>) => onUpdateObject(selectedObject.id, updates)}
        />
      )}
      
      {/* Camera controls */}
      <OrbitControls 
        ref={orbitControlsRef}
        makeDefault
        minDistance={1}
        maxDistance={50}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
    </Canvas>
  );
};
