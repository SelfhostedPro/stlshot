import { Screenshot, getScreenshotImageData } from '@/features/screenshots/store'
import JSZip from 'jszip';
import { format } from 'date-fns'

async function base64ToPng(base64String: string): Promise<Blob> {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/png;base64,/, '');

    // Convert base64 to binary
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    // Create Blob with PNG mime type
    return new Blob([byteArray], { type: 'image/png' });
}


export async function createAndDownloadZip(screenshots: Screenshot[]) {
    const zip = new JSZip();

    for (const screenshot of screenshots) {
        const imageData = await getScreenshotImageData(screenshot.imageKey);
        const pngBlob = await base64ToPng(imageData);
        const arrayBuffer = await pngBlob.arrayBuffer();

        console.log(screenshot.modelName, screenshot.position.name, arrayBuffer)

        zip.file(`${screenshot.modelName}/${screenshot.position.name}.png`, arrayBuffer, {
            binary: true
        });
    }

    // Generate zip after all files are added
    const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
            level: 6
        }
    });

    // Download the zip
    const zipUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = `${format(new Date(), 'MM-dd-yyyy-HH-mm')}-model-screenshots.zip`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(zipUrl);
}