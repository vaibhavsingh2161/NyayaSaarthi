import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchComponent from "../components/SearchComponent";
import LawCard from "../components/LawCard";
import "../styles/BhartiyaNyayaSanhita.css";

export default function BhartiyaNyayaSanhita() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [chapterSections, setChapterSections] = useState([]);
    const [selectedChapter, setSelectedChapter] = useState("");
    const [chapterTitle, setChapterTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [popularSearches, setPopularSearches] = useState([
        "Criminal Defamation", "Domestic Violence", "Cyber Crime", 
        "Property Dispute", "Murder", "Theft", "Traffic Violation"
    ]);
    const [recentChapters, setRecentChapters] = useState([
        { chapter: "9", title: "Offences Against Property" },
        { chapter: "5", title: "Offences Against Public Order" },
        { chapter: "16", title: "Offences Affecting Life" }
    ]);
    const [showIntroduction, setShowIntroduction] = useState(true);
    const navigate = useNavigate();

    // Load persisted data from localStorage on initial render
    useEffect(() => {
        const savedSections = localStorage.getItem("selectedChapterSections");
        const savedChapter = localStorage.getItem("selectedChapter");

        if (savedSections && savedChapter) {
            setChapterSections(JSON.parse(savedSections));
            setSelectedChapter(savedChapter);
            setShowIntroduction(false);
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
                setChapterTitle(title);
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
                setLoading(true);
                const response = await fetch(`http://localhost:3005/api/nyaya-sanhita/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setResults(data);
                setShowIntroduction(false);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [query]);

    // Handle search input
    const handleSearch = (newQuery) => {
        setQuery(newQuery);
    };

    // Handle popular search click
    const handlePopularSearchClick = (searchTerm) => {
        setQuery(searchTerm);
    };

    // Handle recent chapter click - uses your original approach
    const handleRecentChapterClick = async (chapter) => {
        try {
            const sections = await fetchSectionsByChapter(chapter);
            if (sections) {
                localStorage.setItem("selectedChapterSections", JSON.stringify(sections));
                localStorage.setItem("selectedChapter", chapter);
                window.location.reload(); // Force a hard reload
            }
        } catch (error) {
            console.error("Error handling chapter click:", error);
        }
    };

    // Fetch sections for a specific chapter - using your original approach
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

    // Logout function
    const handleLogout = (e) => {
        if (e) e.preventDefault();
        
        // Clear all authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        
        // Redirect to login page
        navigate('/sign-in');
    };

    return (
        <div className="nyaya-sanhita-container">
            <div className="nyaya-sanhita-content">
                {/* Header with navigation */}
                <header className="dashboard-header">
                    <Link to="/">
                        <img src="/images/golden nyayasarthi logo.png" alt="NyayaSarthi Logo" className="logo" />
                    </Link>
                    <nav className="dashboard-nav">
                        <Link to="/dashboard">My Case</Link>
                        <Link to="/nyaya-sanhita" className="active">Nyaya Sanhita</Link>
                        <Link to="/qa">Q&A</Link>
                        <Link to="/account">Account</Link>
                        <a href="#" onClick={handleLogout} className="nav-link">Logout</a>
                    </nav>
                </header>

                <main className="nyaya-sanhita-main">
                    <h1 className="main-title">Bharatiya Nyaya Sanhita, 2023</h1>
                    <p className="main-description">
                        Explore Indian criminal law and find relevant sections based on your search query.
                    </p>

                    {/* Search Section */}
                    <div className="search-section">
                        <h2>Search for Laws</h2>
                        <SearchComponent onSearch={handleSearch} />
                        
                        {/* Popular Searches */}
                        <div className="popular-searches">
                            <p className="popular-label">Popular searches:</p>
                            <div className="search-tags">
                                {popularSearches.map((term, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handlePopularSearchClick(term)}
                                        className="search-tag"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Chapters Section */}
                    <div className="chapters-section">
                        <h2>Explore Chapters</h2>
                        <div className="chapter-grid">
                            {recentChapters.map((item, index) => (
                                <div 
                                    key={index} 
                                    className="chapter-card"
                                    onClick={() => handleRecentChapterClick(item.chapter)}
                                >
                                    <h3>Chapter {item.chapter}</h3>
                                    <p>{item.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>Loading...</p>
                        </div>
                    )}

                    {/* Introduction Section */}
                    {showIntroduction && !loading && results.length === 0 && chapterSections.length === 0 && (
                        <div className="introduction-section">
                            <h2>About Bharatiya Nyaya Sanhita</h2>
                            <p>
                                The Bharatiya Nyaya Sanhita, 2023 is a law passed by the Parliament of India that replaced the Indian Penal Code of 1860. 
                                It was enacted as a part of the comprehensive reform of criminal laws in India.
                            </p>
                            <p>
                                The Bharatiya Nyaya Sanhita has introduced several new provisions and offenses, including:
                            </p>
                            <ul>
                                <li>Terrorism as a separate offense</li>
                                <li>Organized crime and anti-national activities</li>
                                <li>Expanded definitions for crimes against women and children</li>
                                <li>New provisions on cyber crimes</li>
                                <li>Modernized language and considerations for contemporary issues</li>
                            </ul>
                            <p>
                                Use the search feature above to find specific sections or browse through chapters to explore the law in detail.
                            </p>
                        </div>
                    )}

                    {/* Render Search Results */}
                    {results.length > 0 && (
                        <div className="results-section">
                            <h2>Search Results</h2>
                            <div className="law-cards">
                                {results.map((result, index) => (
                                    <LawCard
                                        key={index}
                                        chapter={result.chapter || "Unknown"}
                                        section={result.section_number || "Unknown"}
                                        sectionTitle={result.title || "No Title"}
                                        description={result.description || "No Description"}
                                        fetchChapterTitle={fetchChapterTitle}
                                        onFetchSections={fetchSectionsByChapter}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Render Chapter Sections - Using your original approach */}
                    {chapterSections.length > 0 && !loading && (
                        <>
                            <div className="chapter-title-section">
                                <h2 className="chapter-heading">
                                    Chapter {selectedChapter} • {chapterTitle}
                                </h2>
                            </div>
                            <div className="sections-container">
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
                </main>

                {/* Footer */}
                <footer className="dashboard-footer">
                    <div className="footer-logo">
                        <img src="/images/Component 1.png" alt="NyayaSarthi Logo" />
                    </div>
                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>Quick Links</h4>
                            <Link to="/announcements">Announcement</Link>
                            <Link to="/about-us">About Us</Link>
                            <Link to="/feedback">Feedback</Link>
                            <Link to="/qa">Q&A</Link>
                        </div>
                        <div className="footer-column">
                            <h4>Case</h4>
                            <Link to="/nyaya-sanhita">Find Relevant Laws</Link>
                            <Link to="/floating-case">Float a Case</Link>
                            <Link to="/find-a-lawyer">Find Lawyer</Link>
                            <Link to="/legal-advice">Legal Advice</Link>
                        </div>
                        <div className="footer-column">
                            <h4>Law</h4>
                            <Link to="/nyaya-sanhita">Nyaya Sanhita</Link>
                            <Link to="/search">Search</Link>
                            <Link to="/news">Recent News</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}