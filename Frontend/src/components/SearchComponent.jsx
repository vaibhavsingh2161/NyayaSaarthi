// Frontend/src/components/SearchComponent.jsx
import { useState } from "react";

export default function SearchComponent({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  return (
    <div className="relative">
      <label htmlFor="Search" className="sr-only">
        Search
      </label>
      <input
        type="text"
        id="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search for..."
        className="w-full max-w-[1200px] h-20 rounded-md border-gray-200 py-2.5 pe-10 shadow-sm sm:text-sm placeholder:text-lg"
      />
      <span className="absolute inset-y-0 end-0 grid w-24 place-content-center text-xl font-bold text-gray-700">
        <button
          type="button"
          className="text-gray-600 hover:text-gray-700"
          onClick={handleSearchClick}
        >
          <span className="sr-only">Search</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>
      </span>
    </div>
  );
}
