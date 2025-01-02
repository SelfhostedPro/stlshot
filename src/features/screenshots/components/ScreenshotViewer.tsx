"use client"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Screenshot } from '@/features/screenshots/store';
import { FC, useCallback, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "../../../components/ui/carousel";
import { CardContent, Card } from "@/components/ui/card";
import { useEffect } from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import Image from 'next/image'
import { cn } from "@/lib/utils";
import { ThumbnailCarousel } from '@/components/CarouselThumbs'
interface ScreenshotViewerProps {
    screenshots: Screenshot[];
    imageData: Record<string, string>;
    initialIndex?: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface ThumbnailProps {
    screenshot: Screenshot,
    imageData: string,
    onClick?: () => void;
    className?: string
}

const Thumbnail: FC<ThumbnailProps> = ({ screenshot, imageData, className, onClick }: ThumbnailProps) => (
    <Card
        className={cn("max-w-[50vw] max-h-[50vh] aspect-video overflow-hidden",
            className
        )}>
        <CardContent
            className=""
            onClick={() => onClick && onClick()}
        >
            <img
                // height={50}
                // width={50}
                // sizes="30vw"
                alt={`${screenshot.id}-${screenshot.position.name}`}
                src={`data:image/png;base64,${imageData}`}
                className=" w-full h-full"
            />
        </CardContent>
    </Card>
)

export const ScreenshotViewer = ({
    screenshots,
    imageData,
    initialIndex,
    open,
    onOpenChange
}: ScreenshotViewerProps) => {
    const [current, setCurrent] = useState(initialIndex || 0)
    const [api, setApi] = useState<CarouselApi>()

    useEffect(() => {
        if (!api) {
            return
        }

        setCurrent(api.selectedScrollSnap())
        // setDirection(
        //     api.scrollSnapList().indexOf(api.selectedScrollSnap()) - current
        // )

        const onSelect = () => {
            const newIndex = api.selectedScrollSnap()
            setCurrent(newIndex)
        }

        api.on("select", onSelect)

        return () => {
            api.off("select", onSelect)
        }
    }, [api, current])

    const handleSelect = useCallback(
        (index: number) => {
            api?.scrollTo(index)
        },
        [api]
    )

    // const handleNext = () => setCurrentIndex((prev) => (prev + 1) % screenshots.length);
    // const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-[70vw] mx-auto rounded-lg p-2 bg-muted shadow-[0px_1px_1px_0px_rgba(0,0,0,0.05),0px_1px_1px_0px_rgba(255,252,240,0.5)_inset,0px_0px_0px_1px_hsla(0,0%,100%,0.1)_inset,0px_0px_1px_0px_rgba(28,27,26,0.5)]"
            >
                <div className="relative contain-inline-size inset-0">
                    <VisuallyHidden>
                        <DialogTitle>
                            Image Previews
                        </DialogTitle>
                        <DialogDescription>
                            Image Preview Carousel
                        </DialogDescription>
                    </VisuallyHidden>
                    <div className="flex flex-col gap-2">
                        <div className="basis-5/6 relative overflow-hidden rounded-lg aspect-video items-center">
                            <Carousel className="max-w-[50vw] max-h-[50vh] relative flex"
                                setApi={setApi}
                                opts={{
                                    loop: true,
                                }}>
                                <CarouselContent className="max-w-[50vw] max-h-[50vh]">
                                    {screenshots && screenshots.map((screenshot, i) => (
                                        <CarouselItem key={`screenshot-${i}`} className="relative items-center aspect-square py-2">
                                            <Thumbnail screenshot={screenshot} imageData={imageData[screenshot.imageKey]} className="aspect-video" />
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                {/* <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" /> */}
                            </Carousel>
                        </div>
                        <div className="relative gap-4 overflow-x-scroll">
                            {screenshots &&
                                <ThumbnailCarousel<number>
                                    selected={(i) => i === current}
                                    handleSelect={(i) => handleSelect(i)}
                                    // onTrashClicked={(id) => deleteScreenshot(id)}
                                    imageData={screenshots.map((screenshot, i) => ({
                                        name: `${screenshot.modelName}-${screenshot.position}`,
                                        data: `data:image/png;base64,${imageData[screenshot.imageKey]}`,
                                        id: i
                                    }))}
                                />
                            }
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
