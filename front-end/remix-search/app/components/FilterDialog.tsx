import { Filter, XIcon } from 'lucide-react';
import React from 'react';
import { RefinementList } from './RefinementList'; // Adjust the import path as necessary
import Button from './ui/Button';
import Dialog from './ui/Dialog';

const attributes = ['supertype', 'subtypes']; // Add more attributes as needed

export const FilterDialog: React.FC = () => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button.Root>
          <Button.Icon>
            <Filter />
          </Button.Icon>
          <Button.Label>Filters</Button.Label>
        </Button.Root>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="max-w-5xl bg-slate-300">
          <Dialog.Close asChild>
            <button className="absolute top-4 right-4">
              <XIcon className="w-6 h-6" />
            </button>
          </Dialog.Close>
          <Dialog.Title>Search Filters</Dialog.Title>
          <Dialog.Description className="mt-2">
            {attributes.map((attribute) => (
              <RefinementList key={attribute} attribute={attribute} />
            ))}
            {/* Add more filters as needed */}
          </Dialog.Description>

          <Dialog.Actions className="flex flex-col">
            <Dialog.Close asChild>
              <Button.Root size="lg">
                <Button.Label>Apply</Button.Label>
              </Button.Root>
            </Dialog.Close>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
