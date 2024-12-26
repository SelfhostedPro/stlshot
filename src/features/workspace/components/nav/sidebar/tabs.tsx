import { SceneManager } from "./scene-manager"
import { ScreenshotSidebar } from "./screenshots"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ReactNode, useState } from "react"
import { SettingsSidebar } from './settings'

interface SidebarTab {
    name: string,
    component: ReactNode
}

const SidebarTabList: SidebarTab[] = [
    { name: 'screenshots', component: <ScreenshotSidebar /> },
    { name: 'settings', component: <SettingsSidebar /> },
    { name: 'scene', component: <SceneManager /> }
]


const SidebarTabs = () => {
    const [activeTab, setActiveTab] = useState<SidebarTab['name']>('scene')
    return (
        <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            defaultValue='components'
        >
            <TabsList className='flex items-stretch flex-row gap-4 justify-stretch w-full h-12 shrink-0 border-b'>
                {SidebarTabList.map((tab) => (
                    <TabsTrigger key={tab.name} value={tab.name} asChild>
                        <div className='w-full'>
                            {tab.name}
                        </div>
                    </TabsTrigger>
                ))}
            </TabsList>
            <TabsContent
                className="flex-1 min-h-0 h-full" // min-h-0 allows flex child to shrink below content size
                value={activeTab}
            >
                {SidebarTabList.find(tab => tab.name === activeTab)?.component}
            </TabsContent>
        </Tabs>
    )
}

export { SidebarTabs }
