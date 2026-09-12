import React, { useState } from 'react';
import { Sparkles, Thermometer, CloudSun, Palette, Compass, SlidersHorizontal } from 'lucide-react';

const OCCASIONS = [
  'Casual',
  'College',
  'Office',
  'Party',
  'Wedding',
  'Travel',
  'Date',
  'Traditional',
];

const STYLES = [
  'Casual',
  'Smart Casual',
  'Formal',
  'Streetwear',
  'Ethnic',
  'Minimal',
  'Party',
];

const WEATHER_CONDITIONS = ['sunny', 'rainy', 'cold', 'hot', 'windy'];
const COMMON_COLORS = ['White', 'Black', 'Blue', 'Navy', 'Green', 'Brown', 'Beige', 'Red', 'Grey', 'Yellow'];

export const StylistForm = ({ onGenerate, loading = false, initialGarment = null }) => {
  const [occasion, setOccasion] = useState('Casual');
  const [style, setStyle] = useState('Smart Casual');
  const [weather, setWeather] = useState({
    temperature: 26,
    condition: 'sunny',
  });
  const [preferences, setPreferences] = useState({
    preferredColors: [],
    avoidColors: [],
    preferredStyles: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onGenerate) {
      onGenerate({
        occasion: occasion.toLowerCase(),
        style: style.toLowerCase(),
        weather,
        preferences,
        prioritizedGarmentId: initialGarment?._id,
      });
    }
  };

  const togglePreferredColor = (col) => {
    setPreferences((prev) => {
      const exists = prev.preferredColors.includes(col);
      return {
        ...prev,
        preferredColors: exists
          ? prev.preferredColors.filter((c) => c !== col)
          : [...prev.preferredColors, col],
        avoidColors: prev.avoidColors.filter((c) => c !== col),
      };
    });
  };

  const toggleAvoidColor = (col) => {
    setPreferences((prev) => {
      const exists = prev.avoidColors.includes(col);
      return {
        ...prev,
        avoidColors: exists
          ? prev.avoidColors.filter((c) => c !== col)
          : [...prev.avoidColors, col],
        preferredColors: prev.preferredColors.filter((c) => c !== col),
      };
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#FAF4ED] border border-[#F5DABF] rounded-3xl p-6 md:p-8 shadow-xl max-w-3xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-mono tracking-widest text-[#6C151E] font-bold">
          AI Styling Engine
        </span>
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#0A2E2C]">
          AI Stylist
        </h2>
        <p className="text-sm text-[#0A2E2C]/80 font-medium max-w-md mx-auto">
          Your wardrobe. Your style. Intelligently matched.
        </p>

        {initialGarment && (
          <div className="inline-flex items-center gap-2 bg-[#0F3D3A] text-[#FAF4ED] px-4 py-1.5 rounded-full text-xs font-bold mt-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F5DABF]" />
            Prioritizing item: {initialGarment.title || initialGarment.garmentType}
          </div>
        )}
      </div>

      {/* Occasion Selection */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#0F3D3A]" /> Select Occasion
        </label>
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((occ) => {
            const active = occasion === occ;
            return (
              <button
                key={occ}
                type="button"
                onClick={() => setOccasion(occ)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-[#0F3D3A] text-[#FAF4ED] shadow-md scale-105'
                    : 'bg-white text-[#0A2E2C] hover:bg-[#F5DABF]/40 border border-[#F5DABF]'
                }`}
              >
                {occ}
              </button>
            );
          })}
        </div>
      </div>

      {/* Style Aesthetics */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#6C151E]" /> Desired Aesthetic
        </label>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((st) => {
            const active = style === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStyle(st)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-[#6C151E] text-[#FAF4ED] shadow-md scale-105'
                    : 'bg-white text-[#0A2E2C] hover:bg-[#F5DABF]/40 border border-[#F5DABF]'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Weather Settings */}
      <div className="space-y-4 bg-white p-5 rounded-2xl border border-[#F5DABF] shadow-xs">
        <label className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-[#6C151E]" /> Weather & Temperature
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <div className="flex justify-between text-xs text-[#0A2E2C] font-semibold mb-1">
              <span>Temperature</span>
              <span className="font-mono font-bold text-[#0F3D3A]">{weather.temperature}°C</span>
            </div>
            <input
              type="range"
              min="5"
              max="45"
              value={weather.temperature}
              onChange={(e) => setWeather({ ...weather, temperature: parseInt(e.target.value, 10) })}
              className="w-full accent-[#0F3D3A]"
            />
          </div>

          <div>
            <span className="block text-xs text-[#0A2E2C] font-semibold mb-1">Condition</span>
            <div className="flex flex-wrap gap-1.5">
              {WEATHER_CONDITIONS.map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setWeather({ ...weather, condition: cond })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    weather.condition === cond
                      ? 'bg-[#0F3D3A] text-[#FAF4ED]'
                      : 'bg-[#FAF4ED] text-[#0A2E2C] border border-[#F5DABF]'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Color Preferences */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#0F3D3A]" /> Color Preferences
        </label>
        <div className="space-y-3 text-xs">
          <div>
            <span className="text-[#0A2E2C]/80 font-bold block mb-1">Preferred Colors (Click to highlight)</span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_COLORS.map((col) => {
                const isPreferred = preferences.preferredColors.includes(col);
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => togglePreferredColor(col)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      isPreferred
                        ? 'bg-[#0F3D3A] text-[#FAF4ED] shadow-xs'
                        : 'bg-white text-[#0A2E2C] border border-[#F5DABF]'
                    }`}
                  >
                    {isPreferred ? `✓ ${col}` : col}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-[#0A2E2C]/80 font-bold block mb-1">Avoid Colors</span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_COLORS.map((col) => {
                const isAvoided = preferences.avoidColors.includes(col);
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => toggleAvoidColor(col)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      isAvoided
                        ? 'bg-[#6C151E] text-[#FAF4ED] shadow-xs'
                        : 'bg-white text-[#0A2E2C] border border-[#F5DABF]'
                    }`}
                  >
                    {isAvoided ? `✕ ${col}` : col}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Submit CTA */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-[#0F3D3A] hover:bg-[#0A2E2C] text-[#FAF4ED] font-serif text-xl font-bold rounded-2xl shadow-xl transition-all hover:shadow-2xl active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-60 uppercase tracking-wider"
      >
        <Sparkles className="w-5 h-5 text-[#F5DABF] animate-pulse" />
        <span>{loading ? 'Styling your wardrobe...' : '✦ Generate My Outfits'}</span>
      </button>
    </form>
  );
};

export default StylistForm;
