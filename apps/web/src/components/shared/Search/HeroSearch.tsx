import {
  Search,
  ArrowRightLeft,
} from 'lucide-react';
import { HeroLocationSlider } from './HeroLocationSlider';
import { CustomDatePicker } from './CustomDatePicker';
import type { HeroSearchProps } from '../../../hooks/Props/layout/HeaderProps';
import { useHeroSearchLogic } from '../../../hooks/Logic/useHeaderLogic';

export function HeroSearch(props: HeroSearchProps) {
  const logic = useHeroSearchLogic(props);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="relative bg-gradient-to-br from-blue-600 to-teal-500 py-24">
      <div className="max-w-7xl mx-auto px-4">

        {/* SEARCH CARD */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

            {/* FROM */}
            <div className="relative md:col-span-4">
              <input
                ref={logic.fromInputRef}
                value={logic.fromText}
                onChange={(e) => {
                  logic.setFromText(e.target.value);
                  logic.setFromLocation(null);
                  logic.setShowFromSuggestions(true);
                }}
                className="w-full pl-10 pr-10 py-3.5 border-2 rounded-xl"
              />

              {logic.showFromSuggestions && (
                <div className="absolute z-20 w-full bg-white shadow-xl">
                  {logic.fromSuggestions.map(loc => (
                    <button
                      key={loc.id}
                      onMouseDown={() => {
                        logic.setFromLocation(loc);
                        logic.setFromText(`${loc.name}, ${loc.province}`);
                        logic.setShowFromSuggestions(false);
                      }}
                      className="block w-full text-left px-4 py-2"
                    >
                      {loc.name}, {loc.province}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SWAP */}
            <button onClick={logic.handleSwap}>
              <ArrowRightLeft />
            </button>

            {/* TO */}
            <div className="relative md:col-span-4">
              <input
                ref={logic.toInputRef}
                value={logic.toText}
                onChange={(e) => {
                  logic.setToText(e.target.value);
                  logic.setToLocation(null);
                  logic.setShowToSuggestions(true);
                }}
                className="w-full pl-10 pr-10 py-3.5 border-2 rounded-xl"
              />
            </div>

            {/* DATE */}
            <CustomDatePicker
              value={logic.date}
              min={today}
              onChange={logic.setDate}
            />
          </div>

          <button
            onClick={logic.handleSearch}
            className="w-full mt-6 py-4 bg-blue-600 text-white rounded-xl"
          >
            <Search /> Search
          </button>
        </div>

        <HeroLocationSlider />
      </div>
    </div>
  );
}
