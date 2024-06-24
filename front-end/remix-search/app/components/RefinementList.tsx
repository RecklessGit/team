import { RefinementListConnectorParams } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';
import { useRefinementList } from 'react-instantsearch';
import { Title } from './typography';
import Toggle from './ui/Toggle';

export const RefinementList: React.FC<RefinementListConnectorParams> = ({
  attribute,
  ...rest
}) => {
  const { items, refine, createURL } = useRefinementList({
    attribute,
    sortBy: ['name:asc', 'count:desc'],
    ...rest,
  });

  const onClick = (item: string) => {
    createURL(item);
    refine(item);
  };

  return (
    <div>
      <Title as="h3">{attribute}</Title>
      <ul className="flex flex-row w-100% flex-wrap gap-4 my-4">
        {items.map((item) => (
          <li key={item.label}>
            <Toggle.Root
              size="md"
              aria-label="Toggle bold"
              onClick={() => onClick(item.value)}
              className="w-max bg-primary-400 px-4"
            >
              {item.label} ({item.count})
            </Toggle.Root>
          </li>
        ))}
      </ul>
    </div>
  );
};
