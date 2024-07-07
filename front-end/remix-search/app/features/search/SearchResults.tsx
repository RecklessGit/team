import { useVirtualizer } from '@tanstack/react-virtual';
import { Hit } from 'instantsearch.js';
import { AppWindowIcon, GridIcon } from 'lucide-react';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useInfiniteHits } from 'react-instantsearch';
import { useInView } from 'react-intersection-observer';
import { PokemonCard, PokemonCardProps } from '../../components/PokemonCard';
import Button from '../../components/ui/Button';
import ScrollArea from '../../components/ui/ScrollArea';

const LARGE_ITEMS_PER_ROW = 3;
const SMALL_ITEMS_PER_ROW = 6;

const Observer: FC<{ onInView: () => void; className?: string }> = ({
  onInView,
  className,
}) => {
  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView) {
      onInView();
    }
  }, [inView, onInView]);

  return <div ref={ref} className={className} />;
};

const ToggleViewButton: FC<{ isLargeView: boolean; onToggle: () => void }> = ({
  isLargeView,
  onToggle,
}) => {
  return (
    <Button.Root onClick={onToggle} className="mb-4 p-2 w-max px-4 ml-auto">
      <Button.Icon>
        {isLargeView ? <GridIcon /> : <AppWindowIcon />}
      </Button.Icon>
      <Button.Label>
        {isLargeView ? 'Switch to Small View' : 'Switch to Large View'}
      </Button.Label>
    </Button.Root>
  );
};

export const SearchResults: FC = () => {
  const { results, showMore, showPrevious, isFirstPage, isLastPage } =
    useInfiniteHits<Hit<PokemonCardProps>>();
  const parentRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Hit<PokemonCardProps>[]>([]);
  const [isLargeView, setIsLargeView] = useState(true);

  useEffect(() => {
    if (results?.page === 0) {
      setItems(results.hits);
      if (parentRef.current) {
        parentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (results?.hits) {
      setItems((prevItems) => {
        const newHits = results.hits.filter(
          (hit) => !prevItems.some((item) => item.objectID === hit.objectID)
        );
        return [...prevItems, ...newHits];
      });
    }
  }, [results?.page]);

  const ITEMS_PER_ROW = isLargeView ? LARGE_ITEMS_PER_ROW : SMALL_ITEMS_PER_ROW;
  const CARD_HEIGHT = isLargeView ? 360 : 220;
  const CARD_WIDTH = '100%';

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(items.length / ITEMS_PER_ROW),
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT,
    overscan: 18,
  });

  const handleTopInView = useCallback(() => {
    if (items.length > 0 && !isFirstPage) {
      showPrevious();
    }
  }, [items.length, isFirstPage, showPrevious]);

  const handleBottomInView = useCallback(() => {
    showMore();
  }, [showMore]);

  const toggleView = useCallback(() => {
    setIsLargeView((prev) => !prev);
  }, []);
  return (
    <>
      <ToggleViewButton isLargeView={isLargeView} onToggle={toggleView} />
      {!isFirstPage && <Observer onInView={handleTopInView} className="h-1" />}
      <ScrollArea.Root className="h-[900px]">
        <ScrollArea.Viewport className="w-full relative" ref={parentRef}>
          <div
            className="w-full relative"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const startIndex = virtualRow.index * ITEMS_PER_ROW;
              const endIndex = startIndex + ITEMS_PER_ROW;
              const rowItems = items.slice(startIndex, endIndex);

              return (
                <div
                  key={virtualRow.key}
                  className="absolute top-0 left-0 w-full"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="flex gap-2">
                    {rowItems.map((hit, index) => (
                      <div key={hit.objectID || index} className="flex-1">
                        {hit && (
                          <PokemonCard
                            images={hit.images}
                            height={CARD_HEIGHT}
                            width={CARD_WIDTH}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {!isLastPage && (
            <Observer onInView={handleBottomInView} className="h-1" />
          )}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" />
      </ScrollArea.Root>
    </>
  );
};
