import { useState, useEffect } from "react";
import SearchComponent from "../components/SearchComponent";
import LawCard from "../components/LawCard";
import NavbarUser from "../components/NavbarUser";
import NavbarAdv from "../components/NavbarAdv";
import logo from "../assets/golden nyayasarthi logo.png";
import { useNavigate } from "react-router-dom";
import bgg from "../assets/bg2.png";
import axios from "axios";

export default function BhartiyaNyayaSanhita() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [chapterSections, setChapterSections] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const navigate = useNavigate();

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
        const response = await fetch(
          `http://localhost:3005/api/nyaya-sanhita/search?q=${encodeURIComponent(
            query
          )}`
        );
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [query]);

  const handleSearch = (newQuery) => {
    setQuery(newQuery);
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
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      navigate("/sign-in");
    }
  };

  const NavbarComponent = userRole === "advocate" ? NavbarAdv : NavbarUser;

  return (
    <div
      className="flex flex-col items-center"
      style={{
        backgroundImage: `url(${bgg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {}

      <div className="w-full md:w-2/3 p-4 mt-1">
        <button
          onClick={() =>
            navigate(
              userRole === "advocate" ? "/advocate-dashboard" : "/dashboard"
            )
          }
          className="mb-4 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          ← Back to Dashboard
        </button>

        <SearchComponent onSearch={handleSearch} />

        <div className="flex pt-4 justify-center flex-wrap">
          {results.length > 0
            ? results.map((result, index) => (
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
            : chapterSections.length === 0 && (
                <div className="text-center text-gray-700 mt-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Increase Your Knowledge on Law
                  </h2>
                  <p className="mt-2 text-gray-800">
                    Explore the rich details of Indian Law, including chapters,
                    sections, and detailed descriptions. Start by searching for
                    legal topics, case laws, or specific sections!
                  </p>
                </div>
              )}
        </div>

        {loading && (
          <p className="text-center text-gray-700 mt-4">Loading sections...</p>
        )}
        {chapterSections.length > 0 && !loading && (
          <>
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
