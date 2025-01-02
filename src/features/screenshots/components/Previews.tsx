"use client"
/* eslint-disable @next/next/no-img-element */
import { FC, MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { useScreenshotsStore,  Screenshot } from '@/features/screenshots/store'
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Expand } from 'lucide-react'
import Image from 'next/image'


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