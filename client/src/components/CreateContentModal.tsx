import { CrossIcon } from "../icons/CrossIcon";
import { Input } from "./Input";
import { useState, useRef } from "react";
import { Button } from "./Button";
import toast from 'react-hot-toast';

import axios from "axios";

enum ContentType {
    Youtube = 'youtube',
    Twitter = 'twitter',
    Document = "document"
}

interface CreateContentModalProps {
    open: boolean;
    onClose: () => void;
    onContentAdded?: () => void;
}

export function CreateContentModal({open, onClose, onContentAdded}: CreateContentModalProps) {

    const titleRef = useRef<HTMLInputElement>(null);
    const linkRef = useRef<HTMLInputElement>(null);
    const ContentRef = useRef<HTMLTextAreaElement>(null)
    const [type, setType] = useState(ContentType.Youtube);

    async function addContent(){
        const title = titleRef.current?.value;
        const link = linkRef.current?.value;
        const content = ContentRef.current?.value;

        if (!title || !link) {
            toast.error('Please fill in Title and Link fields');
            return;
        }

        const loadingToast = toast.loading('Adding content...');

        try {
            await axios.post(`https://second-brain-0z65.onrender.com/api/v1/content`, {
                link,
                title,
                type,
                content
            }, {
                headers: {
                    "Authorization": localStorage.getItem("token") || ""
                }
            });

            toast.success('Content added successfully!', { id: loadingToast });

            if (onContentAdded) {
                onContentAdded();
            }

            // Clear form
            if (titleRef.current) titleRef.current.value = '';
            if (linkRef.current) linkRef.current.value = '';
            if (ContentRef.current) ContentRef.current.value = '';

            onClose();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to add content';
            toast.error(errorMsg, { id: loadingToast });
            console.error("Error adding content:", error);
        }
    }

    return (
        <div>
            {open && (
                <div>
                    <div className="w-screen h-screen fixed top-0 left-0 backdrop-blur-sm flex justify-center z-40"></div>
                    <div className="w-screen h-screen fixed top-0 left-0 flex justify-center items-center z-50 p-4">
                        <div className="flex flex-col justify-center items-center w-full max-w-md">
                            <div className="bg-white opacity-100 p-6 md:p-8 rounded-xl shadow-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Add Content</h1>
                                    <div onClick={onClose} className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-all">
                                        <CrossIcon />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <Input reference={titleRef} placeholder="Title" />
                                    <Input reference={linkRef} placeholder="Link" />
                                    <textarea 
                                        id="message" 
                                        ref={ContentRef} 
                                        className="block p-3 w-full text-sm text-gray-900 rounded-lg border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all min-h-[100px]" 
                                        placeholder="Enter your content here..."
                                    ></textarea>

                                </div>
                                <div className="mt-4">
                                    <h2 className="text-sm font-semibold text-gray-700 mb-3">Content Type</h2>
                                    <div className="flex flex-wrap gap-2 justify-start">
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
                                <div className="flex justify-end gap-2 mt-6">
                                    <button onClick={onClose} className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all">
                                        Cancel
                                    </button>
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
