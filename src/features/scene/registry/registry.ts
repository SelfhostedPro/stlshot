// src/features/scene/registry/registry.ts
import { ComponentType, ComponentTypeKeys, SceneComponent } from '../types';
import { componentTypes } from './components';
import { createDefaultScene } from './defaults';


class ComponentRegistry {
  private components: Map<ComponentTypeKeys, ComponentType>;

  constructor() {
    const entries = Object.entries(componentTypes) as [ComponentTypeKeys, ComponentType][];
    this.components = new Map(entries);
  }

  createComponent(type: ComponentTypeKeys, parentId?: string): SceneComponent {
    const componentType = this.components.get(type);
    if (!componentType) throw new Error(`Unknown component type: ${type}`);

    return {
      id: crypto.randomUUID(),
      type,
      settings: { ...componentType.defaultSettings },
      parentId,
      isCore: componentType.isCore,
    };
  }

  createDefaultScene(): SceneComponent[] {
    return createDefaultScene();
  }

  validateComponent(component: SceneComponent, existingComponents: SceneComponent[]): boolean {
    const componentType = this.components.get(component.type);
    if (!componentType) return false;

    if (componentType.requiresParent && !component.parentId) return false;

    if (component.parentId) {
      const parent = existingComponents.find(c => c.id === component.parentId);
      if (!parent) return false;
      
      const parentType = this.components.get(parent.type);
      if (!parentType?.allowedChildren?.includes(component.type)) return false;
    }

    return true;
  }
}

export const componentRegistry = new ComponentRegistry();
