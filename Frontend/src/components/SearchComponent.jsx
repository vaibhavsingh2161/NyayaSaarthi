import { useState } from "react";

export default function SearchComponent({ onSearch }) {
    const [query, setQuery] = useState("");

    const handleSearchClick = () => {
        if (onSearch) {
            onSearch(query); // Pass the query back to the parent when the button is clicked
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearchClick(); // Trigger search on Enter key press
        }
    };

    return (
        <div className="relative">
            <label htmlFor="Search" className="sr-only">Search</label>
            <input
                type="text"
                id="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)} // Update query as the user types
                onKeyDown={handleKeyDown} // Trigger search on Enter key press
                placeholder="Search for..."
                className="w-full rounded-md border-gray-200 py-2.5 pe-10 shadow-sm sm:text-sm"
            />
            <span className="absolute inset-y-0 end-0 grid w-10 place-content-center">
                <button
                    type="button"
                    className="text-gray-600 hover:text-gray-700"
                    onClick={handleSearchClick} // Trigger search on button click
                >
                    <span className="sr-only">Search</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-4"
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
