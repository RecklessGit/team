export type APIResponse = {
  conversation: {
    answer: string;
    conversation_id: string;
    query: string;
  };
  results: Array<{
    facet_counts: any[];
    found: number;
    hits: Array<{
      document: {
        images: {
          small: string;
          large: string;
        };
        name: string;
      };
    }>;
    out_of: number;
    page: number;
    request_params: {
      collection_name: string;
      first_q: string;
      per_page: number;
      q: string;
    };
    search_cutoff: boolean;
    search_time_ms: number;
  }>;
  modelId: string;
  conversationId: string;
};
