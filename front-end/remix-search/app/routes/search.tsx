import { json, LoaderFunctionArgs, SerializeFrom } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { UiState } from 'instantsearch.js';
import { RouterProps } from 'instantsearch.js/es/middlewares';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  getServerState,
  InstantSearch,
  InstantSearchSSRProvider
} from 'react-instantsearch';
import { z } from 'zod';
import { CurrentRefinementList, FilterDialog } from '../components';
import { Title } from '../components/typography';
import { ErrorBoundary } from '../features/search/ErrorBoundary';
import { SearchBox } from '../features/search/SearchBox';
import { SearchResults } from '../features/search/SearchResults';
import { COLLECTION_NAME, routing } from '../routing';
import { typesenseEnvSchema, useTypesenseSearchClient } from '../search-client';

interface SearchProps {
  serverState?: Record<string, unknown>;
  serverUrl: string;
  apiKey: string;
  nodes: { host: string; protocol: string; port: number }[];
}

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
        indexName={COLLECTION_NAME}
        routing={routing(serverUrl) as RouterProps<UiState, any>}
        future={{ preserveSharedStateOnUnmount: true }}
      >
        <div className="flex flex-col max-w-6xl mx-auto shadow-md rounded p-6 relative gap-4">
          <Title as="h1" size="3xl">Pokémon Card Search</Title>
          <SearchBox />
          <FilterDialog />
          <CurrentRefinementList />
          <SearchResults />
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
    <ErrorBoundary>
      <div className="min-h-screen">
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
      </div>
    </ErrorBoundary>
  );
}
