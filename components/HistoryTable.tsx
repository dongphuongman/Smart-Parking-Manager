import React, { useState } from 'react';
import { ParkingEntry, VehicleType } from '../types';
import { Search, LogOut, Calendar, AlertTriangle } from 'lucide-react';

interface HistoryTableProps {
  entries: ParkingEntry[];
  onCheckOut: (entry: ParkingEntry) => void;
  overdueThreshold: number;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ entries, onCheckOut, overdueThreshold }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<VehicleType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PARKED' | 'COMPLETED'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const now = new Date();
  const OVERDUE_THRESHOLD_MS = overdueThreshold * 60 * 60 * 1000;

  // Helper to compare dates ignoring time
  const toDateString = (date: Date) => {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  };

  const isEntryOverdue = (entry: ParkingEntry) => {
    if (entry.status !== 'PARKED') return false;
    return (now.getTime() - entry.checkInTime.getTime()) > OVERDUE_THRESHOLD_MS;
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || entry.vehicleType === filterType;
    const matchesStatus = statusFilter === 'ALL' || entry.status === statusFilter;
    
    let matchesDate = true;
    const entryDate = toDateString(entry.checkInTime);

    if (startDate) {
      matchesDate = matchesDate && entryDate >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && entryDate <= endDate;
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  }).sort((a, b) => b.checkInTime.getTime() - a.checkInTime.getTime());

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm biển số..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto items-start sm:items-center">
            {/* Date Range */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-auto">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
                />
              </div>
              <span className="text-slate-400">-</span>
              <div className="relative flex-1 sm:w-auto">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
                />
              </div>
            </div>

            {/* Dropdowns */}
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as VehicleType | 'ALL')}
                className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              >
                <option value="ALL">Tất cả loại xe</option>
                {Object.values(VehicleType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PARKED">Đang đỗ</option>
                <option value="COMPLETED">Đã rời bến</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Biển số</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Loại xe</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giờ vào</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giờ ra</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phí</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.map((entry) => {
                const overdue = isEntryOverdue(entry);
                return (
                  <tr 
                    key={entry.id} 
                    className={`${overdue ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'} transition-colors`}
                  >
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        {entry.plateNumber}
                        {overdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{entry.vehicleType}</td>
                    <td className={`px-6 py-4 text-sm ${overdue ? 'text-red-700 font-medium' : 'text-slate-600'}`}>
                      {entry.checkInTime.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {entry.checkOutTime ? entry.checkOutTime.toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {entry.fee ? `${entry.fee.toLocaleString()} đ` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.status === 'PARKED' 
                          ? (overdue ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-800')
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.status === 'PARKED' ? (overdue ? `Cảnh báo (>${overdueThreshold}h)` : 'Đang đỗ') : 'Đã rời bến'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {entry.status === 'PARKED' && (
                        <button
                          onClick={() => onCheckOut(entry)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium flex items-center gap-1"
                        >
                          <LogOut className="w-4 h-4" /> Check-out
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Calendar className="w-8 h-8 text-slate-200" />
                      <p>Không tìm thấy dữ liệu phù hợp</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};