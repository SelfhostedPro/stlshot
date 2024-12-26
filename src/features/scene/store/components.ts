// src/features/scene/store/components.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SceneComponent, ComponentTypeKeys, ComponentSettings } from '../types';
import { componentRegistry } from '../registry/registry';

export interface ComponentState {
    components: SceneComponent[];
}

export interface ComponentActions {
    initializeDefaultScene: () => void;
    addComponent: (type: ComponentTypeKeys, parentId?: string) => void;
    updateComponent: (
        id: string,
        updates: { settings: Partial<ComponentSettings[ComponentTypeKeys]> }
    ) => void;
    removeComponent: (id: string) => void;
    // selectComponent: (id: string | null) => void;
}

export const useComponentStore = create<ComponentState & ComponentActions>()(
    devtools((set) => ({
        components: [],
        selectedId: null,

        initializeDefaultScene: () => {
            const defaultScene = componentRegistry.createDefaultScene();
            set({ components: defaultScene });
        },

        addComponent: (type, parentId) => {
            const component = componentRegistry.createComponent(type, parentId);
            set((state) => ({
                components: [...state.components, component]
            }));
        },

        updateComponent: (id, { settings }) => set((state) => {
            console.log('Updating component:', id, 'with settings:', settings);
            return {
                components: state.components.map((component) =>
                    component.id === id
                        ? {
                            ...component,
                            settings: {
                                ...component.settings,
                                ...settings
                            }
                        }
                        : component
                )
            };
        }),

        removeComponent: (id) => set((state) => ({
            components: state.components.filter((c) =>
                c.id !== id && c.parentId !== id
            ),
        })),

        // selectComponent: (id) => set({ selectedId: id })
    }))
);
