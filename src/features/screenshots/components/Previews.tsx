"use client"
/* eslint-disable @next/next/no-img-element */
import { FC, MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { useScreenshotsStore,  Screenshot } from '@/features/screenshots/store'
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Expand } from 'lucide-react'


interface ScreenshotPreviewsProps {
    screenshots: Screenshot[]
    onScreenshotClick: (index: number) => void;
    imageData: { [key: string]: string }
    isLoading: false
}

export const ScreenshotPreviews: FC<ScreenshotPreviewsProps> = ({ imageData, onScreenshotClick, isLoading }) => {
    const { screenshots } = useScreenshotsStore()
    
    if (Array.isArray(screenshots) && screenshots.length > 0) {
        return (
            <>

                {
                    screenshots.map((screenshot, i) => (

                        <Card
                            key={screenshot.id}
                            className='cursor-pointer'
                            onClick={() => onScreenshotClick(i)}>

                            <CardContent>

                                {imageData[screenshot.imageKey] ? (
                                    <img
                                        className="hover:opacity-80 transition-opacity"
                                        alt={`${screenshot.id}-${screenshot.position.name}`}
                                        src={`data:image/png;base64,${imageData[screenshot.imageKey]}`}
                                    />
                                ) : (
                                    <div>Loading...</div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                }
            </>
        )
    }
    if (isLoading) return (
        <p className='text-muted-foreground text-sm'>Loading...</p>
    )
    return (
        <p className='text-muted-foreground text-sm'>No Screenshots Taken...</p>
    )
}

interface PreviewControlsProps {
    onExpand: (e: MouseEvent) => void
}

export const PreviewControls: FC<PreviewControlsProps> = ({ onExpand }) => {
    const { clearScreenshots } = useScreenshotsStore()
    return (
        <>
            <div className='w-full flex flex-row justify-evenly gap-2'>
                <Button className='w-full' onClick={onExpand}>
                    <Expand className='w-4 h-4' />  Preview
                </Button>
                <Button className='w-full' variant="destructive" onClick={clearScreenshots}>
                    Clear <Trash2 className='w-4 h-4' />
                </Button>
            </div>
        </>
    )
}