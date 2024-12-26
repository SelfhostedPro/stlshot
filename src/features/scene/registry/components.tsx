import { ComponentType, ComponentTypeKeys } from '../types';
import { UserModel } from '@/features/scene/components/UserModel'
import { Edges, Outlines } from '@react-three/drei';
import { ThreeElements } from '@react-three/fiber';

const formatDegrees = (rad: number) => `${Math.round((rad * 180) / Math.PI)}°`;
const radiansToDegrees = (rad: number) => (rad * 180) / Math.PI;


export const componentTypes: Record<ComponentTypeKeys, ComponentType> = {
  userModel: {
    name: 'User Model',
    component: UserModel,
    defaultSettings: {
      rotation: [-Math.PI / 2, 0, 0],
      scale: 0.5
    },
    settingControls: {
      rotation: {
        dimensions: 3,
        type: 'slider-array',
        min: -Math.PI,
        max: Math.PI,
        step: 0.01,
        label: 'Rotation',
        formatDisplay: formatDegrees,    // Returns string with degree symbol
        formatValue: radiansToDegrees    
      },
      scale: {
        type: 'slider',
        min: 0.1,
        max: 10,
        step: 0.1,
        label: 'Scale'
      }
    },
    isCore: true,
    allowedChildren: ['edges', 'outlines', 'material']
  },
  edges: {
    name: 'Edges',
    component: Edges,
    defaultSettings: {
      threshold: 15,
      color: '#000000',
      scale: 1
    },
    requiresParent: ['userModel']
  },
  outlines: {
    name: 'Outlines',
    component: Outlines,
    defaultSettings: {
      thickness: 2,
      color: '#000000',
      angle: 30,
      screenspace: false,
      opacity: 1,
      transparent: true
    },
    requiresParent: ['userModel']
  },
  material: {
    name: 'Material',
    component: (props: ThreeElements['meshBasicMaterial']) => <meshBasicMaterial {...props} />,
    defaultSettings: {
      color: '#ffffff',
      transparent: false,
      opacity: 1,
      wireframe: false
    },
    requiresParent: ['userModel']
  }
} as const;
