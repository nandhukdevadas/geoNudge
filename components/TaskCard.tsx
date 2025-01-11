"use client";

import { Task, Location } from "@prisma/client";
import React, { useEffect, useState, useTransition } from "react";
import { Checkbox } from "./ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { deleteTask, setTaskToDone } from "@/actions/task";

const locationCache = new Map<string, string>();

async function getAddressFromCoordinates(lat: number, lon: number): Promise<string> {
  const cacheKey = `${lat},${lon}`;

  if (locationCache.has(cacheKey)) {
    return locationCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await response.json();
    const address = data.display_name || "Unknown location";
    locationCache.set(cacheKey, address);
    return address;
  } catch (error) {
    console.error("Error fetching address:", error);
    return "Error retrieving location";
  }
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radius of the Earth in meters
  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function TaskCard({ task}: { task: Task & { location?: Location };}) {
  const [translatedLocation, setTranslatedLocation] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [hasNotified, setHasNotified] = useState(false);
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location updated:", position.coords);
          setCurrentLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });

          if (!hasNotified && task.location) {
            const distance = getDistance(
              position.coords.latitude,
              position.coords.longitude,
              task.location.latitude,
              task.location.longitude
            );
            console.log(`Distance to task location: ${distance} meters`);

            if (distance <= task.location.radius) {
              if (Notification.permission === "granted") {
                new Notification(`Task Nearby`, {
                  body: `You are within the radius for task "${task.content}"!`,
                });
                setHasNotified(true);
              } else if (Notification.permission === "default") {
                Notification.requestPermission().then((permission) => {
                  if (permission === "granted") {
                    new Notification(`Task Nearby`, {
                      body: `You are within the radius for task "${task.content}"!`,
                    });
                    setHasNotified(true);
                  }
                });
              }
            }
          }
        },
        (error) => {
          console.error("Error watching location:", error);
          console.error(`Error code: ${error.code}, Message: ${error.message}`);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [task, hasNotified]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!hasNotified && task.expiresAt && new Date() >= new Date(task.expiresAt)) {
        if (Notification.permission === "granted") {
          new Notification(`Task Due`, {
            body: `Task "${task.content}" is due!`,
          });
          setHasNotified(true);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [task, hasNotified]);

  useEffect(() => {
    if (task.location) {
      getAddressFromCoordinates(task.location.latitude, task.location.longitude).then(
        (address) => {
          setTranslatedLocation(address);
        }
      );
    }
  }, [task.location]);

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deleteTask(task.id);
        router.refresh();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    });
  };

  return (
    <div className="p-4 border rounded-md shadow-md flex gap-4 items-center">
      <Checkbox
        id={task.id.toString()}
        className="w-5 h-5"
        checked={task.done}
        onCheckedChange={async () => {
          await setTaskToDone(task.id);
          router.refresh();
        }}
      />
      <div className="flex-1">
        <label
          htmlFor={task.id.toString()}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 decoration-1 dark:decoration-white",
            task.done && "line-through"
          )}
        >
          <div className="font-medium text-lg">{task.content}</div>

          {/* Display Deadline */}
          {task.expiresAt && (
            <p
              className={cn(
                "text-xs text-neutral-500 dark:text-neutral-400",
                "text-green-500"
              )}
            >
              Deadline: {format(new Date(task.expiresAt), "HH:mm dd/MM/yyyy")}
            </p>
          )}

          {/* Display Translated Location */}
          {task.location && (
            <p className="text-sm text-gray-600">
              Location: {translatedLocation || "Loading location..."}
            </p>
          )}

          {task.location?.radius && (
            <p className="text-sm text-gray-600">Radius: {task.location.radius}m</p>
          )}
        </label>
      </div>
      <button
        className="text-red-500 hover:text-red-700 text-sm font-bold"
        onClick={handleDelete}
        disabled={isLoading}
      >
        Delete
      </button>
    </div>
  );
}

export default TaskCard;
