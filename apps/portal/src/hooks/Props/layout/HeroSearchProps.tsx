import type { Location } from '@obtp/shared-types';

export interface UseHeroSearchLogicProps {
 onSearch?: (params: {
    fromProvince: string;
    toProvince: string;
    date?: string;
  }) => void;  initialFrom?: Location | null;
  initialTo?: Location | null;
}

export interface HeroSearchProps extends UseHeroSearchLogicProps {}
