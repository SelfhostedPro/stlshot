import { Button } from "@/components/ui/button"
import { useModelStore } from "@/features/model/store"
import { useComponentStore } from '@/features/scene/store/components'
import { useSceneSettingsStore } from '@/features/scene/store/settings'
import { useScreenshotsStore } from "@/features/screenshots/store"



export const SettingsSidebar = () => {

    const resetScene = useSceneSettingsStore(state => state.reset)
    const resetComponents = useComponentStore(state => state.initializeDefaultScene)

    const resetModels = useModelStore(state => state.resetModels);
    const resetScreenshots = useScreenshotsStore(state => state.clearScreenshots)

    return (
        <div className="flex flex-col w-full gap-2 px-2">
            <Button variant='destructive' onClick={() => resetScene()}>
                Reset Scene
            </Button>
            <Button variant='destructive' onClick={() => resetComponents()}>
                Reset Components
            </Button>
            <Button variant='destructive' onClick={() => resetModels()}>
                Reset Models
            </Button>
            <Button variant='destructive' onClick={() => resetScreenshots()}>
                Reset Screenshots
            </Button>
        </div>
    )
}