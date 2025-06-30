import { useRef, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { Mesh } from 'three';
import { Edges } from '@react-three/drei';
import type { SceneObject as SceneObjectType } from '../../types/scene';

interface SceneObjectProps {
  object: SceneObjectType;
  isSelected: boolean;
  onSelect: () => void;
}

export const SceneObject = forwardRef<Mesh, SceneObjectProps>(({ object, isSelected, onSelect }, ref) => {
  const meshRef = useRef<Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Expose the mesh ref to parent components - ensure it's available when mesh is ready
  useImperativeHandle(ref, () => meshRef.current!, []);

  // Set initial transform when mesh is ready or object data changes
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.fromArray(object.position);
      meshRef.current.rotation.fromArray(object.rotation);
      meshRef.current.scale.fromArray(object.scale);
    }
  }, [object.position, object.rotation, object.scale, object.id]);

  // Handle mesh ready callback
  const handleMeshRef = (mesh: Mesh | null) => {
    meshRef.current = mesh;
    // Trigger the imperative handle update when mesh is ready
    if (mesh && ref && typeof ref === 'function') {
      ref(mesh);
    } else if (mesh && ref && typeof ref === 'object') {
      ref.current = mesh;
    }
  };

  const renderGeometry = () => {
    switch (object.type) {
      case 'cube':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere':
        return <sphereGeometry args={[0.5, 32, 32]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <group>
      {/* Main object mesh */}
      <mesh
        ref={handleMeshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsHovered(false);
          document.body.style.cursor = 'auto';
        }}
        castShadow
        receiveShadow
      >
        {renderGeometry()}
        <meshStandardMaterial 
          color={object.material.color}
          roughness={object.material.roughness}
          metalness={object.material.metalness}
          // Dynamic emissive based on hover/selection state
          emissive={isHovered && !isSelected ? '#1a365d' : object.material.emissive}
          emissiveIntensity={isHovered && !isSelected ? 0.1 : object.material.emissiveIntensity}
        />
        
        {/* Selection outline using Edges */}
        {(isSelected || isHovered) && (
          <Edges
            scale={1.01}
            threshold={15}
            color={isSelected ? '#00d4ff' : '#ffffff'}
            transparent
            opacity={isSelected ? 0.8 : 0.4}
            linewidth={isSelected ? 3 : 2}
          />
        )}
      </mesh>
      
      {/* Enhanced selection glow effect - only for selected objects */}
      {isSelected && (
        <mesh
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          scale={[1.05, 1.05, 1.05]}
        >
          {renderGeometry()}
          <meshBasicMaterial 
            color="#00d4ff"
            transparent 
            opacity={0.15}
            depthWrite={false}
            depthTest={true}
          />
        </mesh>
      )}
    </group>
  );
});
