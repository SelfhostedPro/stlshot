// src/components/demos/stls/screenshotsStore.ts
import { create } from 'zustand';
import { Vector3 } from 'three';
import { createJSONStorage, persist, devtools } from 'zustand/middleware'

import { createIndexedDBStorage } from '@/lib/indexDBStorage';

// Separate storage for images
const IMAGE_STORE_NAME = 'screenshot-images';
const imageDB = createIndexedDBStorage({
    name: IMAGE_STORE_NAME,
    version: 1,
});

export interface Screenshot {
    id: string;
    modelName: string;
    imageKey: string;
    position: Position;
}

interface Position {
    name: string;
    vector: Vector3;
}

export const calculatePositions = (distance: number): Position[] => {
    return [
        // Faces
        { name: 'front', vector: new Vector3(0, 0, distance) },
        { name: 'back', vector: new Vector3(0, 0, -distance) },
        { name: 'left', vector: new Vector3(-distance, 0, 0) },
        { name: 'right', vector: new Vector3(distance, 0, 0) },
        { name: 'top', vector: new Vector3(0, distance, 0) },
        { name: 'bottom', vector: new Vector3(0, -distance, 0) },
        // Corners
        { name: 'top-front-right', vector: new Vector3(1, 1, 1).normalize().multiplyScalar(distance) },
        { name: 'top-front-left', vector: new Vector3(-1, 1, 1).normalize().multiplyScalar(distance) },
        { name: 'bottom-front-right', vector: new Vector3(1, -1, 1).normalize().multiplyScalar(distance) },
        { name: 'bottom-front-left', vector: new Vector3(-1, -1, 1).normalize().multiplyScalar(distance) },
        { name: 'top-back-right', vector: new Vector3(1, 1, -1).normalize().multiplyScalar(distance) },
        { name: 'top-back-left', vector: new Vector3(-1, 1, -1).normalize().multiplyScalar(distance) },
        { name: 'bottom-back-right', vector: new Vector3(1, -1, -1).normalize().multiplyScalar(distance) },
        { name: 'bottom-back-left', vector: new Vector3(-1, -1, -1).normalize().multiplyScalar(distance) }

    ];
};

interface ScreenshotsState {
    isLoading: false,
    error: null,
    screenshots: Screenshot[];
    captureInProgress: boolean;
    captureMode: 'single' | 'all' | 'all-models' | null;
    addScreenshot: (modelName: string, position: Position, data: string) => void;
    deleteScreenshot: (id: string) => void;
    clearScreenshots: () => void;
    startCapture: (mode: 'single' | 'all' | 'all-models') => void;
    stopCapture: () => void;
    captureAllViews: () => void;
}


export const useScreenshotsStore = create<ScreenshotsState>()(
    devtools(
        persist(
            (set) => ({
                isLoading: false,
                error: null,
                screenshots: [],
                captureInProgress: false,
                captureMode: null,
                addScreenshot: async (modelName, position, data) => {
                    const id = Math.random().toString(36).substr(2, 9);
                    const imageKey = `image_${id}`;

                    // Store image data separately in IndexedDB
                    await imageDB.setItem(imageKey, data);

                    set(state => ({
                        screenshots: [...state.screenshots, {
                            id,
                            modelName,
                            imageKey,
                            position
                        }]
                    }));
                },
                deleteScreenshot: (id) => set(state => ({
                    screenshots: state.screenshots.filter(s => s.id !== id)
                })),
                clearScreenshots: () => set({ screenshots: [] }),
                startCapture: (mode) => set({ captureInProgress: true, captureMode: mode }),
                stopCapture: () => set({ captureInProgress: false, captureMode: null }),
                captureAllViews: () => set({ captureInProgress: true }),
            }),
            {
                name: 'screenshot-state',
                storage: createJSONStorage(() => createIndexedDBStorage({
                    name: 'screenshot-state',
                    version: 1
                })),
                partialize: (state) => ({
                    screenshots: state.screenshots
                }),
            }
        ),
        {
            enabled: true
        }
    ));

// Helper function to get image data
export const getScreenshotImageData = async (imageKey: string): Promise<string> => {
    const result = await imageDB.getItem(imageKey);
    if (typeof result !== 'string') {
        throw new Error('Invalid image data');
    }
    return result;
};