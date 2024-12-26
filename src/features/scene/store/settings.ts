import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { produce } from 'immer';
import { defu } from 'defu';
import { CanvasSettings, CameraSettings } from '../types';

export interface SettingsState {
  canvas: CanvasSettings;
  camera: CameraSettings;
}

interface SettingsStateStore extends SettingsState {
  updateCanvas: (settings: Partial<CanvasSettings>) => void;
  updateCamera: (settings: Partial<CameraSettings>) => void;
  reset: () => void;
  getState: () => SettingsState;
}

const initialState: SettingsState = {
  canvas: {
    gl: {
      logarithmicDepthBuffer: true,
      antialias: true
    },
    dpr: [1, 100],
    shadows: true,
    frameloop: 'demand',
    flat: true,
    linear: true,
    orthographic: true,
  },
  camera: {
    fov: 35,
    near: 0.1,
    far: 10000,
    zoom: 2,
    position: [0, 0, 100],
  }
};

export const useSceneSettingsStore = create<SettingsStateStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        updateCanvas: (settings) => set(
          produce((state) => {
            state.canvas = defu(settings, state.canvas);
          })
        ),
        updateCamera: (settings) => set(
          produce((state) => {
            state.camera = defu(settings, state.camera);
          })
        ),
        reset: () => set(initialState),
        getState: () => {
          // I know it's not a best practice but idrc
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { getState, reset, updateCanvas, updateCamera, ...state } = get();
          return state;
        }
      }),
      {
        name: 'scene-core-storage'
      }
    )
  )
);