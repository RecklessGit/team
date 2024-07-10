import { ChevronDown } from 'lucide-react';
import Button from '../../components/ui/Button';
import DropdownMenu from '../../components/ui/DropdownMenu';
import { useSortBy } from 'react-instantsearch';
import { COLLECTION_NAME } from '../../routing';

export const SortBy = () => {
  const { options, currentRefinement, refine } = useSortBy({
    items: [
      { value: `${COLLECTION_NAME}/sort`, label: 'Default' },
      { value: `${COLLECTION_NAME}/sort/level:asc`, label: 'Level Ascending' },
      { value: `${COLLECTION_NAME}/sort/level:desc`, label: 'Level Descending' },
    ],
  });

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button.Root>
          <Button.Label>Sort By</Button.Label>
          <Button.Icon type="trailing">
            <ChevronDown />
          </Button.Icon>
        </Button.Root>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content mixed sideOffset={5}>
          {options.map((item) => (
            <DropdownMenu.Item
              key={item.value}
              onClick={() => refine(item.value)}
              style={{
                fontWeight:
                  item.value === currentRefinement ? 'bold' : 'normal',
              }}
            >
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
