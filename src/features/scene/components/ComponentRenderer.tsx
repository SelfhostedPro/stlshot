// src/features/scene/components/ComponentRenderer.tsx
import { useComponentStore } from '../store/components';
import { componentTypes } from '../registry/components';
import { ComponentTypeKeys } from '../types';

export const ComponentRenderer = () => {
  const components = useComponentStore((state) => state.components);

  console.log('Rendering components:', components);

  return (
    <>
      {components.map((component) => {
        const config = componentTypes[component.type as ComponentTypeKeys];
        if (!config?.component) {
          console.log('No component found for:', component.type);
          return null;
        }

        const Component = config.component;
        console.log('Rendering component:', component.type, component.settings);
        
        return (
          <Component
            key={component.id}
            {...component.settings}
          />
        );
      })}
    </>
  );
};
