// src/features/scene/types/index.ts
import { GLProps, ThreeElements } from '@react-three/fiber';
import { ComponentProps } from 'react';
import { Edges, Outlines } from '@react-three/drei';


export interface CanvasSettings {
    gl: Partial<GLProps>;
    dpr: number | [min: number, max: number];
    shadows: boolean;
    frameloop: 'always' | 'demand' | 'never';
    flat: boolean;
    linear: boolean;
    orthographic: boolean
}

export interface CameraSettings {
    fov: number;
    near: number;
    far: number;
    zoom: number;
    position: [number, number, number];
}

export interface SceneComponent {
    id: string;
    type: ComponentTypeKeys;
    settings: ComponentSettings[ComponentTypeKeys];
    parentId?: string;
    isCore?: boolean;
}

// New type to define UI controls for settings
export type SettingControlType =
    | {
        label?: string, type: 'slider'; min: number; max: number; step?: number;
        formatDisplay?: (value: number) => string; // Changed from format
        formatValue?: (value: number) => number;   // Added for value transformation
    }
    | { label?: string, type: 'color' }
    | { label?: string, type: 'checkbox' }
    | {
        label?: string, type: 'number'; min?: number; max?: number; step?: number;
        formatDisplay?: (value: number) => string; // Changed from format
        formatValue?: (value: number) => number;
    }
    | {
        type: 'number-pair';
        min: number;
        max: number;
        step: number;
        label: string;
        labels: [string, string];
    }
    | { label?: string, type: 'text' }
    | {
        label?: string, type: 'slider-array'; min: number; max: number; step?: number; dimensions: number;
        formatDisplay?: (value: number) => string; // Changed from format
        formatValue?: (value: number) => number;
    };

export type ComponentTypeKeys = keyof ComponentSettings;

export interface ComponentType {
    name: string;
    component?: React.ComponentType<ComponentSettings[ComponentTypeKeys]>;
    defaultSettings: ComponentSettings[ComponentTypeKeys];
    // Map setting keys to their control types
    settingControls?: {
        [K in keyof ComponentSettings[ComponentTypeKeys]]?: SettingControlType;
    };
    allowedChildren?: ComponentTypeKeys[];
    requiresParent?: ComponentTypeKeys[];
    isCore?: boolean;
}


export interface ComponentSettings {
    userModel: {
        rotation: [number, number, number]
        scale: number;
    };
    edges: ComponentProps<typeof Edges>;
    outlines: ComponentProps<typeof Outlines>;
    material: ThreeElements['meshBasicMaterial'];
}
