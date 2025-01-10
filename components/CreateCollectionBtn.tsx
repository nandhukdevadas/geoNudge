"use client";
import React, { useState } from 'react'
import { Button } from './ui/button'
import CreateCollectionSheet from './CreateCollectionSheet';

function CreateCollectionBtn() {
  const [open, setOpen] = useState(false);
  const handleOpenChange = (open:boolean) => setOpen(open);

  return (
    <div className='flex flex-grow rounded-md justify-end'>
        <span className='border-2 border-red-500 rounded-md'>
        <Button 
        variant="outline"
        className="dark:text-white dark:bg-neutral-950 bg-white border border-red-500 p-2 text-lg font-poppins"
        onClick={()=>setOpen(true)}
        >
            + Create Collections
        </Button>
        <CreateCollectionSheet open={open} onOpenChange={handleOpenChange} />
      </span>
    </div>
  )
}

export default CreateCollectionBtn
