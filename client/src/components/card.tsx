import { ShareIcon } from "../icons/Shareicon";
import { DeleteIcon } from "../icons/Deleteicon";
import { useEffect } from "react";
import axios from 'axios';

interface CardProps {
    title: string; // Title of the card, e.g., video or tweet title
    link: string;
    content: string;
    type: "twitter" | "youtube" | "document"; // Type of the content
    id: string;
    onDelete?: () => void; // Optional callback for when content is deleted
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

// The Card component represents a styled card that can display either a YouTube video or a Twitter embed based on the type prop.
export function Card({ title, link, type, content, id, onDelete }: CardProps) {

    async function deleteCard(id: string) {
        console.log("Card deleted:", { title, link, type, content, id });

        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete( "https://second-brain-0z65.onrender.com/api/v1/content", {
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
        <div key={id}>
            {/* Card Container */}
            <div className="p-4 bg-white rounded-md border-gray-200 max-w-72 border min-h-48 min-w-72">
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
                <div className="pt-2 ">
                        {/* Content Section */}
                        <p className="overflow-auto">{content}</p>
                    </div>

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