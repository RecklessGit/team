import { Filter, XIcon } from 'lucide-react';
import React from 'react';
import Button from '../../components/ui/Button';
import Dialog from '../../components/ui/Dialog';
import ScrollArea from '../../components/ui/ScrollArea';
import {
  AccordionRefinementList
} from './AccordionRefinementList';
import { VirtualRefinementList } from './VirtualRefinementList';

const REFINEMENT_ATTRIBUTES = [
  'subtypes',
  'types',
  'resistances.type',
  'weaknesses.type',
  'attacks.name',
];

export const FilterDialog: React.FC = () => {
  return (
    <>
      {REFINEMENT_ATTRIBUTES.map((attribute, index) => (
        <VirtualRefinementList attribute={attribute} key={index} />
      ))}
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
          <Dialog.Content className="max-w-5xl bg-slate-300 max-h-5xl">
            <Dialog.Close asChild>
              <button className="absolute top-4 right-4">
                <XIcon className="w-6 h-6" />
              </button>
            </Dialog.Close>
            <Dialog.Title className="pl-2 mb-4" size="lg">
              Search Filters
            </Dialog.Title>
            <ScrollArea.Root className="h-96">
              <ScrollArea.Viewport className="w-full">
                <Dialog.Description className="p-2">
                  {REFINEMENT_ATTRIBUTES.map((attribute) => (
                    <AccordionRefinementList
                      key={attribute}
                      attribute={attribute}
                    />
                  ))}
                </Dialog.Description>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar orientation="vertical" />
            </ScrollArea.Root>

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
    </>
  );
};
