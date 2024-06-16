import { useMemo } from 'react';
import TypesenseInstantSearchAdapterExport, {
  BaseSearchParameters,
  TypesenseInstantsearchAdapterOptions,
} from 'typesense-instantsearch-adapter';
import { z } from 'zod';

// ! Odd bug that needs this hack for SSR
const TypesenseInstantSearchAdapter =
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  TypesenseInstantSearchAdapterExport.default ??
  TypesenseInstantSearchAdapterExport;

// Define the Zod schema for environment variables
export const typesenseEnvSchema = z.object({
  TYPESENSE_HOST: z.string(),
  TYPESENSE_API_KEY: z.string(),
  TYPESENSE_PROTOCOL: z.string().optional().default('http'),
  TYPESENSE_PORT: z.coerce.number().optional().default(8108),
});

type TypesenseSearchClientProps = {
  apiKey: string;
  nodes: { host: string; protocol: string; port: number }[];
  queryBy: string;
  options?: BaseSearchParameters & { [filter_by: string]: string | number };
};

export function useTypesenseSearchClient({
  apiKey,
  nodes,
  queryBy,
  options,
}: TypesenseSearchClientProps) {
  const adapterOptions = useMemo(
    (): TypesenseInstantsearchAdapterOptions => ({
      server: {
        apiKey:
          apiKey || typesenseEnvSchema.parse(process.env).TYPESENSE_API_KEY,
        nodes: nodes || [
          {
            host: typesenseEnvSchema.parse(process.env).TYPESENSE_HOST,
            port: typesenseEnvSchema.parse(process.env).TYPESENSE_PORT,
            protocol: typesenseEnvSchema.parse(process.env).TYPESENSE_PROTOCOL,
          },
        ],
        sendApiKeyAsQueryParam: false,
        numRetries: 3,
        retryIntervalSeconds: 2,
        connectionTimeoutSeconds: 3,
      },
      additionalSearchParameters: {
        query_by: queryBy,
        per_page: 30,
        drop_tokens_threshold: 10,
        infix: 'always',
        page: 0,
        ...options,
      },
    }),
    [queryBy, options]
  );

  const adapter = useMemo(
    () => new TypesenseInstantSearchAdapter(adapterOptions),
    [adapterOptions]
  );

  return adapter;
}
