import { LoaderFunction } from '@remix-run/node';
import React, { useState } from 'react';
import { APIResponse } from '../../types';
import { PokemonCard } from '../components/PokemonCard';
import { Title } from '../components/typography';
import { SideNav } from '../features/layout/SideNav';
import { ConversationSearchBox } from '../features/search/ConversationSearchBox';

export const loader: LoaderFunction = async () => {
  return null;
};

export const ConversationResults: React.FC = () => {
  const [conversationResults, setConversationResults] = useState<APIResponse[]>([]);
  const [modelId, setModelId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleConversationSearch = async (query: string) => {
    try {
      const response = await fetch(
        `/conversation?query=${encodeURIComponent(query)}${
          conversationId ? `&conversationId=${conversationId}` : ''
        }${modelId ? `&conversation_model_id=${modelId}` : ''}`
      );
      const data: APIResponse = await response.json();
      console.log('API Response:', data);

      setConversationResults((prev) => [...prev, data]);
      setModelId(data.modelId);
      setConversationId(data.conversationId);
      setExpandedIndex(null);
    } catch (error) {
      console.error('Error during conversation search:', error);
    }
  };

  const handleClear = () => {
    setConversationResults([]);
    setModelId(null);
    setConversationId(null);
    setExpandedIndex(null);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen">
      <div className="flex mb-4 gap-2">
        <ConversationSearchBox
          isConversationMode={true}
          onConversationSearch={handleConversationSearch}
        />
        <button
          onClick={handleClear}
          className="bg-red-500 text-white px-4 rounded hover:bg-red-600 transition-colors h-[40px]"
        >
          Clear
        </button>
      </div>
      <div className="mt-4">
        {conversationResults.map((result, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            {index === conversationResults.length - 1 ? (
              <FullResultDisplay result={result} />
            ) : (
              <div>
                <button
                  onClick={() => toggleExpand(index)}
                  className="flex items-center font-semibold text-blue-500 hover:text-blue-700 text-sm"
                >
                  {expandedIndex === index ? '▼' : '►'} Previous response
                </button>
                {expandedIndex === index && (
                  <FullResultDisplay result={result} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const FullResultDisplay: React.FC<{ result: APIResponse }> = ({ result }) => {
  if (!result || !result.results || !result.conversation) {
    return <p>No results available.</p>;
  }

  const { query, answer } = result.conversation;
  const pokemonHits = result.results[0]?.hits || [];

  return (
    <>
      <p className="font-bold">Q: {query}</p>
      <p className="mt-2">A: {answer}</p>
      {pokemonHits.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Related Pokemon Cards:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
            {pokemonHits.map((hit, index) => (
              <div key={index} className="flex flex-col items-center">
                <PokemonCard
                  images={hit.document.images}
                  height={180}
                  width="auto"
                />
                <p className="text-center mt-2">{hit.document.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default function Search() {
  return (
    <div className="flex flex-col max-w-6xl mx-auto shadow-md rounded p-6 relative gap-4">
      <SideNav />
      <Title as="h1" size="3xl">
        Pokémon Card Search
      </Title>
      <ConversationResults />
    </div>
  );
}