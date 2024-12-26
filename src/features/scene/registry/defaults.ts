// src/features/scene/registry/defaults.ts
import { ComponentTypeKeys, SceneComponent } from '../types';
import { componentTypes } from './components';

type SceneConfigNode = {
    type: ComponentTypeKeys;
    children?: readonly SceneConfigNode[];
};

// Define the scene configuration
const defaultSceneConfig: {
    readonly rootComponents: readonly SceneConfigNode[];
} = {
    rootComponents: [
        {
            type: 'userModel',
            children: [
                { type: 'edges' },
                { type: 'material' },
                { type: 'outlines' }
            ]
        }
    ]
} as const;
// src/features/scene/registry/defaults.ts
const createDefaultScene = (): SceneComponent[] => {
    const components: SceneComponent[] = [];

    const createComponentWithChildren = (
        config: Readonly<SceneConfigNode>,
        parentId?: string
    ) => {
        const id = crypto.randomUUID();
        const componentType = componentTypes[config.type];

        // Add debug logging
        console.log('Creating component:', { type: config.type, componentType });

        if (!componentType) {
            console.warn(`No component type found for: ${config.type}`);
            return;
        }

        components.push({
            id,
            type: config.type,
            settings: { ...componentType.defaultSettings },
            isCore: componentType.isCore,
            parentId
        });

        config.children?.forEach(child => {
            createComponentWithChildren(child, id);
        });
    };

    console.log('Starting default scene creation');
    defaultSceneConfig.rootComponents.forEach(rootComponent => {
        createComponentWithChildren(rootComponent);
    });
    console.log('Created default scene:', components);

    return components;
};
export { createDefaultScene }  