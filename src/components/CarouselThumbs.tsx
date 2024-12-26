import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselOptions } from "@/components/ui/carousel";
import { CardContent, Card, CardTitle, CardDescription } from "@/components/ui/card";
import Image from 'next/image'
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

interface ImageData<T extends string | number = string> {
    name: string;
    data: string;
    id: T;
    index?: number;
}

interface ThumbnailCardProps<T extends string | number = string> {
    imageData: ImageData<T>;
    onClick?: () => void;
    onTrashClick?: (id: string) => void;
    showName?: boolean
    className?: string;
    showTrashButton?: boolean;
    index: number
    count: number
}

const ThumbnailCard = <T extends string | number = string>({
    imageData,
    className,
    onClick,
    onTrashClick,
    index,
    count,
    showName = false,
    showTrashButton = true
}: ThumbnailCardProps<T>) => (
    <Card className={cn("relative w-full overflow-hidden", className)}>
        <div className="px-1 w-full flex flex-row justify-between items-center">
            {showName && <CardDescription className="w-full text-start">
                {imageData.name}
            </CardDescription>}
            {showTrashButton && onTrashClick && (
                <Button
                    className="z-10 opacity-70 hover:opacity-100"
                    onClick={() => onTrashClick(imageData.name)}
                >
                    <Trash2 />
                </Button>
            )}
            <Button className="z-10 opacity-70 hover:opacity-100">
                {index + 1}/{count}
            </Button>
        </div>
        <CardContent
            className="p-0 cursor-pointer relative flex flex-col w-full h-full"
            onClick={onClick}
        >
            {imageData.data ? (
                <Image
                    width={0}
                    height={0}

                    alt={imageData.name}
                    src={imageData.data}
                    sizes="100vw"
                    className="w-full h-full"
                />
            ) : (
                <CardTitle>{imageData.name}</CardTitle>
            )}
        </CardContent>
    </Card>
);


interface CarouselThumbnailProps<T extends string | number> {
    imageData: ImageData<T>[];
    selected?: (id: T) => boolean;
    handleSelect: (id: T) => void;
    containerClassName?: string;
    className?: string;
    onTrashClicked?: (id: string) => void;
    carouselOptions?: CarouselOptions;
    showName?: boolean
    showTrashButton?: boolean;
    orientation?: 'horizontal' | 'vertical';
}

export const ThumbnailCarousel = <T extends string | number>({
    imageData,
    selected,
    handleSelect,
    containerClassName,
    className,
    onTrashClicked,
    carouselOptions = {
        slidesToScroll: 3,
        dragFree: true,
        containScroll: "keepSnaps",
        loop: true,
    },
    showName = false,
    showTrashButton = true,
    orientation = 'horizontal'
}: CarouselThumbnailProps<T>) => {
    const isVertical = orientation === 'vertical';

    return (
        <div className={cn(
            "relative gap-4 h-full w-full",
            containerClassName
        )}>
            <Carousel
                className={cn(
                    "relative",
                    "flex",
                )}
                orientation={isVertical ? 'vertical' : 'horizontal'}

                opts={{
                    ...carouselOptions,
                }}
            >
                <CarouselContent
                    // containerClassName=
                    className={cn(isVertical ? 'max-h-[50vh]' : "max-h-[80vh]")}
                >
                    {imageData?.map((data, i) => (
                        <CarouselItem
                            key={`thumbnail-${data.id || i}`}
                            className={cn(
                                "relative items-center aspect-square py-2 basis-1/6",
                            )}
                        >
                            <ThumbnailCard<T>
                                className={cn(
                                    className,
                                    "aspect-square",
                                    selected && selected(data.id) ? 'drop-shadow-md scale-105' : ''
                                )}
                                index={i}
                                count={imageData.length}
                                showName={showName}
                                imageData={data}
                                onClick={() => handleSelect(data.id)}
                                onTrashClick={onTrashClicked}
                                showTrashButton={showTrashButton}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                {!isVertical ? (
                    <>
                        <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
                        <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
                    </>
                ) : (
                    <>
                        <CarouselPrevious className="absolute top-0 left-1/2 -translate-x-1/2 rotate-90" />
                        <CarouselNext className="absolute bottom-0 left-1/2 -translate-x-1/2 rotate-90" />
                    </>
                )}
            </Carousel>
        </div>
    );
};
