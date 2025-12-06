import { Logo } from "../icons/Logo";
import { TwitterIcon } from "../icons/TwitterIcon";
import { YoutubeIcon } from "../icons/YoutubeIcon";
import { SideBarItems } from "./SideBarItems";
import { DocumentIcon } from "../icons/DocumentIcon";
import React, { useState } from 'react';
import { Bars3Icon as MenuIcon, XMarkIcon as XIcon } from "@heroicons/react/24/outline";

interface SideBarProps {
  onSelectType: (type: string) => void;
}

export const SideBar: React.FC<SideBarProps> = ({ onSelectType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleTypeSelect = (type: string) => {
    onSelectType(type);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu button - only show when sidebar is closed */}
      {!isOpen && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
          onClick={() => setIsOpen(true)}
        >
          <MenuIcon className="h-6 w-6 text-gray-700" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`h-screen bg-gradient-to-b from-white via-purple-50 to-pink-50 border-r border-purple-200 w-72 fixed left-0 top-0 pl-6 pr-6 transition-all duration-300 z-40 shadow-xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex text-2xl pt-8 items-center justify-between" onClick={() => handleTypeSelect("")}>
          <div className="flex items-center">
            <div className="pr-2 text-purple-600 cursor-pointer">
              <Logo />
            </div>
            <p className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Brainly</p>
          </div>
          {/* Close button for mobile */}
          <button
            className="md:hidden p-1 rounded-md hover:bg-purple-100"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <XIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>
        <div className="pt-8 pl-4">
          <SideBarItems text="Twitter" icon={<TwitterIcon />} onclick={() => handleTypeSelect('twitter')} />
          <SideBarItems text="Youtube" icon={<YoutubeIcon />} onclick={() => handleTypeSelect('youtube')} />
          <SideBarItems text="Document" icon={<DocumentIcon />} onclick={() => handleTypeSelect('document')} />
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
