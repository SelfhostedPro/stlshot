import { Button } from "@/components/ui/button";
import { useScreenshotsStore } from "../store";
import { createAndDownloadZip } from "@/lib/files";


export const ScreenshotControls = () => {
    const {
        screenshots,
        captureInProgress,
        startCapture
    } = useScreenshotsStore();

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                {/* Capture Controls */}
                <Button
                    onClick={() => startCapture('single')}
                    disabled={captureInProgress}
                >
                    Capture Current View
                </Button>
                <Button
                    onClick={() => startCapture('all')}
                    disabled={captureInProgress}
                >
                    {captureInProgress ? 'Capturing...' : 'Capture All Views'}
                </Button>
                <Button onClick={() => startCapture('all-models')} disabled={captureInProgress}>
                    {captureInProgress ? 'Capturing...' : 'Capture All Models'}
                </Button>
                <Button onClick={() => createAndDownloadZip(screenshots)}>
                    Download All
                </Button>
            </div>
        </div>
    );
}