import { RefinementListConnectorParams } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';
import { Title } from '../../components/typography';
import Accordion from '../../components/ui/Accordion';
import { RefinementList } from './RefinementList';

export const AccordionRefinementList: React.FC<
  RefinementListConnectorParams
> = (props) => {
  const title = props?.attribute?.split('.')?.[0];

  return (
    <Accordion.Root type="single" collapsible className="w-full">
      <Accordion.Item value={props?.attribute}>
        <Accordion.Trigger>
          <Title as="h5" size="lg">
            {title}
          </Title>
        </Accordion.Trigger>
        <Accordion.Content>
          <RefinementList
            className="flex flex-row w-100% flex-wrap gap-4 my-4"
            {...props}
          />
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};
