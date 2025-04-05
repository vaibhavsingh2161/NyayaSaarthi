import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchComponent from "../components/SearchComponent";
import LawCard from "../components/LawCard";
import NavbarUser from "../components/NavbarUser";
import NavbarAdv from "../components/NavbarAdv";
import axios from "axios";
import "../styles/BhartiyaNyayaSanhita.css";
import logo from "../assets/golden nyayasarthi logo.png";
import footerLogo from "../assets/Component 1.png";

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
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const navigate = useNavigate();

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

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3005/api/nyaya-sanhita/search?q=${encodeURIComponent(
            query
          )}`
        );
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

  const handleSearch = (newQuery) => {
    setQuery(newQuery);
  };

  const handlePopularSearchClick = (searchTerm) => {
    setQuery(searchTerm);
  };

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

  const fetchSectionsByChapter = async (chapter) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3005/api/nyaya-sanhita/sections?chapter=${chapter}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching chapter sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapterTitle = async (chapter) => {
    try {
      const response = await fetch(
        `http://localhost:3005/api/nyaya-sanhita/chapter-title?chapter=${chapter}`
      );
      const data = await response.json();
      return data.title || "Unknown Chapter";
    } catch (error) {
      console.error("Error fetching chapter title:", error);
      return "Unknown Chapter";
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          "http://localhost:3005/api/users/logout",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      navigate("/sign-in");
    }
  };

  return (
    <div className="dashboard-container">
      {userRole === "advocate" ? (
        <NavbarAdv logo={logo} handleLogout={handleLogout} />
      ) : (
        <NavbarUser logo={logo} handleLogout={handleLogout} />
      )}

      <section className="section nyaya-sanhita-header">
        <h3>Bharatiya Nyaya Sanhita, 2023</h3>
        <p>
          Explore Indian criminal law and find relevant sections based on your search query.
        </p>
      </section>

      <section className="section search-section">
        <h3>Search for Laws</h3>
        <div className="search-wrapper">
          <SearchComponent onSearch={handleSearch} />
        </div>
        
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
      </section>

      <section className="section chapters-section">
        <h3>Explore Chapters</h3>
        <div className="chapter-grid">
          {recentChapters.map((item, index) => (
            <div 
              key={index} 
              className="chapter-card"
              onClick={() => handleRecentChapterClick(item.chapter)}
            >
              <h4>Chapter {item.chapter}</h4>
              <p>{item.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Loading Indicator */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}

      {/* Introduction Section */}
      {showIntroduction && !loading && results.length === 0 && chapterSections.length === 0 && (
        <section className="bg-white shadow-md rounded-2xl p-6 md:p-10 my-6 animate-fade-in border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">About Bharatiya Nyaya Sanhita</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
            The <span className="font-semibold text-blue-700">Bharatiya Nyaya Sanhita, 2023</span> is a law passed by the Parliament of India that replaced the Indian Penal Code of 1860. 
            It was enacted as a part of the comprehensive reform of criminal laws in India.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
            The Bharatiya Nyaya Sanhita introduces several new provisions and offenses, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
            <li><span className="font-medium">Terrorism</span> as a separate offense</li>
            <li><span className="font-medium">Organized crime</span> and anti-national activities</li>
            <li>Expanded definitions for <span className="font-medium">crimes against women and children</span></li>
            <li>New provisions on <span className="font-medium">cyber crimes</span></li>
            <li>Modernized language and considerations for contemporary issues</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
            Use the <span className="font-semibold text-blue-600">search feature</span> above to find specific sections or browse through chapters to explore the law in detail.
            </p>
        </section>
        )}


      {/* Search Results */}
      {results.length > 0 && (
        <section className="section results-section">
          <h3>Search Results</h3>
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
        </section>
      )}

      {/* Chapter Sections */}
      {chapterSections.length > 0 && !loading && (
        <section className="section chapter-sections">
          <div className="chapter-title-section">
            <h3 className="chapter-heading">
              Chapter {selectedChapter} • {chapterTitle}
            </h3>
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
        </section>
      )}

      <footer className="footer">
        <div className="footer-logo">
          <img src={footerLogo} alt="Nyayasarthi Logo" />
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
  );
}