import { CollectionColors } from '@/lib/constants';
import {z} from 'zod';

export const createCollectionSchema = z.object({
    name: z.string().min(1, {
        message: "Collection should have name of atleast 1 character."
    }),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        message: "Color must be a valid hex code (e.g., #FFFFFF or #FFF).",
      })
      
})


export type createCollectionSchemaType = z.infer<typeof createCollectionSchema>

