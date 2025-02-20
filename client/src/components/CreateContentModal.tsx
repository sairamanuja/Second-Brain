import { CrossIcon } from "../icons/CrossIcon";
import { Input } from "./Input";
import { useState, useRef } from "react";
import { Button } from "./Button";
import { BACKEND_URL } from "../config";
import axios from "axios";

enum ContentType {
    Youtube = 'youtube',
    Twitter = 'twitter',
    Document = "document"    
}

interface CreateContentModalProps {
    open: boolean;
    onClose: () => void;
}

export function CreateContentModal({open, onClose}: CreateContentModalProps) {
    
    const titleRef = useRef<HTMLInputElement>(null);
    const linkRef = useRef<HTMLInputElement>(null);
    const ContentRef = useRef<HTMLInputElement>(null)
    const [type, setType] = useState(ContentType.Youtube);

    async function addContent(){
        const title = titleRef.current?.value;
        const link = linkRef.current?.value;
        const content = ContentRef.current?.value;

        await axios.post(`${BACKEND_URL}/api/v1/content`, {
            link,
            title,
            type,
            content
        }, {
            headers: {
                "Authorization": localStorage.getItem("token") || "" // Including the authorization token
            }
        });

       


        console.log(title)
        console.log(link)
        console.log(content)
     
       

        onClose();
    }

    return (
        <div>
            {open && (
                <div>
                    <div className="w-screen h-screen bg-slate-300 fixed top-0 left-0 opacity-60 flex justify-center"></div>
                    <div className="w-screen h-screen fixed top-0 left-0 flex justify-center">
                        <div className="flex flex-col justify-center items-center">
                            <div className="bg-white opacity-100 p-4 rounded fixed ">
                                <div className="flex justify-end">
                                    <div onClick={onClose} className="cursor-pointer">
                                        <CrossIcon />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h1>Add Content</h1>
                                    <Input reference={titleRef} placeholder="Title" />
                                    <Input reference={linkRef} placeholder="Link" />
                                    <textarea id="message" ref={ContentRef}  class="block p-2.5 w-full text-sm text-gray-900  rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your content here..."></textarea>

                                </div>
                                <div>
                                    <h1 className="py-2">Type</h1>
                                    <div className="flex gap-1 justify-center pb-2">
                                        <Button
                                            text="Youtube"
                                            variant={type === ContentType.Youtube ? "primary" : "secondary"}
                                            onClick={() => setType(ContentType.Youtube)}
                                        />
                                        <Button
                                            text="Twitter"
                                            variant={type === ContentType.Twitter ? "primary" : "secondary"}
                                            onClick={() => setType(ContentType.Twitter)}
                                        />
                                        <Button
                                            text="Document"
                                            variant={type === ContentType.Document ? "primary" : "secondary"}
                                            onClick={() => setType(ContentType.Document)}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <Button onClick={addContent} variant="primary" text="Submit" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
