export interface LocationItem {
  id: string;
  name: string;
  province: string;
}

export interface UseHeroSearchLogicProps {
  onSearch?: (from: string, to: string, date: string) => void;
  initialFrom?: string;
  initialTo?: string;
}