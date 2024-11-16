import { useState, useEffect } from "react";
import SearchComponent from "../components/SearchComponent";
import LawCard from "../components/LawCard";

export default function BhartiyaNyayaSanhita() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [chapterSections, setChapterSections] = useState([]);
    const [selectedChapter, setSelectedChapter] = useState("");
    const [chapterTitle, setChapterTitle] = useState(""); // New state for chapter title
    const [loading, setLoading] = useState(false);

    // Load persisted data from localStorage on initial render
    useEffect(() => {
        const savedSections = localStorage.getItem("selectedChapterSections");
        const savedChapter = localStorage.getItem("selectedChapter");

        if (savedSections && savedChapter) {
            setChapterSections(JSON.parse(savedSections));
            setSelectedChapter(savedChapter);
            localStorage.removeItem("selectedChapterSections");
            localStorage.removeItem("selectedChapter");
        }
    }, []);

    // Fetch chapter title when selectedChapter changes
    useEffect(() => {
        if (!selectedChapter) return;

        const fetchTitle = async () => {
            try {
                const title = await fetchChapterTitle(selectedChapter);
                setChapterTitle(title); // Set the fetched title in state
            } catch (error) {
                console.error("Error fetching chapter title:", error);
            }
        };

        fetchTitle();
    }, [selectedChapter]);

    // Fetch search results whenever the query changes
    useEffect(() => {
        if (query.trim() === "") {
            setResults([]);
            return;
        }

        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3005/api/nyaya-sanhita/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [query]);

    // Handle search input
    const handleSearch = (newQuery) => {
        setQuery(newQuery);
    };

    // Fetch sections for a specific chapter
    const fetchSectionsByChapter = async (chapter) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3005/api/nyaya-sanhita/sections?chapter=${chapter}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching chapter sections:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch chapter title
    const fetchChapterTitle = async (chapter) => {
        try {
            const response = await fetch(`http://localhost:3005/api/nyaya-sanhita/chapter-title?chapter=${chapter}`);
            const data = await response.json();
            return data.title || "Unknown Chapter";
        } catch (error) {
            console.error("Error fetching chapter title:", error);
            return "Unknown Chapter";
        }
    };

    return (
        <div className="flex justify-center">
            <div className="w-2/3 p-4">
                {/* Search Component */}
                <SearchComponent onSearch={handleSearch} />

                {/* Render Search Results */}
                <div className="flex pt-4 justify-center flex-wrap">
                    {results.length > 0 ? (
                        results.map((result, index) => (
                            <LawCard
                                key={index}
                                chapter={result.chapter || "Unknown"}
                                section={result.section_number || "Unknown"}
                                sectionTitle={result.title || "No Title"}
                                description={result.description || "No Description"}
                                fetchChapterTitle={fetchChapterTitle}
                                onFetchSections={fetchSectionsByChapter}
                            />
                        ))
                    ) : (
                        chapterSections.length === 0 && (
                            <div className="text-center text-gray-700 mt-8">
                                <h2 className="text-2xl font-bold text-gray-900">Increase Your Knowledge on Law</h2>
                                <p className="mt-2 text-gray-600">
                                    Explore the rich details of Indian Law, including chapters, sections, and detailed
                                    descriptions. Start by searching for legal topics, case laws, or specific sections!
                                </p>
                            </div>
                        )
                    )}
                </div>

                {/* Render Sections as LawCards */}
                {loading && <p className="text-center text-gray-700 mt-4">Loading sections...</p>}
                {chapterSections.length > 0 && !loading && (
                    <>
                        {/* Styled Chapter Heading */}
                        <div className="text-center mt-6">
                            <h2 className="text-2xl font-bold text-yellow-600">
                                Chapter {selectedChapter} • {chapterTitle}
                            </h2>
                        </div>
                        <div className="flex flex-wrap justify-center mt-8">
                            {chapterSections.map((section, index) => (
                                <LawCard
                                    key={index}
                                    chapter={selectedChapter}
                                    section={section.section_number || "Unknown"}
                                    sectionTitle={section.title || "No Title"}
                                    description={section.description || "No Description"}
                                    fetchChapterTitle={fetchChapterTitle}
                                    onFetchSections={() => {}}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
