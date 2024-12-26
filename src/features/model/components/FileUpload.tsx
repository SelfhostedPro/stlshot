"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { UploadIcon } from "lucide-react"
import { useModelStore } from '@/features/model/store'

export function FileUpload() {
    const uploadModel = useModelStore(state => state.uploadModel)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleClick = () => {
        inputRef.current?.click()
    }

    return (
        <div className="flex flex-col gap-2">
            <Button
                onClick={handleClick}
                variant="outline"
                className="w-full"
            >
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload File
            </Button>
            <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept=".stl"
                onChange={uploadModel}
            />
            {/* {error && (
                <p className="text-sm text-red-500">{error}</p>
            )} */}
        </div>
    )
}
