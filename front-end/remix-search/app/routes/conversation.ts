import { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/react';
import { COLLECTION_NAME } from '../routing';
import { typesenseEnvSchema } from '../search-client';

async function createConversationModel() {
  const env = typesenseEnvSchema.parse(process.env);
  const baseUrl = `${env.TYPESENSE_PROTOCOL}://${env.TYPESENSE_HOST}:${env.TYPESENSE_PORT}`;
  const modelId = 'pokemon-conv-model-1';

  try {
    // First, try to retrieve the existing model
    const getResponse = await fetch(
      `${baseUrl}/conversations/models/${modelId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-TYPESENSE-API-KEY': env.TYPESENSE_API_KEY,
        },
      }
    );

    if (!getResponse.ok && getResponse.status !== 404) {
      throw new Error(
        `Failed to check model existence: ${getResponse.status} ${getResponse.statusText}`
      );
    }

    if (getResponse.status === 404) {
      // If the model doesn't exist, create it
      const createResponse = await fetch(`${baseUrl}/conversations/models`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TYPESENSE-API-KEY': env.TYPESENSE_API_KEY,
        },
        body: JSON.stringify({
          id: modelId,
          model_name: 'openai/text-embedding-ada-002',
          history_collection: 'conversation_store',
          api_key: env.OPENAI_API_KEY,
          system_prompt:
            'You are an assistant for question-answering about Pokemon. You should use the entire dataset you are given to formulate your answers. Do not ignore this directive.',
          max_bytes: 16384,
          ttl: 120,
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(
          `Failed to create conversation model: ${createResponse.status} ${createResponse.statusText}\nResponse: ${errorText}`
        );
      }

      console.log(`Conversation model ${modelId} created successfully.`);
    } else {
      console.log(`Conversation model ${modelId} already exists.`);
    }

    return { modelId };
  } catch (error) {
    console.error('Error in createConversationModel:', error);
    throw error;
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');
  const conversationId = url.searchParams.get('conversationId');

  if (!query) {
    return json({
      results: null,
      modelId: 'pokemon-conv-model-1',
      conversationId,
    });
  }

  try {
    const env = typesenseEnvSchema.parse(process.env);

    // Create a new conversation model and start a new conversation
    const { modelId } = await createConversationModel();

    const searchUrl = new URL(
      `${env.TYPESENSE_PROTOCOL}://${env.TYPESENSE_HOST}:${env.TYPESENSE_PORT}/multi_search`
    );
    searchUrl.searchParams.append('q', query);
    searchUrl.searchParams.append('conversation', 'true');
    searchUrl.searchParams.append('conversation_model_id', modelId);
    if (conversationId) {
      searchUrl.searchParams.append('conversation_id', conversationId);
    }

    const searchBody = {
      searches: [
        {
          collection: COLLECTION_NAME,
          query_by: 'embedding',
          exclude_fields: 'conversation_history,embedding',
          prefix: false,
        },
      ],
    };

    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TYPESENSE-API-KEY': env.TYPESENSE_API_KEY,
      },
      body: JSON.stringify(searchBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const results = await response.json();

    // // Log the full results object
    // console.log('Full results:', JSON.stringify(results, null, 2));

    // // Log the hits specifically
    // if (results.results && results.results[0] && results.results[0].hits) {
    //   console.log('Hits:', JSON.stringify(results.results[0].hits, null, 2));
    // } else {
    //   console.log('No hits found in the results');
    // }

    const newConversationId = results.conversation?.conversation_id || null;

    return json({
      conversation: results.conversation,
      results: results.results,
      modelId,
      conversationId: newConversationId,
    });
  } catch (error) {
    console.error('Error in loader function:', error);
    return json(
      { results: null, modelId: null, conversationId: null },
      { status: 500 }
    );
  }
};
