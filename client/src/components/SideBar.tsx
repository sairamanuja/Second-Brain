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
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <XIcon className="h-6 w-6 text-gray-700" />
        ) : (
          <MenuIcon className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`h-screen bg-white border-r w-72 fixed left-0 top-0 pl-6 transition-all duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex text-2xl pt-8 items-center" onClick={() => handleTypeSelect("")}>
          <div className="pr-2 text-purple-600 cursor-pointer">
            <Logo />
          </div>
          <p>Brainly</p>
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
