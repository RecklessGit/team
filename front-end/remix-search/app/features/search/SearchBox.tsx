import React, { useState, useEffect } from 'react';
import { useSearchBox } from 'react-instantsearch';

interface SearchBoxProps {
  placeholder?: string;
  showButton?: boolean;
}

const SEARCH_TIPS = [
  'Search for Pokémon by name',
  'Try searching by type: Water, Fire, etc.',
  'Find Pokémon by their subtypes, supertype or type...',
];

export const SearchBox: React.FC<SearchBoxProps> = ({ showButton = true }) => {
  const { query, refine, clear } = useSearchBox();
  const [inputValue, setInputValue] = useState(query);
  const [tipIndex, setTipIndex] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prevIndex) => {
        return (prevIndex + 1) % SEARCH_TIPS.length;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value) {
      const response = await fetch(`/autocomplete?query=${value}`);
      const data = await response.json();
      setSuggestions(data.suggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleFormSubmit = (
    e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    refine(inputValue);
  };

  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    clear();
  };

  const handleClearKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClear();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setSuggestions([]);
    refine(suggestion);
  };

  const handleSuggestionKeyDown = (
    e: React.KeyboardEvent<HTMLLIElement>,
    suggestion: string
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleSuggestionClick(suggestion);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="flex items-center w-full mb-6">
      <div className="relative w-full">
        <span className="absolute inset-y-0 left-0 flex items-center pl-2">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleFormSubmit(e);
            }
          }}
          className="w-full p-2 pl-10 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={SEARCH_TIPS[tipIndex]}
        />
        {inputValue && (
          <span
            onClick={handleClear}
            onKeyDown={handleClearKeyDown}
            role="button"
            tabIndex={0}
            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
            aria-label="Clear search input"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </span>
        )}
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded shadow-lg">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="p-2 border-b last:border-none cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion.name)}
                onKeyDown={(e) => handleSuggestionKeyDown(e, suggestion.name)}
                tabIndex={0}
                role="button"
              >
                {suggestion.name} {/* Customize to show relevant fields */}
              </li>
            ))}
          </ul>
        )}
      </div>
      {showButton && (
        <button
          type="submit"
          className="ml-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
      )}
    </form>
  );
};
