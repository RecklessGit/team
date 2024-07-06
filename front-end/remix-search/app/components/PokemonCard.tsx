import React from 'react';

export interface PokemonCardProps {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  level?: string;
  hp?: string;
  types?: string[];
  evolves_from?: string;
  evolves_to?: string[];
  abilities?: string[];
  attacks?: string[];
  weaknesses?: string[];
  resistances?: string[];
  retreat_cost?: string[];
  converted_retreat_cost?: number;
  number?: string;
  artist?: string;
  rarity?: string;
  flavor_text?: string;
  national_pokedex_numbers?: number[];
  legalities?: string[];
  images?: {
    small: string;
    large: string;
  };
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  name,
  supertype,
  subtypes = [],
  types = [],
  artist = '',
  rarity = '',
  flavor_text = '',
  images = { small: '', large: '' },
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded p-4 mb-4 w-max">
      <h2 className="text-xl font-bold mb-2">{name}</h2>
      {images.small && <img src={images.small} alt={name} className="mb-4" />}
      <p><strong>Supertype:</strong> {supertype}</p>
      {subtypes.length > 0 && <p><strong>Subtypes:</strong> {subtypes.join(', ')}</p>}
      {types.length > 0 && <p><strong>Types:</strong> {types.join(', ')}</p>}
      <p><strong>Artist:</strong> {artist}</p>
      <p><strong>Rarity:</strong> {rarity}</p>
      {flavor_text && <p><strong>Flavor Text:</strong> {flavor_text}</p>}
    </div>
  );
};
