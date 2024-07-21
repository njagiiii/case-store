'use client'

import React, { useState, useTransition } from 'react'
import { cn } from '@/lib/utils';
import Dropzone,{FileRejection} from 'react-dropzone'
import { Image, Loader2, MousePointerSquareDashed } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

const Upload = () => {
  const { toast } = useToast();
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  

  const { startUpload, isUploading } = useUploadThing('imageUploader', {
    onClientUploadComplete: ([data]) => {
        const configId = data.serverData.configId;
        startTransition(() => {
            router.push(`/configure/design?id=${configId}`);
        });
    },
    onUploadProgress(p) {
        setUploadProgress(p);
    },
});

  const onDropRejected = (rejectedFiles: FileRejection[]) => {
    const [file] = rejectedFiles

    setIsFileUploaded(false)

    // error notification

    toast({
      title: `${file.file.type} type is not supported.`,
      description: "Plese choose a PNG, JPG, JPEG image.",
      variant:"destructive"
    })

  }

  const onDropAccepted = (acceptedFiles: File[]) => {
    startUpload(acceptedFiles, {configId: undefined})

    setIsFileUploaded(false)

  }

 


  return (
    <div className={cn(
      "relative w-full h-full flex flex-col flex-1 items-center justify-center my-16 ring-1 ring-inset ring-gray-900/10 bg-gray-900/5 rounded-xl lg:rounded-2xl",
      {
        'ring-blue-900/25 bg-blue-900/10' : isFileUploaded
      }
    )}>
      {/* upload image */}
     <div className='flex-1 flex flex-col items-center justify-center w-full'>
      <Dropzone 
      onDropRejected={onDropRejected} 
      onDropAccepted={onDropAccepted}
      accept={{
        "image/png" : ['.png'],
        "image/jpg" : ['.jpg'],
        "image/jpeg" : ['.jpeg'],
      }}
      onDragEnter={() => setIsFileUploaded(true)}
      onDragLeave={() => setIsFileUploaded(false)}
      >
       {({getRootProps, getInputProps}) => (
        <div className="h-full w-full flex-1 flex  flex-col items-center justify-center" {...getRootProps()}>
          <input {...getInputProps()}/>

          {/* get the status of the input */}
          {isFileUploaded ? (
            <MousePointerSquareDashed  className='h-6 w-6 text-zinc-500 mb-2'/>
          ) : (
            isUploading || isPending ? (
              <Loader2 className='animate-spin h-6 w-6 text-zinc-500 mb2'/>
            ):(
              <Image className='h-6 w-6 text-zinc mb-2'/>
            )
          )}

          {/* upload the status of the input */}
          <div className='flex flex-col justify-center mb-2 text-sm text-zinc-700'>
                {isUploading ? (
                  <div className='flex flex-col items-center'>
                    <p>Uploading...</p>
                    <Progress
                      value={uploadProgress}
                      className='mt-2 w-40 h-2 bg-gray-300'
                    />
                  </div>
                ) : isPending ? (
                  <div className='flex flex-col items-center'>
                    <p>Redirecting, please wait...</p>
                  </div>
                ) : isFileUploaded ? (
                  <p>
                    <span className='font-semibold'>Drop file</span> to upload
                  </p>
                ) : (
                  <p>
                    <span className='font-semibold'>Click to upload</span> or
                    drag and drop
                  </p>
                )}
              </div>

              {isPending ? null : (
                <p className='text-xs text-zinc-500'>PNG, JPG, JPEG</p>
              )}
            </div>
       )}
      </Dropzone>
     </div>

    </div>
   
  )
}

export default Upload 