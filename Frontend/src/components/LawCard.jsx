import React, { useEffect, useState } from "react";

export default function LawCard({ chapter, section, sectionTitle, description, fetchChapterTitle, onFetchSections }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [chapterTitle, setChapterTitle] = useState("Unknown Chapter");
    const maxWords = 150;

    const words = description ? description.split(/\s+/) : [];
    const isTruncated = words.length > maxWords;
    const visibleWords = isExpanded ? words : words.slice(0, maxWords);
    const truncatedDescription = visibleWords.join(" ");

    useEffect(() => {
        const loadChapterTitle = async () => {
            const title = await fetchChapterTitle(chapter);
            setChapterTitle(title);
        };

        loadChapterTitle();
    }, [chapter, fetchChapterTitle]);

    const handleChapterClick = async () => {
        const sections = await onFetchSections(chapter); // Fetch sections from parent function
        if (sections) {
            localStorage.setItem("selectedChapterSections", JSON.stringify(sections));
            localStorage.setItem("selectedChapter", chapter);
            window.location.reload(); // Force a hard reload
        }
    };

    return (
        <div className="w-4/6 p-6 m-2 bg-white border border-gray-200 rounded-lg shadow">
            <div
                className="mb-2 font-normal text-yellow-700 cursor-pointer"
                onClick={handleChapterClick} // Trigger hard reload with saved data
            >
                <span>{`Chapter ${chapter} • ${chapterTitle}`}</span>
            </div>
            <p className="mb-2 font-normal text-yellow-700">{`Section ${section}`}</p>
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{sectionTitle}</h5>
            <p className="mb-3 font-normal text-gray-700">
                {truncatedDescription}
                {isTruncated && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-yellow-700 hover:underline ml-2"
                    >
                        {isExpanded ? "Read Less" : "Read More"}
                    </button>
                )}
            </p>
        </div>
    );
}
