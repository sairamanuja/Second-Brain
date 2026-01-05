import { ShareIcon } from "../icons/Shareicon";
import { DeleteIcon } from "../icons/Deleteicon";
import { useEffect } from "react";
import axios from 'axios';
import { BACKEND_URL } from "../config";

interface CardProps {
    title: string;
    link: string;
    content: string;
    type: "twitter" | "youtube" | "document";
    id: string;
    summary?: string;
    tags?: string[];
    onDelete?: () => void;
    onTagClick?: (tag: string) => void;
}


const TwitterEmbed = ({ link }: { link: string }) => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <blockquote className="twitter-tweet">
            <a href={link.replace("x.com", "twitter.com")}></a>
        </blockquote>
    );
};

export function Card({ title, link, type, content, id, summary, tags, onDelete, onTagClick }: CardProps) {

    async function deleteCard(id: string) {
        console.log("Card deleted:", { title, link, type, content, id });

        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(`${BACKEND_URL}/api/v1/content`, {
                headers: {
                    Authorization: token, // Add your token here
                },
                data: { contentId: id }
            });

            // Call the onDelete callback if it exists to refresh content
            if (onDelete) {
                onDelete();
            }

            console.log(response);
        } catch (error) {
            console.error("Error deleting card:", error);
        }
    }

    return (
        <div key={id} className="w-full">
            {/* Card Container */}
            <div className="p-4 bg-white rounded-xl border-2 border-purple-100 min-h-48 w-full shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                {/* Header Section */}
                <div className="flex justify-between">
                    {/* Left Section: Title with Icon */}
                    <div className="flex items-center text-md">
                    
                       <h2 className="font-bold">{title}
                       </h2>                     </div>
                    {/* Right Section: Links with Icons */}
                    <div className="flex items-center">
                        <div className="pr-2 text-gray-500">
                            {/* Clickable Share Icon that opens the link */}
                            <a href={link} target="_blank">
                                <ShareIcon />
                            </a>
                        </div>
                        <div className="text-gray-500 cursor-pointer" onClick={() => deleteCard(id)}>
                            {/* Placeholder for another Share Icon */}
                            <DeleteIcon />
                        </div>
                    </div>
                </div>
                <div className="pt-2">
                    <p className="overflow-auto break-words">{content}</p>
                </div>

                {summary && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">{summary}</p>
                )}

                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {tags.map((tag: string) => (
                            <span
                                key={tag}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTagClick?.(tag);
                                }}
                                className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 cursor-pointer hover:bg-indigo-100"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Content Section */}
                <div className="pt-4">
                    {/* Render YouTube embed if type is "youtube" */}

                    {type === "youtube" && (
                        <iframe
                            className="w-full"
                            src={link
                                .replace("watch", "embed")
                                .replace("?v=", "/")}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    )}

                    {/* Render Twitter embed if type is "twitter" */}
                    {type === "twitter" && (

                       <TwitterEmbed link={link}/>
                    )}

                    {/* Render document link if type is "document" */}
                    {type === "document" && (
    <div className="mt-2 overflow-hidden">
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-600 hover:underline truncate text-sm"
            title={link} // Shows full link on hover
        >
            {link.replace(/^https?:\/\//, '')} // Removes http(s):// for cleaner display
        </a>
    </div>
)}
                </div>
            </div>
        </div>
    );
}