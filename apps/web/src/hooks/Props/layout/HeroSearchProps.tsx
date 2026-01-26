import type { Location } from '@obtp/shared-types';

export interface UseHeroSearchLogicProps {
  onSearch?: (fromId: string, toId: string, date: string) => void;
  initialFrom?: Location | null;
  initialTo?: Location | null;
}

export interface HeroSearchProps extends UseHeroSearchLogicProps {}
