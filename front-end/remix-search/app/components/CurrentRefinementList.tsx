import {
  CurrentRefinementsConnectorParams,
  CurrentRefinementsConnectorParamsRefinement,
} from 'instantsearch.js/es/connectors/current-refinements/connectCurrentRefinements';
import { XCircleIcon } from 'lucide-react';
import React, { memo, useCallback } from 'react';
import { useCurrentRefinements } from 'react-instantsearch';
import { Title } from './typography';
import Toggle from './ui/Toggle';

interface CurrentRefinementListProps
  extends Omit<CurrentRefinementsConnectorParams, 'transformItems'> {}

const RefinementsList: React.FC<CurrentRefinementListProps> = (props) => {
  const { items, refine } = useCurrentRefinements(props);

  const onClickHandler = useCallback(
    (item: CurrentRefinementsConnectorParamsRefinement) => {
      refine(item);
    },
    [refine]
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <Title as="h3">Selected</Title>
      <ul className="flex flex-row w-full flex-wrap gap-4 my-4">
        {items.map((item) =>
          item.refinements.map((inner) => {
            const dataTestId = `${inner.attribute.toLowerCase().replace(/\s/g, '-')}`;
            return (
              <li key={inner.label} className="flex items-center">
                <Toggle.Root
                  size="lg"
                  aria-label={`Toggle ${inner.label}`}
                  onClick={() => onClickHandler(inner)}
                  className="w-max bg-primary-400 px-4 flex items-center capitalize"
                  data-testid={`${dataTestId}-item`}
                >
                  {inner.attribute}: {inner.label}
                  <Toggle.Icon className="ml-2 capitalize">
                    <XCircleIcon />
                  </Toggle.Icon>
                </Toggle.Root>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export const CurrentRefinementList = memo(RefinementsList);
