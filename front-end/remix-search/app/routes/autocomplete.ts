import { json, LoaderFunction } from '@remix-run/node';
import { COLLECTION_NAME } from '../routing';
import { typesenseEnvSchema } from '../search-client';
import Typesense from 'typesense';

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');

  if (!query) {
    return json({ suggestions: [] });
  }

  try {
    const searchParameters = {
      q: query,
      query_by: 'name,subtypes,supertype,types',
      per_page: 10,
    };

    const env = typesenseEnvSchema.parse(process.env);

    const typesenseClient = new Typesense.Client({
      nodes: [
        {
          host: env.TYPESENSE_HOST,
          port: env.TYPESENSE_PORT,
          protocol: env.TYPESENSE_PROTOCOL,
        },
      ],
      apiKey: env.TYPESENSE_API_KEY,
      connectionTimeoutSeconds: 2,
    });

    const searchResults = await typesenseClient
      .collections(COLLECTION_NAME)
      .documents()
      .search(searchParameters);

    const suggestions = searchResults?.hits?.map((hit: any) => hit.document);

    return json({ suggestions });
  } catch (error) {
    console.error(error);
    return json({ suggestions: [] }, { status: 500 });
  }
};
