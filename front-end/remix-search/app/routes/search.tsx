import { json, LoaderFunctionArgs, SerializeFrom } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Hit } from 'instantsearch.js';
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

// Define Zod schema for validation
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

function Search({
  serverState = {},
  serverUrl,
  apiKey,
  nodes,
}: {
  serverState?: Record<string, unknown>;
  serverUrl: string;
  apiKey: string;
  nodes: [{ host: string; protocol: string; port: number }];
}) {
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
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-6xl mx-auto bg-white shadow-md rounded p-6">
            <SearchBox placeholder="Search for a Pokémon card..." />
            <h1 className="text-2xl font-bold mb-4">Pokémon Card Search</h1>
            <HitComponent />
          </div>
        </div>
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}

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
