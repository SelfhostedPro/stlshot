'use client'

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { FC, ReactNode, useRef, useState } from "react"
import { ModelSelector } from '@/features/model/components/ModelSelector'
import { SidebarTabs } from './sidebar/tabs'
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { ImperativePanelHandle } from "react-resizable-panels"
import { FileUpload } from '@/features/model/components/FileUpload'

interface WorkspaceLayoutProps {
    children: ReactNode
}

const WorkspaceLayout: FC<WorkspaceLayoutProps> = ({ children }) => {
    const [isTopCollapsed, setIsTopCollapsed] = useState(true)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
    const topPanelRef = useRef<ImperativePanelHandle>(null)
    const sidebarRef = useRef<ImperativePanelHandle>(null)

    const expandPanel = (size: number, _panel: 'top' | 'sidebar') => {
        if (_panel === 'top') {
            topPanelRef.current?.resize(size)
            setIsTopCollapsed(false)
        } else {
            sidebarRef.current?.resize(size)
            setIsSidebarCollapsed(false)
        }
    }
    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="w-screen h-screen"
            onLayout={(sizes: number[]) => {
                document.cookie = `react-resizable-panels:layout:horizontal=${JSON.stringify(
                    sizes
                )}`
            }}
        >
            <ResizablePanel defaultSize={75}>
                <ResizablePanelGroup
                    direction="vertical"
                    onLayout={(sizes: number[]) => {
                        document.cookie = `react-resizable-panels:layout:vertical=${JSON.stringify(
                            sizes
                        )}`
                    }}
                >
                    {/* Header */}
                    <ResizablePanel
                        defaultSize={20} maxSize={25} minSize={15}
                        ref={topPanelRef}
                        collapsedSize={5}
                        collapsible={true}
                        onCollapse={() => {
                            setIsTopCollapsed(true)
                        }}
                        onResize={() => {
                            setIsTopCollapsed(false)
                        }}
                        className={cn(
                            "min-w-[50px] transition-all duration-300 ease-in-out"
                        )}
                    >
                        <div className="w-full h-full flex items-center justify-center">
                            {isTopCollapsed ? (
                                <div className="w-full flex flex-col items-center py-2 cursor-s-resize" onClick={() => expandPanel(20, 'top')}>
                                    <span className="text-sm text-muted-foreground"> Model Previews</span>
                                    <div className="flex flex-row">
                                        {[0, 1, 2].map((i) => (
                                            <ChevronDown key={i} className="w-3 h-3 fill-muted-foreground" />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <ModelSelector />
                            )}
                        </div>
                    </ResizablePanel>
                    <ResizableHandle />
                    {/* Main */}
                    <ResizablePanel defaultSize={80}>
                        {children}
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle />
            {/* Sidebar */}
            <ResizablePanel
                defaultSize={25}
                maxSize={50} minSize={15}
                ref={sidebarRef}
                collapsedSize={5}
                collapsible={true}
                onCollapse={() => {
                    setIsSidebarCollapsed(true)
                }}
                onResize={() => {
                    setIsSidebarCollapsed(false)
                }}
            >
                {
                    isSidebarCollapsed ? (
                        <div></div>
                    ) :
                        (
                            <>
                                <FileUpload />
                                <SidebarTabs />
                            </>
                        )
                }
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}

export { WorkspaceLayout }