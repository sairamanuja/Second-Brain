import { ReactElement } from "react"

export function SideBarItems({text,icon}:{
    text:string,
    icon:ReactElement
}){
   

    return(
    <div className="flex text-gray-700 cursor-pointer hover:bg-gray-200  rounded max-w-48 pl-4 transition-all duration-150 gap-2 p-2">
<div className="pr-2">
    {icon}
</div>
<div className="">
    {text}
</div>
    </div>
    
)

}