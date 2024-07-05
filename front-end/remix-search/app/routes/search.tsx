import { json, LoaderFunctionArgs, SerializeFrom } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Hit } from 'instantsearch.js';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  getServerState,
  InstantSearch,
  InstantSearchSSRProvider,
  useInfiniteHits,
} from 'react-instantsearch';
import { z } from 'zod';
import { PokemonCard, PokemonCardProps } from '../components/PokemonCard';
import { SearchBox } from '../features/search/SearchBox';
import { routing } from '../routing';
import { typesenseEnvSchema, useTypesenseSearchClient } from '../search-client';
import {
  CurrentRefinementList,
  FilterDialog,
  RefinementList,
} from '../components';
import { Title } from '../components/typography';

interface SearchProps {
  serverState?: Record<string, unknown>;
  serverUrl: string;
  apiKey: string;
  nodes: { host: string; protocol: string; port: number }[];
}

const HitComponent: React.FC = () => {
  const { results } = useInfiniteHits<Hit<PokemonCardProps>>();

  return (
    <div className="grid grid-cols-dynamic gap-3 mt-3">
      {results?.hits.map((hit) => {
        return <PokemonCard key={hit.objectID} {...hit} />;
      })}
    </div>
  );
};

export const Search: React.FC<SearchProps> = ({
  serverState = {},
  serverUrl,
  apiKey,
  nodes,
}) => {
  const { searchClient } = useTypesenseSearchClient({
    queryBy: 'name,subtypes,supertype,types',
    apiKey,
    nodes,
  });

  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch
        searchClient={searchClient}
        indexName="pokemon"
        routing={routing(serverUrl)}
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <div className="min-h-screen">
          <div className="flex flex-col max-w-6xl mx-auto shadow-md rounded p-6 relative gap-4">
            <Title as="h1">Pokémon Card Search</Title>
            <SearchBox placeholder="Search for a Pokémon card..." />
            <FilterDialog />
            <RefinementList attribute="supertype" />
            <CurrentRefinementList />
            <HitComponent />
          </div>
        </div>
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
};

const RequestSchema = z.object({
  url: z.string().url(),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const env = typesenseEnvSchema.parse(process.env);
  const parsedRequest = RequestSchema.safeParse({
    url: request.url,
  });

  if (!parsedRequest.success) {
    throw new Response('Invalid request', { status: 400 });
  }

  const serverUrl = parsedRequest.data.url;
  const serverState = await getServerState(
    <Search
      serverUrl={serverUrl}
      apiKey={env.TYPESENSE_API_KEY}
      nodes={[
        {
          host: env.TYPESENSE_HOST,
          port: env.TYPESENSE_PORT,
          protocol: env.TYPESENSE_PROTOCOL,
        },
      ]}
    />,
    {
      renderToString,
    }
  );

  return json({
    serverState,
    serverUrl,
    ENV: {
      TYPESENSE_API_KEY: env.TYPESENSE_API_KEY,
      TYPESENSE_HOST: env.TYPESENSE_HOST,
      TYPESENSE_PORT: env.TYPESENSE_PORT,
      TYPESENSE_PROTOCOL: env.TYPESENSE_PROTOCOL,
    },
  });
}

type LoaderData = SerializeFrom<typeof loader>;

export default function HomePage() {
  const { serverState, serverUrl, ENV } = useLoaderData<LoaderData>();

  return (
    <Search
      serverState={serverState}
      serverUrl={serverUrl}
      apiKey={ENV.TYPESENSE_API_KEY}
      nodes={[
        {
          host: ENV.TYPESENSE_HOST,
          port: ENV.TYPESENSE_PORT,
          protocol: ENV.TYPESENSE_PROTOCOL,
        },
      ]}
    />
  );
}
