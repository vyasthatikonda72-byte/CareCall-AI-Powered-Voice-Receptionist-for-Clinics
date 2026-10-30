import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Award,
  Search,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import type { Doctor } from '../types/index.ts';
import { fetchDoctors, updateDoctorStatus } from '../services/api.ts';

interface DoctorDirectoryProps {
  onBookDoctor: (doctor: Doctor) => void;
  onCallAIForDoctor: (doctor: Doctor) => void;
}

const DoctorAvatar: React.FC<{ src?: string; name: string; sizeClass?: string }> = ({
  src,
  name,
  sizeClass = 'w-16 h-16 rounded-2xl',
}) => {
  const [imgError, setImgError] = useState(false);
  const initials = name
    .replace('Dr.', '')
    .trim()
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  if (imgError || !src) {
    return (
      <div
        className={`${sizeClass} bg-gradient-to-br from-blue-100 to-teal-100 text-[#102A56] font-bold flex items-center justify-center border border-slate-200 flex-shrink-0 shadow-xs text-sm select-none`}
      >
        <span>{initials || 'DR'}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setImgError(true)}
      className={`${sizeClass} object-cover border border-slate-200 flex-shrink-0 shadow-xs`}
    />
  );
};

export const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({
  onBookDoctor,
  onCallAIForDoctor,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const data = await fetchDoctors();
      setDoctors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (doctor: Doctor) => {
    setUpdatingId(doctor.id);
    const nextStatus: Doctor['status'] =
      doctor.status === 'available'
        ? 'in_consultation'
        : doctor.status === 'in_consultation'
        ? 'on_leave'
        : 'available';

    try {
      const updated = await updateDoctorStatus(doctor.id, nextStatus);
      setDoctors((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const departments = Array.from(new Set(doctors.map((d) => d.departmentName)));

  const filtered = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.departmentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'all' || doc.departmentName === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 mb-6 gap-4">
        <div>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 mb-2">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>Clinic Specialists & Practitioners</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Doctor Management & Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse clinic departments, real-time consultation fees, open slots, and availability status.
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center space-x-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctors, specialties..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Department Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-3 mb-6">
        <button
          onClick={() => setSelectedDept('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            selectedDept === 'all'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Departments ({doctors.length})
        </button>
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDept === dept
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading doctors...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((doctor) => {
            const isUpdating = updatingId === doctor.id;
            return (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                <div className="p-5 flex items-start space-x-4">
                  <DoctorAvatar src={doctor.avatar} name={doctor.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase">
                        {doctor.departmentName}
                      </span>

                      {/* Status pill with interactive toggle */}
                      <button
                        onClick={() => handleStatusToggle(doctor)}
                        disabled={isUpdating}
                        title="Click to toggle status (Available / In Consultation / On Leave)"
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors flex items-center space-x-1 ${
                          doctor.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : doctor.status === 'in_consultation'
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            doctor.status === 'available'
                              ? 'bg-emerald-500'
                              : doctor.status === 'in_consultation'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span>
                          {doctor.status === 'available'
                            ? 'Available'
                            : doctor.status === 'in_consultation'
                            ? 'In Consult'
                            : 'On Leave'}
                        </span>
                      </button>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 mt-1 truncate">{doctor.name}</h3>
                    <p className="text-xs text-slate-600 font-medium truncate">{doctor.qualification}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{doctor.specialization}</p>
                  </div>
                </div>

                <div className="px-5 pb-4 text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3 flex-1">
                  <p className="text-xs text-slate-500 italic line-clamp-2">"{doctor.bio}"</p>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Experience:</span>
                      <span className="font-semibold text-slate-800">{doctor.experienceYears} Years</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Consultation Fee:</span>
                      <span className="font-semibold text-slate-900">₹{doctor.consultationFee}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">OPD Room:</span>
                      <span className="font-semibold text-slate-800">{doctor.roomNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Languages:</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {doctor.languages.join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] text-slate-400 block mb-1">Available Days:</span>
                    <div className="flex flex-wrap gap-1">
                      {doctor.availableDays.map((day) => (
                        <span
                          key={day}
                          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Time Slots:</span>
                    <div className="flex flex-wrap gap-1">
                      {doctor.availableSlots.map((slot) => (
                        <span
                          key={slot}
                          className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 font-mono text-[10px] border border-teal-100"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions bottom bar */}
                <div className="bg-slate-50 border-t border-slate-100 p-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onCallAIForDoctor(doctor)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Ask AI About Slots</span>
                  </button>

                  <button
                    onClick={() => onBookDoctor(doctor)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
