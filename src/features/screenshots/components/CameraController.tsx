"use client"
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useScreenshotsStore, calculatePositions } from '@/features/screenshots/store';
import * as THREE from 'three'
import { useModelStore } from '@/features/model/store';
import { useSceneSettingsStore } from '@/features/scene/store/settings';

export const captureScreenshot = (
    camera: THREE.Camera,
    gl: THREE.WebGLRenderer,
    scene: THREE.Scene,
    position: THREE.Vector3,
) => {
    camera.position.copy(position);
    camera.lookAt(0, 0, 0);
    gl.render(scene, camera);
    return gl.domElement.toDataURL('image/png').split(',')[1];
};


export const CameraController = () => {
    const { camera, gl, scene } = useThree();
    // const { update } = useWorkspaceStore();
    const { updateCamera } = useSceneSettingsStore();
    const { captureInProgress, addScreenshot, stopCapture, captureMode } = useScreenshotsStore();
    const { models, selectModel, selectedModel } = useModelStore();

    const lastZoomRef = useRef(camera.zoom);
    const lastUpdateRef = useRef(Date.now());
    const UPDATE_INTERVAL = 500;

    useFrame(() => {
        const now = Date.now();
        if (now - lastUpdateRef.current < UPDATE_INTERVAL) return;

        const zoomDifference = Math.abs(camera.zoom - lastZoomRef.current);
        if (zoomDifference > 0.01) {
            updateCamera({ zoom: camera.zoom })

            lastZoomRef.current = camera.zoom;
            lastUpdateRef.current = now;
        }
    });


    useEffect(() => {
        if (!captureInProgress) return;
        const initialPosition = camera.position.clone();
        const initialZoom = camera.zoom

        const handleCapture = async () => {
            const currentDistance = new Vector3()
                .subVectors(camera.position, new Vector3(0, 0, 0))
                .length();

            if (captureMode === 'single') {
                const position = {
                    name: 'custom-view',
                    vector: camera.position.clone()
                };
                const data = captureScreenshot(
                    camera,
                    gl,
                    scene,
                    position.vector
                );
                addScreenshot(selectedModel?.name || 'model', position, data);
            } else if (captureMode === 'all') {

                const positions = calculatePositions(currentDistance);
                for (const position of positions) {
                    const data = captureScreenshot(
                        camera,
                        gl,
                        scene,
                        position.vector
                    );
                    addScreenshot(selectedModel?.name || 'model', position, data);
                    // await new Promise(resolve => setTimeout(resolve, 500));
                }
            } else if (captureMode === 'all-models') {
                for (const model of models) {
                    selectModel(model.id);
                    camera.zoom = model.workspaceSettings.camera?.zoom || 2
                    // Use the stored Distance
                    const positions = calculatePositions(currentDistance)
                    for (const position of positions) {
                        const data = captureScreenshot(
                            camera,
                            gl,
                            scene,
                            position.vector
                        )
                        addScreenshot(model.name, position, data)
                    }
                }
                camera.zoom = initialZoom
            }
            camera.position.copy(initialPosition)
            stopCapture();
        };

        handleCapture();
    }, [captureInProgress, camera, gl, scene, addScreenshot, captureMode, stopCapture, models, selectModel, selectModel.name, selectedModel?.name]);

    return null;
};