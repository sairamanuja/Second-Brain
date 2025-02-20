import { Logo } from "../icons/Logo";
import { TwitterIcon } from "../icons/TwitterIcon";
import { YoutubeIcon } from "../icons/YoutubeIcon";
import {SideBarItems } from "./SideBarItems";
import { useState } from "react";
import { DocumentIcon } from "../icons/DocumentIcon";
import React from 'react';

interface SideBarProps {
  onSelectType: (type: string) => void;
}

export const SideBar: React.FC<SideBarProps> = ({ onSelectType }) => {
  const handleTypeSelect = (type: string) => {
    onSelectType(type);
  };

  return <div className="h-screen bg-white border-r w-72 fixed left-0 top-0 pl-6">
    <div className="flex text-2xl pt-8 items-center" onClick={()=>handleTypeSelect("")}>
      <div className="pr-2 text-purple-600 cursor-pointer"  >
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
}