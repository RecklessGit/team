import { RefinementListConnectorParams } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';
import { useRefinementList } from 'react-instantsearch';

export const VirtualRefinementList: React.FC<RefinementListConnectorParams> = ({
  attribute,
  ...rest
}) => {
  useRefinementList({
    attribute,
    sortBy: ['name:asc', 'count:desc'],
    ...rest,
  });

  return null;
};
