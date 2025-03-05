import { useState, useEffect, createContext } from "react";
import run from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");
    const [responseQueue, setResponseQueue] = useState([]);

    useEffect(() => {
        if (responseQueue.length > 0) {
            const interval = setInterval(() => {
                setResultData((prev) => prev + " " + responseQueue[0]);
                setResponseQueue((prevQueue) => prevQueue.slice(1));

                if (responseQueue.length <= 1) {
                    clearInterval(interval);
                }
            }, 50);
            return () => clearInterval(interval);
        }
    }, [responseQueue]);

    const handleNewChat = () => {
        setShowResult(false); // Show home page
        setRecentPrompt(""); // Clear the current prompt
        setInput(""); // Clear input field

        setPrevPrompts((prev) => [...prev, "New Chat"]); // Add "New Chat" entry
    };

    const onSent = async (prompt) => {
        setResultData("");
        setLoading(true);
        setShowResult(true);

        const finalPrompt = prompt || input;
        setRecentPrompt(finalPrompt);

        setPrevPrompts((prev) => {
            if (prev.length > 0 && prev[prev.length - 1] === "New Chat") {
                return [...prev.slice(0, -1), finalPrompt];
            } else {
                return [...prev, finalPrompt];
            }
        });

        try {
            const response = await run(finalPrompt);
            if (!response || typeof response !== "string") {
                setResultData("No response received.");
                return;
            }

            let formattedResponse = response
                .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
                .replace(/\n\n/g, "<br/><br/>")
                .replace(/\n/g, "<br/>")
                .trim();

            let words = formattedResponse.split(" ");
            setResponseQueue(words);
        } catch (error) {
            console.error("Error fetching response:", error);
            setResultData("Failed to fetch response.");
        }

        setLoading(false);
        setInput("");
    };

    const contextValue = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        handleNewChat,
        setRecentPrompt,
        recentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        setShowResult
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;

