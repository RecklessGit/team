import { useRefinementList } from 'react-instantsearch';
import Toggle from '../../components/ui/Toggle';
import { useCallback } from 'react';
import { RefinementListConnectorParams } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';

export const RefinementList = ({
  attribute,
  className,
  ...rest
}: {
  attribute: string;
  className: string;
} & RefinementListConnectorParams) => {
  const { items, refine, createURL } = useRefinementList({
    attribute,
    sortBy: ['name:asc', 'count:desc'],
    ...rest,
  });

  const onClick = useCallback(
    (item: string) => {
      createURL(item);
      refine(item);
    },
    [createURL, refine]
  );

  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center">
          <Toggle.Root
            size="lg"
            variant="mixed"
            aria-label={`Toggle ${item.label}`}
            onClick={() => onClick(item.value)}
            data-state={item.isRefined ? 'on' : 'off'}
            aria-pressed={item.isRefined}
            className="w-max px-4 flex items-center capitalize"
            data-testid={`${`${item.label.toLowerCase().replace(/\s/g, '-')}`}-item`}
          >
            {item.label} ({item.count})
          </Toggle.Root>
        </li>
      ))}
    </ul>
  );
};
