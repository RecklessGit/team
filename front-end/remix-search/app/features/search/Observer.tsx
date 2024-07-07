import { FC, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export const Observer: FC<{ onInView: () => void; className?: string }> = ({
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
