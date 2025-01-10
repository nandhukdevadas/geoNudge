"use server";

import prisma from "@/lib/prisma";
import { createTaskSchemaType } from "@/schema/createTask";
import { currentUser } from "@clerk/nextjs/server";

export async function createTask(data: createTaskSchemaType) {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  const { content, expiresAt, collectionId, location } = data;

  // Prepare location data
  const locationData = location
    ? {
      create: {
        latitude: location.latitude,
        longitude: location.longitude,
        radius: location.radius,
      },
    }
    : undefined;

  // Create task with optional location relation
  const task = await prisma.task.create({
    data: {
      userId: user.id,
      content,
      expiresAt,
      location: locationData, // Nested create for location
      Collection: {
        connect: {
          id: collectionId,
        },
      },
    },
  });



  return task;
}

export async function setTaskToDone(id: number) {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found");
  }

  return await prisma.task.update({
    where: {
      id: id,
      userId: user.id
    },
    data: {
      done: true
    }
  })
}

export async function deleteTask(taskId: number) {
  try {
    await prisma.task.delete({
      where: { id: taskId },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, error };
  }
}
