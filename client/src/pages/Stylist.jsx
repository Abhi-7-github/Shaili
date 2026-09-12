import React, { useState } from 'react';
import StylistForm from '../components/StylistForm';
import StylistResults from '../components/StylistResults';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { generateOutfits } from '../services/stylistApi';
import { saveOutfit, markOutfitWorn } from '../services/outfitApi';

export const Stylist = ({ initialGarment = null, onOpenStudioWithOutfit }) => {
  const [loading, setLoading] = useState(false);
  const [outfits, setOutfits] = useState([]);
  const [error, setError] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateOutfits(params);
      if (res.success && res.data && Array.isArray(res.data.outfits)) {
        setOutfits(res.data.outfits);
        setHasGenerated(true);
      } else {
        setOutfits([]);
        setHasGenerated(true);
      }
    } catch (err) {
      console.error('Outfit generation failed:', err);
      setError(err.message || 'Something went wrong while styling your wardrobe.');
      setHasGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOutfit = async (outfit) => {
    try {
      const garmentIds = (outfit.items || outfit.garmentIds || []).map((i) => i._id || i);
      await saveOutfit({
        garmentIds,
        occasion: outfit.occasion || 'casual',
        style: outfit.style || 'casual',
        score: outfit.finalScore || outfit.score || 88,
      });
      alert('Outfit saved to your style history!');
    } catch (err) {
      console.error('Save outfit error:', err);
    }
  };

  const handleMarkWorn = async (outfit) => {
    try {
      const garmentIds = (outfit.items || outfit.garmentIds || []).map((i) => i._id || i);
      await saveOutfit({
        garmentIds,
        occasion: outfit.occasion || 'casual',
        style: outfit.style || 'casual',
        score: outfit.finalScore || outfit.score || 88,
      });
      alert('Outfit marked as worn!');
    } catch (err) {
      console.error('Mark worn error:', err);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {!hasGenerated ? (
        <StylistForm
          onGenerate={handleGenerate}
          loading={loading}
          initialGarment={initialGarment}
        />
      ) : loading ? (
        <LoadingState message="Styling your wardrobe..." />
      ) : error ? (
        <div className="space-y-6">
          <EmptyState
            title="Styling Error"
            description={error}
            actionLabel="Try Again"
            onAction={() => {
              setHasGenerated(false);
              setError(null);
            }}
          />
        </div>
      ) : outfits.length === 0 ? (
        <EmptyState
          title="No Compatible Outfits Found"
          description="We couldn't find a strong match from your current wardrobe for those criteria. Try uploading more tops and bottoms!"
          actionLabel="Adjust Parameters"
          onAction={() => setHasGenerated(false)}
        />
      ) : (
        <StylistResults
          outfits={outfits}
          onSaveOutfit={handleSaveOutfit}
          onMarkWorn={handleMarkWorn}
          onOpenStudioWithOutfit={onOpenStudioWithOutfit}
          onReset={() => setHasGenerated(false)}
        />
      )}
    </div>
  );
};

export default Stylist;
