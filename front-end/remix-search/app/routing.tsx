import { UiState } from 'instantsearch.js';
import { history } from 'instantsearch.js/cjs/lib/routers/index.js';

type RouteState = {
  query?: string;
  page?: number;
  [key: string]: string | number | string[] | undefined;
};

export const COLLECTION_NAME = 'pokemon';

const REFINEMENT_ATTRIBUTES = [
  'supertype',
  'subtypes',
  'types',
  'resistances.type',
  'weaknesses.type',
  'attacks.name',
];

export function routing(serverUrl: string) {
  const router = history({
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
      routeState: RouteState;
      location: Location;
    }) => {
      const urlParts = location.href.match(/^(.*?\/search)(\/.*)?/);
      const url = urlParts?.[1]?.split('?')[0] ?? './';

      const queryParameters: Record<string, string | number> = {};

      REFINEMENT_ATTRIBUTES.forEach((attribute) => {
        const attributeValue = routeState[attribute];
        if (
          attributeValue &&
          Array.isArray(attributeValue) &&
          attributeValue.length > 0
        ) {
          queryParameters[attribute] = attributeValue.join(',');
        }
      });

      if (routeState.sortBy) {
        queryParameters.sortBy = routeState.sortBy.toString();
      }

      if (routeState.page) {
        queryParameters.page = routeState.page;
      }

      if (routeState.query && routeState.query?.length > 0) {
        queryParameters.query = routeState.query;
      }

      const queryString = qsModule.stringify(queryParameters, {
        addQueryPrefix: true,
        arrayFormat: 'repeat',
      });

      return constructEncodedURL(url, '', queryString);
    },
    parseURL({ qsModule, location }: { qsModule: any; location: Location }) {
      const parse = qsModule.parse(location.search.slice(1));
      const { query = '', page, sortBy = '', ...rest } = parse;

      const refinements: RouteState = {};
      REFINEMENT_ATTRIBUTES.forEach((attribute) => {
        if (rest[attribute]) {
          refinements[attribute] = rest[attribute].split(',');
        }
      });

      return {
        query,
        page,
        sortBy,
        ...refinements,
      };
    },
  });

  const stateMapping = {
    stateToRoute(uiState: UiState): RouteState {
      const indexUiState = uiState['pokemon'] || {};
      const routeState: RouteState = {
        query: indexUiState.query,
        page: indexUiState.page,
        sortBy: indexUiState.sortBy,
      };

      REFINEMENT_ATTRIBUTES.forEach((attribute) => {
        const refinementList = indexUiState?.refinementList?.[attribute] || [];
        if (refinementList.length > 0) {
          routeState[attribute] = refinementList;
        }
      });

      return routeState;
    },
    routeToState(routeState: RouteState): UiState {
      const refinementList: Record<string, string[]> = {};

      REFINEMENT_ATTRIBUTES.forEach((attribute) => {
        refinementList[attribute] = (routeState[attribute] as string[]) || [];
      });

      return {
        pokemon: {
          query: routeState.query || '',
          page: routeState.page || 1,
          sortBy: routeState.sortBy || '',
          refinementList,
        },
      };
    },
  };

  return { router, stateMapping };
}

export function constructEncodedURL(
  url: string,
  urlParameters: string,
  queryString: string
) {
  const parameterPath = urlParameters ? '/' + urlParameters : '';
  const encodedURL = `${url}${parameterPath}${queryString ? queryString : ''}`;

  return encodedURL;
}
