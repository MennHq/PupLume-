import React, { useState } from 'react';
import { 
  Dog, 
  Edit3, 
  Heart, 
  ShieldCheck, 
  Phone, 
  Calendar, 
  Award, 
  Sparkles, 
  Camera,
  Cloud
} from 'lucide-react';
import { PuppyProfile } from '../types';
import { storage } from '../lib/storage';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CloudinaryImageUploader } from '../components/ui/CloudinaryImageUploader';

interface PuppyProfileViewProps {
  puppy: PuppyProfile;
  onUpdatePuppy: (updated: PuppyProfile) => void;
}

export const PuppyProfileView: React.FC<PuppyProfileViewProps> = ({ puppy, onUpdatePuppy }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form states
  const [name, setName] = useState(puppy.name);
  const [birthDate, setBirthDate] = useState(puppy.birthDate);
  const [breed, setBreed] = useState(puppy.breed);
  const [weightLbs, setWeightLbs] = useState(puppy.weightLbs.toString());
  const [photoUrl, setPhotoUrl] = useState(puppy.photoUrl);
  const [temperament, setTemperament] = useState(puppy.temperament || '');
  const [dietary, setDietary] = useState(puppy.dietaryRestrictions || '');
  const [treat, setTreat] = useState(puppy.favoriteTreat || '');
  const [vetClinic, setVetClinic] = useState(puppy.vetClinic || '');
  const [vetPhone, setVetPhone] = useState(puppy.vetPhone || '');
  const [microchip, setMicrochip] = useState(puppy.microchipNumber || '');
  const [insurance, setInsurance] = useState(puppy.insuranceProvider || '');

  // Calculate age
  const bDate = new Date(puppy.birthDate);
  const ageWeeks = Math.max(1, Math.floor((new Date().getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));

  const handlePhotoUploaded = (newUrl: string) => {
    setPhotoUrl(newUrl);
    const updated: PuppyProfile = {
      ...puppy,
      photoUrl: newUrl,
    };
    storage.savePuppy(updated);
    onUpdatePuppy(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PuppyProfile = {
      ...puppy,
      name,
      breed,
      birthDate,
      weightLbs: parseFloat(weightLbs) || puppy.weightLbs,
      photoUrl,
      temperament,
      dietaryRestrictions: dietary,
      favoriteTreat: treat,
      vetClinic,
      vetPhone,
      microchipNumber: microchip,
      insuranceProvider: insurance
    };
    storage.savePuppy(updated);
    onUpdatePuppy(updated);
    setIsEditOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Hero Profile Card */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="relative group">
            <img
              src={puppy.photoUrl}
              alt={puppy.name}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-[#8B5E3C] shadow-md"
            />
            <div className="absolute -bottom-2 -right-2">
              <CloudinaryImageUploader
                currentImageUrl={puppy.photoUrl}
                onUploadSuccess={handlePhotoUploaded}
                folder="puplume/puppies"
                label="Photo"
                variant="button"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#2C211B] flex items-center justify-center sm:justify-start gap-2">
                  {puppy.name}
                  <span className="text-xs font-bold uppercase tracking-wider bg-[#F3E7DA] text-[#5F3E29] px-2.5 py-0.5 rounded-full">
                    {puppy.sex}
                  </span>
                </h1>
                <p className="text-sm text-[#766A63] font-medium mt-0.5">
                  {puppy.breed} • {ageWeeks} weeks old ({puppy.weightLbs} lbs)
                </p>
              </div>

              <div className="flex items-center gap-2 self-center sm:self-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(true)}
                  leftIcon={<Edit3 className="w-4 h-4" />}
                >
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Quick stats pills */}
            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2 text-xs">
              <span className="px-3 py-1 rounded-xl bg-[#FFF9F2] border border-[#E8DDD3] text-[#5F3E29] font-medium">
                🎂 Born: {puppy.birthDate || 'Date not set'}
              </span>
              {puppy.favoriteTreat ? (
                <span className="px-3 py-1 rounded-xl bg-[#FFF9F2] border border-[#E8DDD3] text-[#5F3E29] font-medium">
                  🍖 Favorite: {puppy.favoriteTreat}
                </span>
              ) : null}
              {puppy.microchipNumber ? (
                <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                  ✓ Microchipped
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Behavior & Temperament */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Temperament & Traits
          </span>
          <p className="text-xs sm:text-sm text-[#2C211B] leading-relaxed">
            {puppy.temperament || (
              <span className="text-[#766A63] italic">No temperament notes added yet. Tap &quot;Edit Profile&quot; to add details.</span>
            )}
          </p>
        </div>

        {/* Nutrition */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
            <Heart className="w-4 h-4" /> Nutrition & Diet
          </span>
          <p className="text-xs sm:text-sm text-[#2C211B] leading-relaxed">
            {puppy.dietaryRestrictions || (
              <span className="text-[#766A63] italic">No food brand or feeding instructions recorded yet.</span>
            )}
          </p>
        </div>

        {/* Primary Vet Clinic */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Veterinary Clinic
          </span>
          {puppy.vetClinic || puppy.vetPhone || puppy.vetName ? (
            <>
              <h4 className="text-sm font-bold text-[#2C211B]">{puppy.vetClinic || 'Clinic not specified'}</h4>
              {puppy.vetName && <p className="text-xs text-[#5F3E29]">{puppy.vetName}</p>}
              {puppy.vetPhone && (
                <p className="text-xs font-semibold text-[#8B5E3C] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {puppy.vetPhone}
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-[#766A63] italic">No veterinary clinic added yet.</p>
          )}
        </div>

        {/* Identification & Insurance */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8DDD3] shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Identification & Policy
          </span>
          <p className="text-xs text-[#2C211B]">
            Microchip ID: <strong>{puppy.microchipNumber || 'Not recorded'}</strong>
          </p>
          <p className="text-xs text-[#2C211B]">
            Insurance: <strong>{puppy.insuranceProvider || 'Not recorded'}</strong>
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Puppy Profile">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Puppy Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Breed
              </label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
                Weight (lbs)
              </label>
              <input
                type="number"
                step="0.1"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Puppy Photo
            </label>
            <CloudinaryImageUploader
              currentImageUrl={photoUrl}
              onUploadSuccess={(url) => setPhotoUrl(url)}
              folder="puplume/puppies"
              label={`Upload ${name || 'Puppy'}'s Photo`}
              sublabel="Upload a high-quality picture of your pet"
              variant="card"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Diet / Food Formula
            </label>
            <input
              type="text"
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">
              Favorite Treat
            </label>
            <input
              type="text"
              value={treat}
              onChange={(e) => setTreat(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
