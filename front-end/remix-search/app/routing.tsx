import { UiState } from 'instantsearch.js';
import { history } from 'instantsearch.js/cjs/lib/routers/index.js';
import { RouterProps } from 'instantsearch.js/es/middlewares';

type PokemonSearchState = {
  query: string;
  page: number;
};

type RouteState = {
  query?: string;
  page?: number;
};

export function routing(serverUrl: string): RouterProps<UiState, UiState> {
  return {
    stateMapping: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stateToRoute(uiState: Record<string, any>) {
        return {
          query: uiState.pokemon.query,
          page: uiState.pokemon.page,
        };
      },
      routeToState(routeState: RouteState) {
        return {
          pokemon: {
            query: routeState.query || '',
            page: routeState.page || 1,
          },
        };
      },
    },
    router: history({
      createURL: (state: PokemonSearchState): string => {
        const { query, page } = state;
        const searchParams = new URLSearchParams();

        if (query?.length > 0) searchParams.set('query', query);
        if (page > 0) searchParams.set('page', String(page));

        return `${serverUrl || window.location.pathname}?${searchParams.toString()}`;
      },
      parseURL: () => {
        const url =
          typeof window === 'undefined'
            ? new URL(serverUrl)
            : new URL(window.location.href);
        const searchParams = url.searchParams;
        return {
          query: searchParams.get('query') || '',
          page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        };
      },
      cleanUrlOnDispose: false,
      writeDelay: 400,
      getLocation() {
        if (typeof window === 'undefined') {
          return new URL(serverUrl);
        }
        return window.location;
      },
    }),
  };
}
