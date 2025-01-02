import { PreviewControls } from "@/features/screenshots/components/Previews"
import { ScreenshotViewer } from "@/features/screenshots/components/ScreenshotViewer"
import { getScreenshotImageData, useScreenshotsStore } from "@/features/screenshots/store"
import { FC, useEffect, useState } from "react"
import { ThumbnailCarousel } from "@/components/CarouselThumbs"
import { ScreenshotControls } from "@/features/screenshots/components/ScreenshotControls"

const ScreenshotSidebar: FC = () => {
    const { screenshots, deleteScreenshot, captureInProgress } = useScreenshotsStore()
    const [viewerOpen, setViewerOpen] = useState<{ open: boolean; index: number }>({
        open: false,
        index: 0
    });
    const [imageData, setImageData] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (captureInProgress) return;
        // Load all images
        screenshots.forEach(async (screenshot) => {
            const image = await getScreenshotImageData(screenshot.imageKey);
            setImageData(prev => ({
                ...prev,
                [screenshot.imageKey]: image
            }));
        });
    }, [screenshots, captureInProgress]);


    return (
        <div className="flex flex-col gap-4 justify-between p-2 mb-10">
            <PreviewControls onExpand={() => setViewerOpen({ open: true, index: 0 })} />
            <div className='mx-1.5 border rounded-xl border-border w-full flex-shrink max-h-[50vh]'>
                {screenshots.length < 1 ? (<span className="block w-full text-center text-muted-foreground">
                    No screenshots yet
                </span>) : captureInProgress ? (<p className="text-muted-foreground text-sm">Capturing Screenshots...</p>) : (
                    <ThumbnailCarousel<number>
                        // className="full"
                        containerClassName="w-full"
                        orientation="vertical"
                        handleSelect={(id) => setViewerOpen({ open: true, index: id })}
                        imageData={screenshots.map((screenshot, i) => ({
                            name: screenshot.id,
                            data: `data:image/png;base64,${imageData[screenshot.imageKey]}`,
                            id: i
                        }))}
                        onTrashClicked={(id) => deleteScreenshot(id)}
                    />
                )}
            </div>
            <ScreenshotControls />
            <ScreenshotViewer
                screenshots={screenshots}
                imageData={imageData}
                initialIndex={viewerOpen.index || 0}
                open={viewerOpen.open}
                onOpenChange={() => setViewerOpen({ open: false, index: 0 })}
            />
        </div>
    )
}

export { ScreenshotSidebar }