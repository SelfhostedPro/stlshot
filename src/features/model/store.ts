import { ChangeEvent } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist, devtools } from 'zustand/middleware';
import { createIndexedDBStorage, createPersistStorage } from '@/lib/indexDBStorage';
import { initModel } from './utils/initModel'
import { ComponentState } from '@/features/scene/store/components'
import { SettingsState } from '@/features/scene/store/settings'

// Separate storage for model data
const MODEL_STORE_NAME = 'model-data';

const modelDB = createIndexedDBStorage({
    name: MODEL_STORE_NAME,
    version: 1,
});



interface Model {
    id: string;
    dataKey: string;
    thumbnailKey: string;
    name: string;
    components: Partial<ComponentState['components']>
    settings: {
        camera?: Partial<SettingsState['camera']>
        canvas?: Partial<SettingsState['canvas']>
    }
}

interface ModelState {
    models: Model[];
    selectedModel: Model | null;
}



interface ModelStateStore extends ModelState {
    isLoading: boolean;
    error: null | string;
    uploadModel: (e: ChangeEvent<HTMLInputElement>) => void;
    selectModel: (id: string) => void;
    deleteModel: (id: string) => void;
    resetModels: () => void;
    updateModel: (id: string, updates: Partial<Omit<Model, 'id' | 'dataKey'>>) => Promise<void>;
}

export const useModelStore = create<ModelStateStore>()(
    devtools(

        persist(
            (set) => ({
                models: [],
                selectedModel: null,
                isLoading: false,
                error: null,

                uploadModel: (e: ChangeEvent<HTMLInputElement>) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;

                    files.forEach(async (file, index) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onloadend = async (ev) => {
                            const data = ev.target?.result?.toString();
                            if (!data) return;

                            const id = crypto.randomUUID();
                            const dataKey = `model_${id}`;
                            const thumbnailKey = `thumb_${id}`


                            const { thumbnail, targetZoom } = await initModel(data)

                            // Store both model and thumbnail
                            await modelDB.setItem(dataKey, data);
                            await modelDB.setItem(thumbnailKey, thumbnail);

                            set((state) => {
                                const newModel = {
                                    id,
                                    dataKey,
                                    thumbnailKey,
                                    name: file.name,
                                    settings: {
                                        camera: { zoom: targetZoom }
                                    },
                                    components: [],
                                };

                                const newModels = [...state.models, newModel];

                                // Select the new model if it's the first file or no model is selected
                                const newSelectedModel = index === 0 || !state.selectedModel
                                    ? newModel
                                    : state.selectedModel;

                                return {
                                    models: newModels,
                                    selectedModel: newSelectedModel,
                                };
                            });
                        };
                    });
                },

                deleteModel: async (id: string) => {
                    set((state) => {
                        const modelToDelete = state.models.find(model => model.id === id);
                        if (modelToDelete) {
                            // Delete the model data from IndexedDB
                            modelDB.removeItem(modelToDelete.dataKey);
                        }

                        const newModels = state.models.filter(model => model.id !== id);

                        // If we're deleting the selected model, select the first available model
                        const newSelectedModel = modelToDelete?.id === state.selectedModel?.id
                            ? newModels[0] ?? null
                            : state.selectedModel;

                        return {
                            models: newModels,
                            selectedModel: newSelectedModel,
                        };
                    });
                },

                resetModels: async () => {
                    set((state) => {
                        // Delete all model data from IndexedDB
                        state.models.forEach(model => {
                            modelDB.removeItem(model.dataKey);
                        });

                        return {
                            models: [],
                            selectedModel: null,
                        };
                    });
                },

                selectModel: (id: string) => {
                    set((state) => ({
                        selectedModel: state.models.find(model => model.id === id) ?? null
                    }));
                },

                updateModel: async (id: string, updates: Partial<Omit<Model, 'id' | 'dataKey'>>) => {
                    set((state) => {
                        const modelIndex = state.models.findIndex(model => model.id === id);
                        if (modelIndex === -1) return state;

                        const updatedModels = [...state.models];
                        updatedModels[modelIndex] = {
                            ...updatedModels[modelIndex],
                            ...updates
                        };

                        // Update selected model if it's the one being modified
                        const newSelectedModel = state.selectedModel?.id === id
                            ? updatedModels[modelIndex]
                            : state.selectedModel;

                        return {
                            models: updatedModels,
                            selectedModel: newSelectedModel
                        };
                    });
                },
            }),
            {
                name: 'model-storage',
                storage: createPersistStorage<ModelState>({
                    name: 'model-state',
                    version: 1
                }),
                partialize: (state) => ({
                    models: state.models,
                    selectedModel: state.selectedModel,
                }),
            }
        )
    )
);

// Helper function to get model data
export const getModelData = async (dataKey: string): Promise<string> => {
    const result = await modelDB.getItem(dataKey);
    if (typeof result !== 'string') {
        throw new Error('Invalid model data');
    }
    return result;
};

// Helper function to get thumbnail data
export const getModelThumbnail = async (imageKey: string): Promise<string> => {
    const result = await modelDB.getItem(imageKey);
    if (typeof result !== 'string') {
        throw new Error('Invalid image data');
    }
    return result;
};

