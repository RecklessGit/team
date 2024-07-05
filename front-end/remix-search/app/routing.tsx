import { UiState } from 'instantsearch.js';
import { history } from 'instantsearch.js/cjs/lib/routers/index.js';

type RouteState = {
  query?: string;
  page?: number;
  subtypes?: string[];
  supertype?: string[];
};

export function routing(serverUrl: string) {
  return {
    router: history({
      cleanUrlOnDispose: false,
      getLocation() {
        if (typeof window === 'undefined') {
          return new URL(serverUrl);
        }

        return window.location;
      },
      createURL: ({
        qsModule,
        routeState,
        location,
      }: {
        qsModule: any;
        routeState: {
          query: string;
          page: number;
          subtypes: string[];
          supertype: string[];
        };
        location: Location;
      }) => {
        const urlParts = (serverUrl || location.href).match(
          /^(.*?\/search)(\/.*)?/
        );

        const url = urlParts?.[1]?.split('?')[0] ?? './';

        const urlParameters = '';
        const queryParameters: Record<string, string | number> = {};

        if (routeState.page && routeState.page !== 1) {
          queryParameters.page = routeState.page;
        }

        if (routeState.query && routeState.query?.length > 0) {
          queryParameters.query = routeState.query;
        }
        if (routeState.subtypes && routeState.subtypes?.length > 0) {
          queryParameters.subtypes = routeState.subtypes.join(',');
        }
        if (routeState.supertype && routeState.supertype?.length > 0) {
          queryParameters.supertype = routeState.supertype.join(',');
        }

        const queryString = qsModule.stringify(queryParameters, {
          addQueryPrefix: true,
          arrayFormat: 'repeat',
        });

        return constructEncodedURL(url, urlParameters, queryString);
      },
      parseURL({ qsModule, location }: { qsModule: any; location: Location }) {
        const parse = qsModule.parse(
          serverUrl?.split('?')?.[0] || location.search.slice(1)
        );
        const { query = '', page, sortBy, subtypes, supertype } = parse;

        return {
          query,
          page,
          sortBy,
          supertype: supertype ? supertype?.split(',') : [],
          subtypes: subtypes ? subtypes?.split(',') : [],
        };
      },
    }),
    stateMapping: {
      stateToRoute(uiState: UiState) {
        const indexUiState = uiState['pokemon'] || {};
        return {
          query: indexUiState.query,
          page: indexUiState.page,
          subtypes: indexUiState?.refinementList?.subtypes || [],
          supertype: indexUiState?.refinementList?.supertype || [],
        };
      },
      routeToState(routeState: RouteState) {
        return {
          pokemon: {
            query: routeState.query || '',
            page: routeState.page || 1,
            refinementList: {
              subtypes: routeState?.subtypes || [],
              supertype: routeState?.supertype || [],
            },
          },
        };
      },
    },
  };
}

export function constructEncodedURL(
  url: string,
  urlParameters: string,
  queryString: Record<string, string | number> | string
) {
  const parameterPath = urlParameters ? '/' + urlParameters : '';
  const encodedURL = `${url}${parameterPath}${queryString ? queryString : ''}`;

  return encodedURL;
}
