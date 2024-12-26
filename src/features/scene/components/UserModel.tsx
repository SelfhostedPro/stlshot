"use client"
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useModelStore, getModelData } from '@/features/model/store'
import { STLLoader } from 'three-stdlib'
import { ThreeElements } from '@react-three/fiber';
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
    const { selectedModel } = useModelStore()
    const { updateCamera } = useSceneSettingsStore()
    const meshRef = useRef<ThreeElements['mesh']>(null);
    const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

    const modelComponent = useComponentStore(state =>
        state.components
    ).find(c => c.type === 'userModel');

    const childComponents = useComponentStore(state =>
        state.components
    ).filter(c => c.parentId === modelComponent?.id);

    const loadSTL = useCallback(() => {
        const stlLoader = new STLLoader();

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


// export const UserShader = () => {
//     const { } = useWorkspaceStore();
//     const UserShader = new CustomShaderMaterial({
//         baseMaterial: THREE.MeshBasicMaterial,
//         vertexShader: `#include <common>
//         #include <morphtarget_pars_vertex>
//         #include <skinning_pars_vertex>
//         uniform float thickness;
//         uniform bool screenspace;
//         uniform vec2 size;
//         void main() {
//           #if defined (USE_SKINNING)
//               #include <beginnormal_vertex>
//             #include <morphnormal_vertex>
//             #include <skinbase_vertex>
//             #include <skinnormal_vertex>
//             #include <defaultnormal_vertex>
//           #endif
//           #include <begin_vertex>
//             #include <morphtarget_vertex>
//             #include <skinning_vertex>
//           #include <project_vertex>
//           vec4 tNormal = vec4(normal, 0.0);
//           vec4 tPosition = vec4(transformed, 1.0);
//           #ifdef USE_INSTANCING
//             tNormal = instanceMatrix * tNormal;
//             tPosition = instanceMatrix * tPosition;
//           #endif
//           if (screenspace) {
//             vec3 newPosition = tPosition.xyz + tNormal.xyz * thickness;
//             gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0); 
//           } else {
//             vec4 clipPosition = projectionMatrix * modelViewMatrix * tPosition;
//             vec4 clipNormal = projectionMatrix * modelViewMatrix * tNormal;
//             vec2 offset = normalize(clipNormal.xy) * thickness / size * clipPosition.w * 2.0;
//             clipPosition.xy += offset;
//             gl_Position = clipPosition;
//           }
//         }`,
//         fragmentShader: `uniform vec3 color;
//         uniform float opacity;
//         void main(){
//           gl_FragColor = vec4(color, opacity);
//           #include <tonemapping_fragment>
//           #include <colorspace_fragment>
//         }`
//     })



//     return UserShader
// }