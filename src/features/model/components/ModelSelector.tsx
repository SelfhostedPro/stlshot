import { FC, useEffect, useState } from "react";

import { useModelStore, getModelThumbnail } from '@/features/model/store'
import { ThumbnailCarousel } from '@/components/CarouselThumbs'
const ModelSelector: FC = () => {
    const { models, selectedModel, selectModel, deleteModel } = useModelStore();
    const [thumbnailData, setThumbnailData] = useState<{ [key: string]: string }>({});


    useEffect(() => {
        // Load all images
        models.forEach(async (model) => {
            const image = await getModelThumbnail(model.thumbnailKey);
            setThumbnailData(prev => ({
                ...prev,
                [model.thumbnailKey]: image
            }));
        });
    }, [models]);

    return (
        <>
            {Object.values(thumbnailData).length > 0 &&
                <ThumbnailCarousel<string>
                    className="h-full"
                    containerClassName="w-full"
                    showName
                    selected={(id) => id == selectedModel?.id}
                    handleSelect={(id) => selectModel(String(id))}
                    imageData={models.map((model) => ({
                        name: model.name,
                        data: thumbnailData[model.thumbnailKey],
                        id: model.id
                    }))}
                    onTrashClicked={(id) => deleteModel(id)}
                />
            }
        </>
    )
}

export { ModelSelector }