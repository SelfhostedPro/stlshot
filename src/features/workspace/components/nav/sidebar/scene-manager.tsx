// src/features/workspace/components/nav/sidebar/component-manager.tsx
import { useComponentStore } from "@/features/scene/store/components"
import { CameraSettings, CanvasSettings, SceneComponent, SettingControlType } from '@/features/scene/types'
import { componentTypes } from '@/features/scene/registry/components'
import { FC, useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useModelStore } from "@/features/model/store"
import { useSceneSettingsStore } from "@/features/scene/store/settings"
import { ChevronRight, RotateCcw } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"


const typeFromLabel: Record<string, SettingControlType> = {
    'opacity': { type: 'slider', max: 1, min: 0, step: 0.01 },
    'scale': { type: 'slider', max: 10, min: 0, step: 0.01 }
}


// Helper function to determine control type
const inferControlType = (value: unknown, label?: string): SettingControlType => {
    if (label && typeFromLabel[label]) return typeFromLabel[label]

    if (Array.isArray(value) && value.every(v => typeof v === 'number')) {
        return {
            type: 'slider-array',
            dimensions: value.length,
            min: -Math.PI, // Default range for angles
            max: Math.PI,
            step: 0.01,
            formatDisplay: (v: number) => `${Math.round((v * 180) / Math.PI)}°`
        };
    }

    switch (typeof value) {
        case 'number':
            return {
                type: 'slider',
                min: 0,
                max: 100,
                step: 0.1
            };
        case 'boolean':
            return {
                type: 'checkbox'
            };
        case 'string':
            return value.startsWith('#') || value.match(/^#([0-9A-F]{3}){1,2}$/i)
                ? { type: 'color' }
                : { type: 'text' };
        default:
            return { type: 'text' };
    }
};

interface SettingControlProps {
    value: unknown;
    onChange: (value: unknown) => void;
    control?: SettingControlType;
    label?: string
}

const SettingControl: FC<SettingControlProps> = ({
    value,
    onChange,
    control: providedControl,
    label
}) => {
    const control = providedControl ?? inferControlType(value, label);

    switch (control.type) {
        case 'slider': {
            return (
                <Slider
                    value={[value as number]}
                    min={control.min || 0}
                    max={control.max || 100}
                    step={control.step || 1}
                    onValueChange={(val) => onChange(val[0])}
                />
            );
        }
        case 'slider-array': {
            const values = value as number[];
            return (
                <div className="space-y-2">
                    {Array.from({ length: control.dimensions }).map((_, index) => (
                        <div key={index}>
                            {control.formatDisplay && (
                                <span className="min-w-[4rem] text-sm text-right">
                                    {control.dimensions === 3 ? ['x', 'y', 'z'][index] : ['min', 'max'][index]}: {control.formatDisplay(values[index])}
                                </span>
                            )}
                            <Slider
                                value={[values[index]]}
                                min={control.min}
                                max={control.max}
                                step={control.step}
                                onValueChange={(newValue) => {
                                    const newValues = [...values];
                                    newValues[index] = newValue[0];
                                    onChange(newValues);
                                }}
                            />
                        </div>
                    ))}
                </div>
            );
        }
        case 'number-pair': {
            const values = value as [number, number]
            return (
                <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-700">{control.label}</label>
                    <div className="flex gap-4">
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500">{control.labels[0]}</label>
                            <input
                                type="number"
                                min={control.min}
                                max={control.max}
                                step={control.step}
                                value={values[0]}
                                onChange={(e) => onChange([Number(e.target.value), values[1]])}
                                className="w-24 px-2 py-1 border rounded"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs text-gray-500">{control.labels[1]}</label>
                            <input
                                type="number"
                                min={control.min}
                                max={control.max}
                                step={control.step}
                                value={values[1]}
                                onChange={(e) => onChange([values[0], Number(e.target.value)])}
                                className="w-24 px-2 py-1 border rounded"
                            />
                        </div>
                    </div>
                </div>
            )
        }
        case 'checkbox': {
            return (
                <Checkbox
                    checked={value as boolean}
                    onCheckedChange={(checked) => onChange(checked)}
                />
            );
        }
        case 'color': {
            return (
                <Input
                    type="color"
                    value={value as string}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
        }
        case 'number': {
            return (
                <Input
                    type="number"
                    value={value as number}
                    min={control.min || 0}
                    max={control.max || 100}
                    step={control.step || 1}
                    onChange={(e) => onChange(Number(e.target.value))}
                />
            );
        }
        default: {
            return (
                <Input
                    type="text"
                    value={value as string}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
        }
    }
};

interface RenderComponentProps {
    component: SceneComponent
}
const RenderComponent: FC<RenderComponentProps> = ({ component }) => {
    const {
        removeComponent,
        updateComponent,
        addComponent,
        components
    } = useComponentStore();

    const childComponents = components.filter(c => c.parentId === component.id);
    const componentConfig = componentTypes[component.type];
    const allowedChildren = componentConfig?.allowedChildren || [];

    const handleSettingChange = (key: string, value: unknown) => {
        updateComponent(component.id, {
            settings: {
                [key]: value
            }
        });
    };

    const [expanded, setExpanded] = useState(false)

    return (
        <Card>
            <Collapsible open={expanded} onOpenChange={setExpanded} >
                <CardHeader>
                    <CollapsibleTrigger asChild>
                        <CardTitle className="flex justify-between items-center cursor-pointer">
                            <div className="flex flex-row items-center">
                                <ChevronRight className={cn("transition-transform duration-200", expanded ? 'rotate-90' : '')} />
                                <span>{componentConfig?.name || component.type}</span>
                            </div>
                            {!component.isCore && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeComponent(component.id)}
                                >
                                    Remove
                                </Button>
                            )}
                        </CardTitle>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            {Object.entries(component.settings).map(([key, value]) => {
                                const control = componentConfig?.settingControls?.[key];

                                return (
                                    <div key={key} className="space-y-2">
                                        <div className="flex flex-row justify-between">
                                            <Label>{key}</Label>
                                            {typeof value !== ('boolean') && !Array.isArray(value) && <Label>{String(value)}</Label>}
                                            {typeof value === 'boolean' &&
                                                <SettingControl
                                                    value={value}
                                                    onChange={(newValue) => handleSettingChange(key, newValue)}
                                                    control={control} // This can now be undefined
                                                    label={key}
                                                />
                                            }
                                        </div>
                                        {typeof value !== 'boolean' && <SettingControl
                                            value={value}
                                            onChange={(newValue) => handleSettingChange(key, newValue)}
                                            control={control} // This can now be undefined
                                            label={key}
                                        />}
                                    </div>
                                );
                            })}
                        </div>

                        {allowedChildren.length > 0 && (
                            <div className="mt-4">
                                <Label>Effects</Label>
                                <div className="flex gap-2 flex-wrap mt-2">
                                    {allowedChildren.map((childType) => (
                                        <Button
                                            key={childType}
                                            onClick={() => addComponent(childType, component.id)}
                                            // disabled={childComponents.some(c => c.type === childType)}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Add {componentTypes[childType]?.name || childType}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {childComponents.length > 0 && (
                            <div className="mt-4 space-y-4">
                                {childComponents.map(child => (
                                    <RenderComponent key={child.id} component={child} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};
export const SceneManager = () => {
    const { components, initializeDefaultScene } = useComponentStore()

    const { camera, canvas, resetCore, updateCamera, updateCanvas } = useSceneSettingsStore()
    const { selectedModel, updateModel } = useModelStore();

    const handleSaveSettings = useCallback(() => {
        if (selectedModel) {
            updateModel(selectedModel.id, {
                settings: {
                    camera,
                    canvas,
                },
                components: components
            });
        }
    }, [camera, canvas, components, selectedModel, updateModel]);

    return (
        <ScrollArea className="h-screen">
            <div className="max-h-[90vh] flex flex-col gap-2 p-4 pt-0 pb-20 space-y-5">
                <div className="flex flex-row gap-2">
                    <Button
                        className="w-full"
                        variant="default"
                        onClick={handleSaveSettings}
                        disabled={!selectedModel}
                    >
                        Save Settings
                    </Button>
                    <Button className="w-full" variant="destructive" onClick={() => initializeDefaultScene()}>
                        <RotateCcw /> reset
                    </Button>
                </div>

                {/* Camera Settings */}
                <SettingsSection<CameraSettings>
                    title="Camera"
                    settings={camera}
                    controls={{
                        fov: { type: 'slider', min: 1, max: 180, step: 1 },
                        near: { type: 'slider', min: 0.1, max: 50, step: 0.1 },
                        far: { type: 'slider', min: 100, max: 2000, step: 100 },
                        zoom: { type: 'slider', min: 0.1, max: 10, step: 0.1 },
                        position: {
                            type: 'slider-array',
                            dimensions: 3,
                            min: -200,
                            max: 200,
                            step: 0.1,
                            formatDisplay: (v) => `${v}`
                        },
                    }}

                    onSettingChange={(key, value) =>
                        updateCamera({ [key]: value })
                    }
                />

                {/* Canvas Settings */}
                <SettingsSection<Partial<CanvasSettings>>
                    title="Canvas"
                    settings={canvas}
                    controls={{
                        dpr: {
                            type: 'slider-array',
                            dimensions: 2,
                            min: 1,
                            max: 100,
                            step: 0.1,
                            label: 'Device Pixel Ratio Range',
                            formatDisplay: (value: number) => `${value}x`
                        },
                        shadows: {
                            type: 'checkbox',
                            label: 'Shadows'
                        },
                        frameloop: {
                            type: 'text',  // Could be changed to a select/dropdown
                            label: 'Frame Loop'
                        },
                        flat: {
                            type: 'checkbox',
                            label: 'Flat'
                        },
                        linear: {
                            type: 'checkbox',
                            label: 'Linear'
                        },
                        orthographic: { type: 'checkbox' }
                    }}
                    onSettingChange={(key, value) => {
                        updateCanvas({ [key]: value })
                    }}
                />

                {components
                    .filter(c => !c.parentId)
                    .map((component) => (
                        <RenderComponent key={component.id} component={component} />
                    ))}
            </div>
        </ScrollArea>
    )
}

interface SettingsSectionProps<T extends Record<string, any>> {
    title: string;
    settings: T;
    controls?: Partial<Record<keyof T, SettingControlType>>;
    onSettingChange: (key: keyof T, value: unknown) => void;
}


const SettingsSection = <T extends Record<string, any>>({
    title,
    settings,
    controls,
    onSettingChange
}: SettingsSectionProps<T>) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card>
            <Collapsible open={expanded} onOpenChange={setExpanded}>
                <CardHeader>
                    <CollapsibleTrigger asChild>
                        <CardTitle className="flex justify-between items-center cursor-pointer">
                            <div className="flex flex-row items-center">
                                <ChevronRight className={cn("transition-transform duration-200", expanded ? 'rotate-90' : '')} />
                                <span>{title}</span>
                            </div>
                        </CardTitle>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            {Object.entries(settings).map(([key, value]) => {
                                const control = controls?.[key];

                                return (
                                    <div key={key} className="space-y-2">
                                        <div className="flex flex-row justify-between">
                                            <Label>{key}</Label>
                                            {typeof value !== ('boolean') && !Array.isArray(value) &&
                                                <Label>{String(value)}</Label>
                                            }
                                            {typeof value === 'boolean' &&
                                                <SettingControl
                                                    value={value}
                                                    onChange={(newValue) => onSettingChange(key, newValue)}
                                                    control={control}
                                                    label={key}
                                                />
                                            }
                                        </div>
                                        {typeof value !== 'boolean' &&
                                            <SettingControl
                                                value={value}
                                                onChange={(newValue) => onSettingChange(key, newValue)}
                                                control={control}
                                                label={key}
                                            />
                                        }
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};