"use client";

import { Collection, Task } from "@prisma/client";
import React, { useMemo, useState, useTransition } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { CaretDownIcon, CaretUpIcon, TrashIcon } from "@radix-ui/react-icons";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { CirclePlus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { deleteCollection } from "@/actions/collection";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import CreateTaskDialog from "./CreateTaskDialog";
import TaskCard from "./TaskCard";

interface Props {
    collection: Collection & {
        tasks: Task[];
    };
}

function CollectionCard({ collection }: Props) {
    const [isOpen, setIsOpen] = useState(true);
    const router = useRouter();

    const [isLoading, startTransition] = useTransition();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const totalTasks = collection.tasks.length;

    const tasksDone = useMemo(() => {
        return collection.tasks.filter((task) => task.done).length;
    }, [collection]);

    const progress = totalTasks === 0 ? 0 : Math.round((tasksDone / totalTasks) * 100);

    const removeCollection = async () => {
        try {
            await deleteCollection(collection.id);
            toast({
                title: "Success",
                description: "Collection deleted successfully",
            });
            router.refresh();
        } catch {
            toast({
                title: "Error",
                description: "Couldn't delete the collection",
                variant: "destructive",
            });
        }
    };
    

    return (
        <>
            <CreateTaskDialog
                open={showCreateModal}
                setOpen={setShowCreateModal}
                collection={collection}
            />

            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant={"ghost"}
                        className={cn("flex w-full justify-between p-6", isOpen && "rounded-b-none")}
                        style={{
                            backgroundColor: collection.color,
                        }}
                    >
                        <span className="text-white font-bold">{collection.name}</span>
                        {!isOpen && <CaretDownIcon />}
                        {isOpen && <CaretUpIcon />}
                    </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="flex rounded-b-md flex-col dark:bg-neutral-900 shadow-lg overflow-hidden">
                    {collection.tasks.length === 0 ? (
                        <Button
                            variant={"ghost"}
                            className="flex flex-col items-center justify-center gap-1 p-8 py-12 rounded-none"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <p>No tasks available</p>
                            <span
                                className={cn("text-sm bg-clip-text text-transparent font-bold")}
                                style={{
                                    background: collection.color,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                Add a new task
                            </span>
                        </Button>
                    ) : (
                        <>
                            <Progress className="rounded-none" value={progress} />
                            <div className="p-4 gap-3 flex flex-col">
                                {collection.tasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}

                                    />
                                ))}
                            </div>

                        </>
                    )}

                    <Separator />

                    <footer className="h-[40px] px-4 p-[2px] text-xs text-neutral-500 flex justify-between items-center">
                        <p>Created at {new Date(collection.createdAt).toDateString()}</p>
                        {isLoading && <div> Deleting.. </div>}
                        {!isLoading && (
                            <div className="flex gap-2">
                                <Button size={"icon"} variant={"ghost"} onClick={() => setShowCreateModal(true)}>
                                    <CirclePlus />
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size={"icon"} variant={"ghost"}>
                                            <TrashIcon />
                                        </Button>
                                    </AlertDialogTrigger>

                                    <AlertDialogContent>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action will permanently delete your collection and all associated tasks. Please note that this action is irreversible.
                                        </AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => {
                                                    startTransition(removeCollection);
                                                }}
                                            >
                                                Proceed
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </footer>
                </CollapsibleContent>
            </Collapsible>
        </>
    );
}

export default CollectionCard;
