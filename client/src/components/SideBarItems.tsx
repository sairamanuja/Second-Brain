import { ReactElement } from "react"

export function SideBarItems({text,icon,onclick}:{
    text:string,
    icon:ReactElement,
    onclick?: () => void
}){

    return(
    <div 
        className="flex text-gray-700 cursor-pointer hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 rounded-lg max-w-48 pl-4 transition-all duration-200 gap-2 p-2 hover:scale-105"
        onClick={onclick}
    >
        <div className="pr-2">
            {icon}
        </div>
        <div className="">
            {text}
        </div>
    </div>
    )
}