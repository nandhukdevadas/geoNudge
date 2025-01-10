"use client";

import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { ComputerIcon, MoonIcon, SunIcon } from 'lucide-react';

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); 
  }, []);

  if (!mounted) return null;
 

  return (
    <Tabs defaultValue={theme}>
      <TabsList className="border dark:border-neutral-800 dark:bg-[#030303]">
        <TabsTrigger value="light" onClick={() => setTheme("light")}><SunIcon /></TabsTrigger>
        <TabsTrigger value="dark" onClick={() => setTheme("dark")}><MoonIcon /></TabsTrigger>
        <TabsTrigger value="system" onClick={() => setTheme("system")}><ComputerIcon /></TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export default ThemeSwitcher;
