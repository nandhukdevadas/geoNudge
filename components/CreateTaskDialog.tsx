"use client"
import { Collection } from '@prisma/client';
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { cn } from '@/lib/utils';
import { createTaskSchema, createTaskSchemaType } from '@/schema/createTask';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from './ui/form';
import { Textarea } from './ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { CalendarIcon, ReloadIcon } from '@radix-ui/react-icons';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { Map as PigeonMap, Marker } from 'pigeon-maps';
import { createTask } from '@/actions/task';
import { Toast } from './ui/toast';
import { useRouter } from 'next/navigation';


interface Props {
  open: boolean;
  collection: Collection;
  setOpen: (open: boolean) => void;
}

function CreateTaskDialog({ open, collection, setOpen }: Props) {

  const form = useForm<createTaskSchemaType>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      collectionId: collection.id,
      location: undefined, // Explicitly make location optional
    },
  });
  

  const openChangeWrapper = (value: boolean) => {
    setOpen(value);
    form.reset();
  };

  const router = useRouter();


  const onSubmit = async (data: createTaskSchemaType) => {
    try {
      await createTask(data);
      openChangeWrapper(false);
      router.refresh();

    } catch (error) {
      console.log("Error ho gaya bhai")
    }
  };


  const [locationName, setLocationName] = useState<string>("");

  const fetchLocationName = async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      setLocationName(data.display_name || "Unknown location");
    } catch (error) {
      console.error("Error fetching location:", error);
      setLocationName("Error retrieving location");
    }
  };




  return (
    <Dialog open={open} onOpenChange={openChangeWrapper}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">


        <DialogHeader>
          <DialogTitle className='flex gap-2'>
            Add task to the collection
            <span className={
              cn("p-[1px] bg-clip-text text-transparent")
            }
              style={{
                backgroundColor: collection.color,
              }}
            >{collection.name}</span>
          </DialogTitle>

          <DialogDescription>
            Add task to your collection. You can add as many tasks as you want.
          </DialogDescription>

        </DialogHeader>


        <div className='gap-4 py-4'>

          <Form {...form}>

            <form className='space-y-4 flex flex-col' onSubmit={form.handleSubmit(onSubmit)}>

              {/* Content */}
              <FormField
                control={form.control}
                name='content'
                render={({ field }) =>
                (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder='Add task here'
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Expires at */}
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => {
                  const [selectedHour, setSelectedHour] = useState<number | null>(null); // Hour state
                  const [selectedMinute, setSelectedMinute] = useState<number | null>(null); // Minute state
                  const [tempDate, setTempDate] = useState<Date | null>(null); // Temporary selected date
                  const [finalDateTime, setFinalDateTime] = useState<Date | null>(null); // Confirmed date and time
                  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false); // Manage popover open/close state

                  const confirmDateTime = () => {
                    if (!tempDate || selectedHour === null || selectedMinute === null) {
                      alert("Please select date, hour, and minute before confirming.");
                      return;
                    }

                    const confirmedDateTime = new Date(tempDate);
                    confirmedDateTime.setHours(selectedHour, selectedMinute, 0, 0); // Set hour and minute
                    setFinalDateTime(confirmedDateTime);
                    field.onChange(confirmedDateTime); // Update form state
                    setIsPopoverOpen(false); // Close the popover
                  };

                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Expires At</FormLabel>
                      <FormDescription className="text-sm text-muted-foreground mb-4">
                        When should the task end?
                      </FormDescription>
                      <FormControl>
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "justify-start text-left font-normal w-full py-2 px-4 border rounded-md hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary",
                                !finalDateTime && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                              {finalDateTime
                                ? `${format(finalDateTime, "PPP")} ${String(
                                  finalDateTime.getHours()
                                ).padStart(2, "0")}:${String(
                                  finalDateTime.getMinutes()
                                ).padStart(2, "0")}`
                                : <span>No deadline set</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-4 border rounded-md shadow-lg bg-white dark:bg-neutral-900 w-full max-w-lg">

                            {/* Calendar and Time Picker Layout */}

                            <div className="flex gap-4">
                              {/* Calendar Picker */}
                              <div className="flex-1">
                                <Calendar
                                  mode="single"
                                  selected={tempDate || undefined} // Ensure selected is never null
                                  onSelect={(day) => setTempDate(day || null)} // Convert undefined to null
                                  initialFocus
                                  className="rounded-md border"
                                />
                              </div>

                              {/* Time Picker */}
                              <div className="w-48 flex flex-col items-center gap-4 border-l pl-4">
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                  Time
                                </label>
                                <div className="flex items-center gap-4">
                                  {/* Hour Scroller */}
                                  <div className="flex flex-col items-center">
                                    <span className="text-sm font-medium mb-2">Hour</span>
                                    <div className="overflow-y-auto h-40 w-16 border rounded-md bg-gray-50 dark:bg-neutral-800 dark:text-white">
                                      {[...Array(24)].map((_, hour) => (
                                        <div
                                          key={hour}
                                          className={cn(
                                            "text-center py-2 cursor-pointer hover:bg-primary hover:text-white",
                                            selectedHour === hour && "bg-white text-black rounded p-2 hover:text-black"
                                          )}
                                          onClick={() => setSelectedHour(hour)} // Update selectedHour state
                                        >
                                          <span className="p-2 rounded">
                                            {String(hour).padStart(2, "0")}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Minute Scroller */}
                                  <div className="flex flex-col items-center">
                                    <span className="text-sm font-medium mb-2">Minute</span>
                                    <div className="overflow-y-auto h-40 w-16 border rounded-md bg-gray-50 dark:bg-neutral-800 dark:text-white">
                                      {[...Array(60)].map((_, minute) => (
                                        <div
                                          key={minute}
                                          className={cn(
                                            "text-center py-2 cursor-pointer hover:bg-primary hover:text-white",
                                            selectedMinute === minute && "bg-white text-black rounded p-2 hover:text-black"
                                          )}
                                          onClick={() => setSelectedMinute(minute)} // Update selectedMinute state
                                        >
                                          <span className=" p-2 rounded">
                                            {String(minute).padStart(2, "0")}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                {/* Confirm Button */}
                                <Button
                                  variant="outline"
                                  className="mt-4 w-full"
                                  onClick={confirmDateTime}
                                >
                                  Confirm
                                </Button>
                              </div>

                            </div>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                    </FormItem>
                  );
                }}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => {
                  const [center, setCenter] = useState<[number, number] | null>(null);
                  const [locationLoaded, setLocationLoaded] = useState(false);
                  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

                  useEffect(() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          setCenter([latitude, longitude]);
                          setLocationLoaded(true);
                        },
                        (error) => {
                          console.error("Error obtaining location:", error);
                          setCenter(null); // Default location
                          setLocationLoaded(true);
                        }
                      );
                    } else {
                      console.error("Geolocation is not supported by this browser.");
                      setCenter(null); // Default location
                      setLocationLoaded(true);
                    }
                  }, []);

                  useEffect(() => {
                    const fetchLocationName = async () => {
                      if (field.value && field.value.latitude !== undefined && field.value.longitude !== undefined) {
                        try {
                          const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${field.value.latitude}&lon=${field.value.longitude}`
                          );
                          const data = await response.json();
                          setLocationName(data.display_name || "Unknown location");
                        } catch (error) {

                          setLocationName("Error retrieving location");
                        }
                      } else {

                        setLocationName("Invalid location data");
                      }
                    };

                    fetchLocationName(); // Call the fetch function
                  }, [field.value]);


                  const handleConfirm = () => {
                    if (center) {
                      const updatedLocation = { latitude: center[0], longitude: center[1] };
                      field.onChange(updatedLocation); // Set location
                      setIsPopoverOpen(false);
                    } else {
                      field.onChange(undefined); // Clear location
                    }
                  };


                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Target Location</FormLabel>
                      <FormDescription className="text-sm text-muted-foreground mb-4">
                        Select a location for your reminder.
                      </FormDescription>
                      <FormControl>
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                          <div className="p-4 border rounded-md shadow-lg bg-white dark:bg-neutral-900">
                            {locationLoaded ? (
                              <div className="flex flex-col items-center gap-4">
                                <PigeonMap
                                  height={300}
                                  width={300} // Ensure the map takes up the full width
                                  center={center || [13.0827, 80.2707]}
                                  onBoundsChanged={({ center }) => setCenter(center)}
                                >
                                  {center && <Marker width={50} anchor={center} />}
                                </PigeonMap>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="mt-2 w-full"
                                  onClick={handleConfirm}
                                >
                                  Confirm Location
                                </Button>
                              </div>
                            ) : (
                              <p>Loading map...</p>
                            )}
                          </div>

                          <div
                            className={cn(
                              "justify-start text-left font-normal w-full py-2 px-4 border rounded-md hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {locationName}

                          </div>

                        </Popover>
                      </FormControl>
                    </FormItem>
                  );
                }}
              />

              {/* Radius */}
              <FormField
                control={form.control}
                name="location.radius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Radius</FormLabel>
                    <FormDescription className="text-sm text-muted-foreground mb-4">
                      Select the target radius for your reminder (optional).
                    </FormDescription>
                    <FormControl>
                      <select
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value ? Number(e.target.value) : null;
                          field.onChange(value); // Allow clearing the field
                        }}
                        className="w-full py-2 px-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-neutral-800 dark:text-white"
                      >
                        <option value="">No radius</option>
                        <option value={5}>Small - 5 meters</option>
                        <option value={15}>Medium - 15 meters</option>
                        <option value={100}>Large - 100 meters</option>
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />


            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className={cn("w-full dark:text-white text-white")}
            style={{
              border: `1px solid ${collection.color}`, // Template literal corrected
            }}
            onClick={form.handleSubmit(onSubmit)}
          // disabled={form.formState.isSubmitting} // Optional: Disable button during submission
          >
            Confirm
            {form.formState.isSubmitting && (
              <ReloadIcon className="animate-spin h-4 w-4 ml-2" />
            )}
          </Button>
        </DialogFooter>


      </DialogContent>
    </Dialog>
  )
}

export default CreateTaskDialog