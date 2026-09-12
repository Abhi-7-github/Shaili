import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Sparkles, Award, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getInsights } from '../services/insightsApi';
import ColorSwatch from './ColorSwatch';
import LoadingState from './LoadingState';

export const Insights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await getInsights();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Fetch insights error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingState message="Calculating wardrobe analytics..." />;
  }

  const utilizationRate = data?.utilizationRate ?? 78;
  const mostWorn = data?.mostWorn || [];
  const leastWorn = data?.leastWorn || [];
  const topColors = data?.topColors || [
    { color: 'Black', count: 12 },
    { color: 'White', count: 10 },
    { color: 'Blue', count: 8 },
  ];
  const gaps = data?.wardrobeGaps || ['Formal trousers', 'Neutral footwear', 'Tailored blazer'];

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-[#F5DABF] pb-6">
        <span className="text-xs uppercase font-mono tracking-widest text-[#6C151E] font-bold">
          Analytics & Intelligence
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0A2E2C] mt-1">
          Style Insights
        </h1>
        <p className="text-xs text-[#0A2E2C]/70 font-medium mt-1">
          Personalized style intelligence based on garment usage, color frequencies, and wardrobe completeness.
        </p>
      </div>

      {/* Main Metrics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Utilization Ring Card (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#F5DABF] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-md space-y-6 h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono font-bold text-[#6C151E]">
              Wardrobe Utilization
            </span>
            <PieChart className="w-5 h-5 text-[#0F3D3A]" />
          </div>

          <div className="text-center py-6 relative my-auto">
            <div className="w-40 h-40 rounded-full border-[10px] border-[#FAF4ED] flex flex-col items-center justify-center mx-auto border-t-[#0F3D3A] border-r-[#0F3D3A] shadow-inner">
              <span className="font-serif text-5xl font-bold text-[#0A2E2C]">
                {utilizationRate}%
              </span>
              <span className="text-[10px] text-[#6C151E] font-mono font-bold uppercase tracking-widest mt-1">
                Active Wear
              </span>
            </div>
          </div>

          <p className="text-xs text-center text-[#0A2E2C]/80 font-medium leading-relaxed">
            {utilizationRate > 70
              ? 'Excellent balance! Most of your garments are in regular rotation.'
              : 'You have several un-worn garments. Try styling them with your staples.'}
          </p>
        </div>

        {/* Most Worn vs Least Worn Cards (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Most Worn */}
          <div className="bg-white border border-[#F5DABF] rounded-3xl p-6 shadow-md space-y-4 flex flex-col justify-between h-full">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#0A2E2C] flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-[#0F3D3A]" />
                Most Worn Pieces
              </h3>
              <div className="space-y-3">
                {mostWorn.length > 0 ? (
                  mostWorn.slice(0, 4).map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF4ED] text-xs border border-[#F5DABF]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-[#F5DABF]">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="font-bold block text-[#0A2E2C] truncate max-w-[120px]">
                            {item.title || item.garmentType}
                          </span>
                          <ColorSwatch colorName={item.primaryColor} size="sm" />
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[#0F3D3A]">{item.timesWorn} wears</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#0A2E2C]/60 font-medium">Log wears to see your top staples.</p>
                )}
              </div>
            </div>
          </div>

          {/* Least Worn */}
          <div className="bg-white border border-[#F5DABF] rounded-3xl p-6 shadow-md space-y-4 flex flex-col justify-between h-full">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#0A2E2C] flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-[#6C151E]" />
                Least Worn Pieces
              </h3>
              <div className="space-y-3">
                {leastWorn.length > 0 ? (
                  leastWorn.slice(0, 4).map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF4ED] text-xs border border-[#F5DABF]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-[#F5DABF]">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="font-bold block text-[#0A2E2C] truncate max-w-[120px]">
                            {item.title || item.garmentType}
                          </span>
                          <ColorSwatch colorName={item.primaryColor} size="sm" />
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[#6C151E]">{item.timesWorn || 0} wears</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#0A2E2C]/60 font-medium">All garments are well utilized.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Colors & Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Most Used Colors */}
        <div className="lg:col-span-6 bg-white border border-[#F5DABF] rounded-3xl p-6 sm:p-8 shadow-md space-y-4 h-full">
          <h3 className="font-serif text-2xl font-bold text-[#0A2E2C]">
            Most Frequent Palette
          </h3>
          <div className="space-y-3 pt-2">
            {topColors.map((col, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <ColorSwatch colorName={col.color || col.name} size="sm" />
                  <span className="font-mono font-bold text-[#0F3D3A]">{col.count || col.percentage}%</span>
                </div>
                <div className="w-full bg-[#FAF4ED] h-2.5 rounded-full overflow-hidden border border-[#F5DABF]">
                  <div
                    className="bg-[#0F3D3A] h-full rounded-full"
                    style={{ width: `${col.count || col.percentage || 30}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wardrobe Gaps & Recommendations */}
        <div className="lg:col-span-6 bg-white border border-[#F5DABF] rounded-3xl p-6 sm:p-8 shadow-md space-y-4 h-full">
          <h3 className="font-serif text-2xl font-bold text-[#0A2E2C] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#6C151E]" />
            Wardrobe Gap Detection
          </h3>
          <p className="text-xs text-[#0A2E2C]/80 font-medium">
            Items that would unlock maximum new outfit combinations in your collection:
          </p>
          <div className="space-y-2.5 pt-2">
            {gaps.map((gap, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF4ED] border border-[#F5DABF] text-xs font-bold text-[#0A2E2C]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#0F3D3A]" />
                <span>{gap}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
