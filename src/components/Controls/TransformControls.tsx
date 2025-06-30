import React, { useRef, useEffect } from 'react';
import { TransformControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Mesh } from 'three';
import type { TransformControls as TransformControlsImpl } from 'three-stdlib';
import type { SceneObject } from '../../types/scene';
import { vector3ToArray, eulerToArray } from '../../types/scene';

interface CustomTransformControlsProps {
  mode: 'translate' | 'rotate' | 'scale';
  onObjectChange: (updates: Partial<SceneObject>) => void;
  targetMesh: Mesh | null;
}

export const CustomTransformControls: React.FC<CustomTransformControlsProps> = ({
  mode,
  onObjectChange,
  targetMesh,
}) => {
  const transformRef = useRef<TransformControlsImpl>(null);
  const { gl } = useThree();

  useEffect(() => {
    if (transformRef.current && targetMesh) {
      const controls = transformRef.current;
      
      const handleChange = () => {
        if (targetMesh) {
          const updates: Partial<SceneObject> = {};
          
          // Always update all transform properties to keep state in sync
          updates.position = vector3ToArray(targetMesh.position);
          updates.rotation = eulerToArray(targetMesh.rotation);
          updates.scale = vector3ToArray(targetMesh.scale);
          
          onObjectChange(updates);
        }
      };

      const handleDraggingChanged = (...args: unknown[]) => {
        const event = args[0] as { value: boolean };
        if (event && typeof event.value === 'boolean') {
          if (event.value) {
            gl.domElement.style.cursor = 'grabbing';
          } else {
            gl.domElement.style.cursor = 'auto';
          }
        }
      };

      // Cast to any for event handling (TransformControls uses custom events)
      const controlsWithEvents = controls as unknown as {
        addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
        removeEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
      };
      controlsWithEvents.addEventListener('change', handleChange);
      controlsWithEvents.addEventListener('dragging-changed', handleDraggingChanged);

      return () => {
        controlsWithEvents.removeEventListener('change', handleChange);
        controlsWithEvents.removeEventListener('dragging-changed', handleDraggingChanged);
      };
    }
  }, [onObjectChange, gl, targetMesh]);

  if (!targetMesh) {
    return null;
  }

  return (
    <TransformControls
      ref={transformRef}
      object={targetMesh}
      mode={mode}
      size={1}
      showX={true}
      showY={true}
      showZ={true}
    />
  );
};
