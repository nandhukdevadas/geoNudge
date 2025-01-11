import { SignedIn, UserButton, useUser } from '@clerk/nextjs'
import React from 'react'
import Logo from './Logo'



function NavBar() {
  const { user, isSignedIn } = useUser();
  return (
    <nav className='flex w-full items-center justify-between p-4 px-8 h-[60px]'>
      <Logo />
      <div className='flex gap-4 items-center pr-5'>
        {isSignedIn && user && (
          <span className="text-sm font-medium">
            Hi, {user.firstName || "there"}
          </span>
        )}
        

        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  )
}

export default NavBar
