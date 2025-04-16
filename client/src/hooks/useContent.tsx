import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { BACKEND_URL } from "../config";

export function useContent() {
    const [contents, setContents] = useState([]);

    // Memoize the refresh function so it doesn't change on every render
    const refresh = useCallback(() => {
        axios.get(`${BACKEND_URL}/api/v1/content`, {
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        })
            .then((response) => {
                setContents(response.data.content);
            })
            .catch((error) => {
                console.error("Error fetching content:", error);
            });
    }, []);

    // Only fetch content once when the component mounts
    useEffect(() => {
        refresh();
        // Removed the interval that was causing constant refreshes
    }, [refresh]);

    return { contents, refresh };
}