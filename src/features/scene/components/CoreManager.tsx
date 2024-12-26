// src/features/scene/components/CoreManager.tsx
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { useSceneSettingsStore } from '../store/settings';

export const CoreManager = () => {
  const { gl, camera, set } = useThree();
  const { canvas: canvasSettings, camera: cameraSettings } = useSceneSettingsStore();

  useEffect(() => {
    if (gl && canvasSettings.gl) {
      Object.assign(gl, canvasSettings.gl);
    }

    set((state) => ({
      ...state,
      frameloop: canvasSettings.frameloop,
      flat: canvasSettings.flat,
      linear: canvasSettings.linear,
    }));
  }, [gl, canvasSettings, set]);

  useEffect(() => {
    if (camera) {

      camera.zoom = cameraSettings.zoom;
      camera.updateProjectionMatrix();

      Object.assign(camera, {
        fov: cameraSettings.fov,
        near: cameraSettings.near,
        far: cameraSettings.far
      });

      camera.updateProjectionMatrix();
    }
  }, [camera, cameraSettings]);

  return null;
};
