import type { SceneData, SceneObject } from '../types/scene';

export const exportSceneToJSON = (
  objects: SceneObject[],
  sceneName?: string
): SceneData => {
  return {
    objects: objects.map(obj => ({
      ...obj,
      // Ensure all material properties are included for forward compatibility
      material: {
        color: obj.material.color,
        roughness: obj.material.roughness,
        metalness: obj.material.metalness,
        emissive: obj.material.emissive,
        emissiveIntensity: obj.material.emissiveIntensity,
      },
    })),
    metadata: {
      version: '2.0',
      created: new Date().toISOString(),
      name: sceneName || 'Untitled Scene',
    },
  };
};

export const downloadScene = (sceneData: SceneData, filename?: string): void => {
  const jsonString = JSON.stringify(sceneData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `scene-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const loadSceneFromJSON = (jsonString: string): SceneData | null => {
  try {
    const sceneData = JSON.parse(jsonString) as SceneData;
    
    // Basic validation
    if (!sceneData.objects || !Array.isArray(sceneData.objects)) {
      throw new Error('Invalid scene data: missing objects array');
    }
    
    if (!sceneData.metadata || !sceneData.metadata.version) {
      throw new Error('Invalid scene data: missing metadata');
    }
    
    // Validate each object
    for (const obj of sceneData.objects) {
      if (!obj.id || !obj.type || !obj.position || !obj.rotation || !obj.scale) {
        throw new Error('Invalid scene object: missing required properties');
      }
      
      if (!['cube', 'sphere'].includes(obj.type)) {
        throw new Error(`Invalid object type: ${obj.type}`);
      }
      
      if (!Array.isArray(obj.position) || obj.position.length !== 3 ||
          !Array.isArray(obj.rotation) || obj.rotation.length !== 3 ||
          !Array.isArray(obj.scale) || obj.scale.length !== 3) {
        throw new Error('Invalid object transform arrays');
      }

      // Ensure material properties exist (for backward compatibility)
      if (!obj.material) {
        const objWithColor = obj as SceneObject & { color?: string };
        obj.material = {
          color: objWithColor.color || '#ffffff',
          roughness: 0.3,
          metalness: 0.1,
          emissive: '#000000',
          emissiveIntensity: 0,
        };
      }
    }
    
    return sceneData;
  } catch (error) {
    console.error('Error loading scene:', error);
    return null;
  }
};

export const loadSceneFromFile = (file: File): Promise<SceneData | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        const sceneData = loadSceneFromJSON(event.target.result as string);
        resolve(sceneData);
      } else {
        resolve(null);
      }
    };
    
    reader.onerror = () => {
      resolve(null);
    };
    
    reader.readAsText(file);
  });
};
