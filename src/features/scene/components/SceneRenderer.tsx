// src/features/scene/components/Scene.tsx
import { Canvas, CanvasProps } from '@react-three/fiber';
import React, { ReactNode, Suspense, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { useSceneSettingsStore } from '../store/settings';
import { CoreManager } from './CoreManager';
import { ComponentRenderer } from './ComponentRenderer';
import { useComponentStore } from '../store/components';
import { OrbitControls, Html } from '@react-three/drei';
import { CameraController } from '@/features/screenshots/components/CameraController'
interface SceneProps {
    children?: ReactNode
}



export const Scene = ({ children }: SceneProps) => {
    const canvasSettings = useSceneSettingsStore((state) => state.canvas);
    const cameraSettings = useSceneSettingsStore((state) => state.camera)
    // const { components, initializeDefaultScene } = useComponentStore((state) => ({
    //     components: state.components,
    //     initializeDefaultScene: state.initializeDefaultScene
    // }));
    const components = useComponentStore(state => state.components)
    const initializeDefaultScene = useComponentStore(state => state.initializeDefaultScene)

    useEffect(() => {
        console.log('Scene mounted, current components:', components);
        if (components.length === 0) {
            console.log('Initializing default scene...');
            initializeDefaultScene();
        }
    }, [components, initializeDefaultScene]);

    // Prepare canvas props correctly
    const canvasProps: CanvasProps = {
        ...canvasSettings,
        children,
        gl: canvasSettings.gl as CanvasProps['gl'],
        camera: cameraSettings
    };
    return (
        <ErrorBoundary>
            <Canvas {...canvasProps}>
                <Suspense fallback={<Html><div>Loading</div></Html>}>
                    <CoreManager />
                    <Suspense fallback={<Html><div>Loading</div></Html>}>
                        <ComponentRenderer />
                    </Suspense>
                    <OrbitControls />
                    {/* <SceneList /> */}
                    <CameraController />
                </Suspense>
            </Canvas>
        </ErrorBoundary>
    );
};
