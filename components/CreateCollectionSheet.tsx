import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { createCollectionSchema, createCollectionSchemaType } from "@/schema/createCollection";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { createCollection } from "@/actions/collection";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateCollectionSheet({ open, onOpenChange }: Props) {
  const form = useForm<createCollectionSchemaType>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      name: "",
      color: "#000000", 
    },
  });

  const router = useRouter();


  const onSubmit = async (data: createCollectionSchemaType) => {
    try {
      await createCollection(data);
  
      openChangeWrapper(false);
      router.refresh();
  
      toast({
        title: "Success",
        description: "Collection created successfully!",
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error("Error creating collection:", e.message);
      }
  
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };
  
  

  const openChangeWrapper = (open: boolean) => {
    form.reset();
    onOpenChange(open);
  };

  return (
    <Sheet open={open} onOpenChange={openChangeWrapper}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Collection</SheetTitle>
          <SheetDescription>
            Collections are a way to group your tasks.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Personal" {...field} />
                  </FormControl>
                  <FormDescription>Collection name</FormDescription>
                </FormItem>
              )}
            />

            {/* Color Field */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel><br/>
                  <FormControl>
                    <input
                      {...field}
                      type="color"
                      className="w-10 h-10 border rounded-md"
                    />
                  </FormControl>
                  <FormDescription>Pick a color for your collection</FormDescription>
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Save Collection
            </button>

            
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

export default CreateCollectionSheet;
