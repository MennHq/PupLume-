import React, { useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Pill, 
  Calendar as CalendarIcon, 
  Scale, 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Download,
  ExternalLink 
} from 'lucide-react';
import { 
  PuppyProfile, 
  VaccinationRecord, 
  MedicationRecord, 
  VetAppointment 
} from '../types';
import { storage } from '../lib/storage';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

interface HealthCenterViewProps {
  puppy: PuppyProfile;
}

export const HealthCenterView: React.FC<HealthCenterViewProps> = ({ puppy }) => {
  const [activeTab, setActiveTab] = useState<'vaccines' | 'meds' | 'appointments' | 'weight'>('vaccines');
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>(storage.getVaccinations());
  const [medications, setMedications] = useState<MedicationRecord[]>(storage.getMedications());
  const [appointments, setAppointments] = useState<VetAppointment[]>(storage.getAppointments());

  React.useEffect(() => {
    return storage.subscribe(() => {
      setVaccinations([...storage.getVaccinations()]);
      setMedications([...storage.getMedications()]);
      setAppointments([...storage.getAppointments()]);
    });
  }, []);


  // Modals
  const [isAddVacOpen, setIsAddVacOpen] = useState(false);
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [isAddAptOpen, setIsAddAptOpen] = useState(false);
  const [isAddWeightOpen, setIsAddWeightOpen] = useState(false);

  // Vac Form
  const [vacName, setVacName] = useState('');
  const [vacAdminDate, setVacAdminDate] = useState('');
  const [vacDueDate, setVacDueDate] = useState('');
  const [vacClinic, setVacClinic] = useState(puppy.vetClinic || '');

  // Med Form
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('Monthly');

  // Apt Form
  const [aptTitle, setAptTitle] = useState('');
  const [aptDate, setAptDate] = useState('');
  const [aptTime, setAptTime] = useState('09:00 AM');
  const [aptReason, setAptReason] = useState('');

  // Weight Form
  const [newWeight, setNewWeight] = useState(puppy.weightLbs.toString());

  const handleAddVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacName.trim()) return;
    storage.addVaccination({
      puppyId: puppy.id,
      vaccineName: vacName,
      administeredDate: vacAdminDate || new Date().toISOString().split('T')[0],
      nextDueDate: vacDueDate || '',
      vetClinic: vacClinic || puppy.vetClinic || '',
      status: 'up_to_date'
    });
    setVaccinations(storage.getVaccinations());
    setIsAddVacOpen(false);
    setVacName('');
    setVacDueDate('');
    setVacAdminDate('');
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;
    storage.addMedication({
      puppyId: puppy.id,
      name: medName,
      dosage: medDosage,
      frequency: medFrequency,
      startDate: new Date().toISOString().split('T')[0],
      active: true
    });
    setMedications(storage.getMedications());
    setIsAddMedOpen(false);
    setMedName('');
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptTitle.trim()) return;
    storage.addAppointment({
      puppyId: puppy.id,
      title: aptTitle,
      clinic: puppy.vetClinic || 'Vet Clinic',
      date: aptDate || new Date().toISOString().split('T')[0],
      time: aptTime,
      reason: aptReason,
      status: 'scheduled'
    });
    setAppointments(storage.getAppointments());
    setIsAddAptOpen(false);
    setAptTitle('');
  };

  const handleUpdateWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const wt = parseFloat(newWeight);
    if (isNaN(wt)) return;
    const updatedPuppy = { ...puppy, weightLbs: wt };
    storage.savePuppy(updatedPuppy);
    setIsAddWeightOpen(false);
  };

  const handleExportICS = () => {
    const icsContent = storage.generateICSFile(puppy.name);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${puppy.name}-PupLume-Calendar.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E8DDD3] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C211B]">
              Health & Veterinary Center
            </h1>
            <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Records Secured
            </span>
          </div>
          <p className="text-xs text-[#766A63] mt-1">
            Complete medical vault, booster reminders, parasite preventatives, and weight curves for {puppy.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportICS}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Sync to Calendar (.ICS)
          </Button>
        </div>
      </div>

      {/* Primary Vet & Insurance Quick Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#766A63]">
              Primary Veterinarian
            </span>
            <h3 className="text-sm font-bold text-[#2C211B] mt-0.5">
              {puppy.vetClinic || puppy.vetName ? (puppy.vetName || puppy.vetClinic) : 'No clinic added'}
            </h3>
            {puppy.vetName && puppy.vetClinic && (
              <p className="text-xs text-[#5F3E29]">{puppy.vetClinic}</p>
            )}
            <p className="text-xs font-semibold text-[#8B5E3C] mt-1 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {puppy.vetPhone || 'No phone recorded'}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-[#E8DDD3] text-[#8B5E3C]">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DDD3] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#766A63]">
              Pet Insurance & Microchip
            </span>
            <h3 className="text-sm font-bold text-[#2C211B] mt-0.5">
              {puppy.insuranceProvider || 'No insurance recorded'}
            </h3>
            {puppy.insurancePolicyNumber && (
              <p className="text-xs text-[#766A63]">Policy: #{puppy.insurancePolicyNumber}</p>
            )}
            <p className="text-xs font-semibold text-[#5F3E29] mt-1">
              Microchip: {puppy.microchipNumber || 'Not recorded'}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-[#E8DDD3] text-[#8B5E3C]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E8DDD3] gap-6">
        {[
          { id: 'vaccines', label: `Vaccines (${vaccinations.length})`, icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 'meds', label: `Medications (${medications.length})`, icon: <Pill className="w-4 h-4" /> },
          { id: 'appointments', label: `Vet Visits (${appointments.length})`, icon: <CalendarIcon className="w-4 h-4" /> },
          { id: 'weight', label: `Weight (${puppy.weightLbs} lbs)`, icon: <Scale className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 -mb-[1px] ${
              activeTab === tab.id
                ? 'border-[#8B5E3C] text-[#8B5E3C]'
                : 'border-transparent text-[#766A63] hover:text-[#2C211B]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Vaccines */}
      {activeTab === 'vaccines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#766A63] uppercase tracking-wider">
              Immunization Schedule
            </span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddVacOpen(true)}
            >
              Add Vaccine Record
            </Button>
          </div>

          {vaccinations.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-[#E8DDD3] shadow-xs">
              <ShieldCheck className="w-10 h-10 text-[#8B5E3C]/60 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#2C211B] mb-1">No vaccinations logged yet</h4>
              <p className="text-xs text-[#766A63] mb-4">Record core and non-core vaccines to track booster due dates.</p>
              <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddVacOpen(true)}>
                Add Vaccine Record
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {vaccinations.map((vac) => (
                <div
                  key={vac.id}
                  className="p-4 rounded-2xl bg-white border border-[#E8DDD3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#2C211B]">{vac.vaccineName}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        vac.status === 'up_to_date' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {vac.status === 'up_to_date' ? 'Up to Date' : 'Due Soon'}
                      </span>
                    </div>
                    <p className="text-xs text-[#766A63] mt-1">
                      Administered: {vac.administeredDate} • Next Due: <strong>{vac.nextDueDate || 'Not set'}</strong>
                    </p>
                    {vac.lotNumber && (
                      <p className="text-[11px] text-[#766A63]">Clinic Lot: {vac.lotNumber}</p>
                    )}
                  </div>

                  {vac.vetClinic && (
                    <div className="text-xs font-semibold text-[#5F3E29] bg-[#FFF9F2] px-3 py-1.5 rounded-xl border border-[#E8DDD3] self-start sm:self-auto">
                      {vac.vetClinic}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Medications */}
      {activeTab === 'meds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#766A63] uppercase tracking-wider">
              Preventatives & Prescriptions
            </span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddMedOpen(true)}
            >
              Add Medication
            </Button>
          </div>

          {medications.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-[#E8DDD3] shadow-xs">
              <Pill className="w-10 h-10 text-[#8B5E3C]/60 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#2C211B] mb-1">No medications recorded</h4>
              <p className="text-xs text-[#766A63] mb-4">Log flea, tick, heartworm preventatives, or prescription meds.</p>
              <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddMedOpen(true)}>
                Add Medication
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="p-4 rounded-2xl bg-white border border-[#E8DDD3] shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 mt-0.5">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2C211B]">{med.name}</h3>
                      <p className="text-xs text-[#766A63] mt-0.5">
                        Dosage: <strong>{med.dosage}</strong> • {med.frequency}
                      </p>
                      {med.notes && (
                        <p className="text-[11px] text-[#5F3E29] mt-1">{med.notes}</p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Vet Visits */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#766A63] uppercase tracking-wider">
              Upcoming & Past Consultations
            </span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddAptOpen(true)}
            >
              Schedule Visit
            </Button>
          </div>

          {appointments.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-[#E8DDD3] shadow-xs">
              <CalendarIcon className="w-10 h-10 text-[#8B5E3C]/60 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#2C211B] mb-1">No vet visits scheduled</h4>
              <p className="text-xs text-[#766A63] mb-4">Schedule wellness checkups, booster visits, or consultations.</p>
              <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddAptOpen(true)}>
                Schedule Visit
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-2xl bg-white border border-[#E8DDD3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#2C211B]">{apt.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#766A63] mt-1">
                      📅 {apt.date} at {apt.time} • {apt.clinic}
                    </p>
                    <p className="text-xs text-[#5F3E29] mt-1 leading-relaxed">
                      Reason: {apt.reason}
                    </p>
                    {apt.notes && (
                      <p className="text-[11px] text-[#766A63] mt-0.5">Note: {apt.notes}</p>
                    )}
                  </div>

                  <div className="text-xs font-bold text-[#8B5E3C] bg-[#FFF9F2] px-3 py-1.5 rounded-xl border border-[#E8DDD3] self-start sm:self-auto">
                    {apt.doctor || 'Staff Vet'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Weight */}
      {activeTab === 'weight' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#766A63] uppercase tracking-wider">
              Weight Progression Curve
            </span>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddWeightOpen(true)}
            >
              Log New Weight
            </Button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E8DDD3] shadow-xs text-center">
            <span className="text-xs font-bold text-[#766A63] uppercase tracking-wider">Current Weight</span>
            <div className="text-4xl font-black text-[#2C211B] my-2">
              {puppy.weightLbs > 0 ? puppy.weightLbs : '—'} <span className="text-xl font-medium text-[#766A63]">lbs</span>
            </div>
            <p className="text-xs text-[#8B5E3C] font-semibold">
              {puppy.weightLbs > 0
                ? `Logged at approximately ${Math.max(1, Math.floor((Date.now() - new Date(puppy.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 7)))} weeks of age for ${puppy.breed}.`
                : `No weight recorded yet for ${puppy.name}. Log their current weight to track healthy growth.`}
            </p>

            <div className="mt-6 pt-6 border-t border-[#E8DDD3] flex justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddWeightOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Update Weight Record
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vaccine Modal */}
      <Modal isOpen={isAddVacOpen} onClose={() => setIsAddVacOpen(false)} title="Add Vaccine Record">
        <form onSubmit={handleAddVaccine} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">Vaccine Name</label>
            <input
              type="text"
              required
              value={vacName}
              onChange={(e) => setVacName(e.target.value)}
              placeholder="e.g. Lyme Disease Vaccine"
              className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">Administered Date</label>
              <input
                type="date"
                value={vacAdminDate}
                onChange={(e) => setVacAdminDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">Next Due Date</label>
              <input
                type="date"
                value={vacDueDate}
                onChange={(e) => setVacDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddVacOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1">Save Vaccine</Button>
          </div>
        </form>
      </Modal>

      {/* Add Medication Modal */}
      <Modal isOpen={isAddMedOpen} onClose={() => setIsAddMedOpen(false)} title="Add Medication">
        <form onSubmit={handleAddMedication} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">Medication Name</label>
            <input
              type="text"
              required
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="e.g. Interceptor Plus"
              className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">Dosage</label>
              <input
                type="text"
                value={medDosage}
                onChange={(e) => setMedDosage(e.target.value)}
                placeholder="1 chewable tablet"
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">Frequency</label>
              <input
                type="text"
                value={medFrequency}
                onChange={(e) => setMedFrequency(e.target.value)}
                placeholder="Monthly"
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddMedOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1">Save Medication</Button>
          </div>
        </form>
      </Modal>

      {/* Add Appointment Modal */}
      <Modal isOpen={isAddAptOpen} onClose={() => setIsAddAptOpen(false)} title="Schedule Vet Visit">
        <form onSubmit={handleAddAppointment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">Visit Title</label>
            <input
              type="text"
              required
              value={aptTitle}
              onChange={(e) => setAptTitle(e.target.value)}
              placeholder="e.g. 16-Week Booster & Rabies"
              className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">Date</label>
              <input
                type="date"
                value={aptDate}
                onChange={(e) => setAptDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">Time</label>
              <input
                type="text"
                value={aptTime}
                onChange={(e) => setAptTime(e.target.value)}
                placeholder="03:00 PM"
                className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-sm focus:outline-none focus:border-[#8B5E3C]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">Reason / Notes</label>
            <textarea
              rows={2}
              value={aptReason}
              onChange={(e) => setAptReason(e.target.value)}
              placeholder="What needs to be checked (teeth, ears, booster shot)..."
              className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-xs focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddAptOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1">Save Appointment</Button>
          </div>
        </form>
      </Modal>

      {/* Log Weight Modal */}
      <Modal isOpen={isAddWeightOpen} onClose={() => setIsAddWeightOpen(false)} title="Update Weight">
        <form onSubmit={handleUpdateWeight} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C211B] uppercase tracking-wider mb-1">Weight (lbs)</label>
            <input
              type="number"
              step="0.1"
              required
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E8DDD3] bg-[#FFF9F2] text-lg font-bold text-[#2C211B] focus:outline-none focus:border-[#8B5E3C]"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAddWeightOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1">Update Weight</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
