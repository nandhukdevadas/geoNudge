import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { HeartCrack } from 'lucide-react';
import CreateCollectionBtn from "@/components/CreateCollectionBtn";
import CollectionCard from "@/components/CollectionCard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default async function Home() {
  return (
    <div>
      <ToastContainer />
    <Suspense fallback={<WelcomeMsgFallback/>}>
      <WelcomeMsg/>
    </Suspense>
    <Suspense fallback={<div>Loading Collections..</div>}>
      <CollectionList/>
    </Suspense>
    </div>
  );
}

async function WelcomeMsg()
{
  const user = await currentUser();

  if(!user)
  {
    return <div>error</div>;
  }

  return (
    <div className="flex w-full justify-start mb-12">
      <span className="text-2xl font-bold pr-2">Let's get started.</span> <CreateCollectionBtn/>
    </div>
  );
}

function WelcomeMsgFallback()
{
  return (
    <div className="flex w-full justify-start mb-12">
      <Skeleton/>
    </div>
  );
}

async function CollectionList()
{
  const user = await currentUser();
  const collections = await prisma.collection.findMany({
    include: {
      tasks: {
        include: {
          location: true, 
        },
      },
    },
    where: {
      userId: user?.id,
    },
  });
  

  if(collections.length === 0)
  {
    return(
      <div className="flex flex-col gap-5">
      <Alert>
        <HeartCrack/>
        <AlertTitle>
          There are no collections yet.
        </AlertTitle>
        <AlertDescription>
          Create collection to get started.
        </AlertDescription>
      </Alert>
      </div>
    );
  }

  return(
    <>
    <div className="flex flex-col gap-4 mt-6">
        {collections.map(collection => (
        <CollectionCard key={collection.id} collection={collection} />
        ))}
    </div>
          
    </>
  )
}
