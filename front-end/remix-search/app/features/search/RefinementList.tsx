import { RefinementListConnectorParams } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';
import { useRefinementList } from 'react-instantsearch';
import { Title, Text } from '../../components/typography';
import Toggle from '../../components/ui/Toggle';
import Accordion from '../../components/ui/Accordion';

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
    <Accordion.Root
      type="single"
      collapsible
      className="w-full"
    >
      <Accordion.Item value={attribute}>
        <Accordion.Trigger>
          <Title as="h5" size="sm">{attribute?.split('.')?.[0]}</Title>
        </Accordion.Trigger>
        <Accordion.Content>
          <ul className="flex flex-row w-100% flex-wrap gap-4 my-4">
            {items.map((item) => (
              <li key={item.label}>
                <Toggle.Root
                  size="sm"
                  aria-label="Toggle bold"
                  onClick={() => onClick(item.value)}
                  className="w-max bg-primary-400 px-4"
                >
                  <Text size="sm">
                    {item.label} ({item.count})
                  </Text>
                </Toggle.Root>
              </li>
            ))}
          </ul>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};
