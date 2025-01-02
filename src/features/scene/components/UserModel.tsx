"use client"
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useTransition } from 'react'
import * as THREE from 'three';
import { useModelStore, getModelData } from '@/features/model/store'
import { STLLoader } from 'three-stdlib'
import { ThreeElements, useLoader } from '@react-three/fiber';
import { useComponentStore } from '../store/components';
import { componentTypes } from '../registry';
import { useSceneSettingsStore } from '../store/settings';

interface ModelGeometryProps {
    geometry: THREE.BufferGeometry;
}

export const ModelGeometry: FC<ModelGeometryProps> = ({ geometry }) => {
    // const { edge } = useWorkspaceStore()
    // const lineGeometry = new THREE.EdgesGeometry(geometry, edge.angle);
    return (
        <>
            <primitive object={geometry} //args={[5, 5, 64, 64]}
            // material={UserShader} 
            />
            {/* <meshPhongMaterial color="white" toneMapped={false} flatShading={true}  depthTest={false}/> */}

            {/* <meshPhysicalMaterial {...MODEL_CONFIG.materials.default} /> */}
            {/* <meshBasicMaterial color="black" wireframe /> */}
            {/* <meshPhysicalMaterial color="whi/te"  /> */}
            {/* <meshBasicMaterial color="white" /> */}
        </>
    )
}



// src/components/3d/Model.tsx
export const UserModel = () => {
    const { selectedModel, models } = useModelStore()
    const { updateCamera } = useSceneSettingsStore()
    const meshRef = useRef<ThreeElements['mesh']>(null);
    const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
    const stlLoader = new STLLoader();

    // useEffect(() => {
    //     if (models.length === 0) return;
    //     models.map(model => getModelData(model.dataKey).then(data => useLoader(STLLoader, data)))
    // }, [models])

    const modelComponent = useComponentStore(state =>
        state.components
    ).find(c => c.type === 'userModel');

    const childComponents = useComponentStore(state =>
        state.components
    ).filter(c => c.parentId === modelComponent?.id);

    const loadSTL = useCallback(() => {
        if (!selectedModel?.dataKey) return;
        getModelData(selectedModel.dataKey).then((data) => {
            stlLoader.load(
                data,
                (geometry) => {
                    setGeometry(geometry);
                    geometry.center();
                    updateCamera(selectedModel.settings?.camera || { zoom: 2 })
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
                },
                (error) => {
                    console.error('An error occurred loading the STL:', error);
                }
            )
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedModel?.dataKey, selectedModel?.thumbnailKey]) // Janky state bs


    useEffect(() => {
        loadSTL()
        // Cleanup function
        return () => {
            if (geometry) {
                geometry.dispose();
                setGeometry(null);
            }
        };
        // Fix because loadstl changed geometry causing a loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadSTL, selectedModel?.dataKey]);

    if (!modelComponent || !geometry) {
        return null;
    }

    const rotation = modelComponent?.settings.rotation || [0, 0, 0];
    const scale = modelComponent?.settings.scale || 1;

    return (
        <mesh ref={meshRef} rotation={rotation} scale={scale}>
            {geometry && (
                <ModelGeometry geometry={geometry} />
            )}
            {
                childComponents.map(child => {
                    const config = componentTypes[child.type];
                    if (!config?.component) return null;

                    const Component = config.component;
                    return (
                        <Component
                            key={child.id}
                            {...child.settings}
                        />
                    );
                })
            }
        </mesh>
    );
}