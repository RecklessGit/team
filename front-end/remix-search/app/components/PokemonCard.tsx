import React from 'react';

export interface PokemonCardProps {
  id?: string;
  name?: string;
  supertype?: string;
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
  height?: number;
  width?: string | number;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  name,
  images = { small: '', large: '' },
  height,
  width,
}) => {
  return (
    <img
      src={images.small}
      alt={name}
      className="mb-4 object-contain"
      style={{ height: height, width: width }}
    />
  );
};
