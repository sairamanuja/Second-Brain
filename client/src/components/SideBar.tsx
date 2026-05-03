import { Logo } from "../icons/Logo";
import { TwitterIcon } from "../icons/TwitterIcon";
import { YoutubeIcon } from "../icons/YoutubeIcon";
import { SideBarItems } from "./SideBarItems";
import { DocumentIcon } from "../icons/DocumentIcon";
import React, { useState } from 'react';
import { Bars3Icon as MenuIcon, XMarkIcon as XIcon } from "@heroicons/react/24/outline";

interface SideBarProps {
  onSelectType: (type: string) => void;
  onAskBrain?: () => void;
  desktopOpen: boolean;
  onDesktopToggle: () => void;
}

export const SideBar: React.FC<SideBarProps> = ({ onSelectType, onAskBrain, desktopOpen, onDesktopToggle }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleTypeSelect = (type: string) => {
    onSelectType(type);
    if (window.innerWidth < 768) setMobileOpen(false);
  };

  return (
    <>
      {/* mobile hamburger — only when mobile sidebar is closed */}
      {!mobileOpen && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon className="h-6 w-6 text-gray-700" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`h-screen bg-gradient-to-b from-white via-purple-50 to-pink-50 border-r border-purple-200 w-72 fixed left-0 top-0 pl-6 pr-6 transition-all duration-300 z-40 shadow-xl
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${desktopOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}`}
      >
        <div className="flex text-2xl pt-8 items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => handleTypeSelect("")}>
            <div className="pr-2 text-purple-600">
              <Logo />
            </div>
            <p className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Second Brain</p>
          </div>
          {/* close button — mobile and desktop */}
          <button
            className="p-1 rounded-md hover:bg-purple-100 transition-all"
            onClick={() => {
              setMobileOpen(false);
              if (window.innerWidth >= 768) onDesktopToggle();
            }}
          >
            <XIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <div className="pt-8 pl-4">
          <SideBarItems text="Twitter" icon={<TwitterIcon />} onclick={() => handleTypeSelect('twitter')} />
          <SideBarItems text="Youtube" icon={<YoutubeIcon />} onclick={() => handleTypeSelect('youtube')} />
          <SideBarItems text="Document" icon={<DocumentIcon />} onclick={() => handleTypeSelect('document')} />
        </div>

        <div className="absolute bottom-8 left-6 right-6">
          <button
            onClick={() => { onAskBrain?.(); if (window.innerWidth < 768) setMobileOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-sm hover:opacity-90 transition-all shadow-lg"
          >
            <span className="text-lg">🧠</span>
            Ask your brain
          </button>
        </div>
      </div>

      {/* mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};
