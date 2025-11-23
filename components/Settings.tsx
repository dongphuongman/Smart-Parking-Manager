import React, { useState } from 'react';
import { VehicleType, Employee, Shift, ParkingRates } from '../types';
import { Save, Plus, Trash2, Edit2, Users, Clock, DollarSign, Shield, User, Settings as SettingsIcon, Car, Bike, Truck } from 'lucide-react';

interface SettingsProps {
  rates: ParkingRates;
  onUpdateRates: (rates: ParkingRates) => void;
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
  shifts: Shift[];
  onUpdateShifts: (shifts: Shift[]) => void;
  overdueThreshold: number;
  onUpdateThreshold: (hours: number) => void;
  maxCapacity: number;
  onUpdateMaxCapacity: (capacity: number) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  rates, onUpdateRates, 
  employees, onUpdateEmployees, 
  shifts, onUpdateShifts,
  overdueThreshold, onUpdateThreshold,
  maxCapacity, onUpdateMaxCapacity
}) => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'RATES' | 'EMPLOYEES' | 'SHIFTS'>('GENERAL');

  // Rate State
  const [tempRates, setTempRates] = useState<ParkingRates>(rates);
  
  const handleRateChange = (type: VehicleType, value: string) => {
    // Allow empty string for better UX while typing
    const val = value === '' ? 0 : parseInt(value);
    setTempRates({
      ...tempRates,
      [type]: isNaN(val) ? 0 : val
    });
  };

  const saveRates = () => {
    onUpdateRates(tempRates);
    alert('Đã cập nhật bảng phí thành công!');
  };

  // Threshold & Capacity State (General Settings)
  const [tempThreshold, setTempThreshold] = useState(overdueThreshold);
  const [tempCapacity, setTempCapacity] = useState(maxCapacity);

  const saveGeneralSettings = () => {
    onUpdateThreshold(tempThreshold);
    onUpdateMaxCapacity(tempCapacity);
    alert('Đã cập nhật cài đặt chung thành công!');
  };

  // Employee State
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeePhone, setNewEmployeePhone] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState<'ADMIN' | 'STAFF'>('STAFF');

  const addEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeName || !newEmployeePhone) return;
    const newEmp: Employee = {
      id: Date.now().toString(),
      name: newEmployeeName,
      phone: newEmployeePhone,
      role: newEmployeeRole,
      status: 'ACTIVE'
    };
    onUpdateEmployees([...employees, newEmp]);
    setNewEmployeeName('');
    setNewEmployeePhone('');
  };

  const deleteEmployee = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      onUpdateEmployees(employees.filter(e => e.id !== id));
    }
  };

  // Shift State
  const [newShiftName, setNewShiftName] = useState('');
  const [newShiftStart, setNewShiftStart] = useState('');
  const [newShiftEnd, setNewShiftEnd] = useState('');

  const addShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftName || !newShiftStart || !newShiftEnd) return;
    const newShift: Shift = {
      id: Date.now().toString(),
      name: newShiftName,
      startTime: newShiftStart,
      endTime: newShiftEnd
    };
    onUpdateShifts([...shifts, newShift]);
    setNewShiftName('');
    setNewShiftStart('');
    setNewShiftEnd('');
  };

  const deleteShift = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa ca làm việc này?')) {
      onUpdateShifts(shifts.filter(s => s.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-4 space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Quản trị hệ thống</h3>
        <button
          onClick={() => setActiveTab('GENERAL')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
            activeTab === 'GENERAL' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <SettingsIcon className="w-4 h-4" /> Cài đặt chung
        </button>
        <button
          onClick={() => setActiveTab('RATES')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
            activeTab === 'RATES' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Thiết lập phí
        </button>
        <button
          onClick={() => setActiveTab('EMPLOYEES')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
            activeTab === 'EMPLOYEES' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Quản lý nhân viên
        </button>
        <button
          onClick={() => setActiveTab('SHIFTS')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
            activeTab === 'SHIFTS' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" /> Quản lý ca
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {activeTab === 'GENERAL' && (
          <div className="max-w-xl animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Cài đặt chung</h2>
            
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ngưỡng cảnh báo xe đỗ quá giờ (Giờ)
                </label>
                <div className="flex items-center gap-4">
                   <input
                    type="number"
                    min="1"
                    max="72"
                    value={tempThreshold}
                    onChange={(e) => setTempThreshold(parseInt(e.target.value) || 1)}
                    className="w-32 px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-slate-500 text-sm">giờ</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Hệ thống sẽ hiển thị cảnh báo màu đỏ cho các xe đỗ lâu hơn thời gian này.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Sức chứa tối đa của bãi xe
                </label>
                <div className="flex items-center gap-4">
                   <input
                    type="number"
                    min="1"
                    value={tempCapacity}
                    onChange={(e) => setTempCapacity(parseInt(e.target.value) || 1)}
                    className="w-32 px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-slate-500 text-sm">chỗ</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Dùng để tính toán tỷ lệ lấp đầy và cảnh báo hết chỗ.
                </p>
              </div>
            </div>

            <button
              onClick={saveGeneralSettings}
              className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Save className="w-4 h-4" /> Lưu cài đặt chung
            </button>
          </div>
        )}

        {activeTab === 'RATES' && (
          <div className="max-w-xl animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Bảng giá gửi xe (theo giờ)</h2>
            <div className="space-y-4">
              {Object.values(VehicleType).map((type) => (
                <div key={type} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                      {type === VehicleType.CAR ? <Car className="w-5 h-5" /> : 
                       type === VehicleType.TRUCK ? <Truck className="w-5 h-5" /> :
                       <div className="font-bold text-xs">{type.substring(0, 1)}</div>}
                    </div>
                    <span className="font-medium text-slate-700">{type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={tempRates[type] || ''}
                      onChange={(e) => handleRateChange(type, e.target.value)}
                      className="w-36 px-3 py-2 border border-slate-300 rounded-md text-right focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                      placeholder="0"
                    />
                    <span className="text-slate-500 text-sm w-24">đ / giờ</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={saveRates}
              className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Save className="w-4 h-4" /> Lưu bảng phí
            </button>
          </div>
        )}

        {activeTab === 'EMPLOYEES' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Danh sách nhân viên</h2>
            </div>

            {/* Add Form */}
            <form onSubmit={addEmployee} className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Họ và tên</label>
                <input
                  required
                  value={newEmployeeName}
                  onChange={e => setNewEmployeeName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Số điện thoại</label>
                <input
                  required
                  value={newEmployeePhone}
                  onChange={e => setNewEmployeePhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  placeholder="0912..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Vai trò</label>
                <select
                  value={newEmployeeRole}
                  onChange={e => setNewEmployeeRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
                >
                  <option value="STAFF">Nhân viên</option>
                  <option value="ADMIN">Quản lý</option>
                </select>
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
                <Plus className="w-4 h-4" /> Thêm mới
              </button>
            </form>

            {/* List */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500">Tên</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500">SĐT</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500">Vai trò</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500">Trạng thái</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm font-medium text-slate-800">{emp.name}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{emp.phone}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                          emp.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {emp.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {emp.role}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => deleteEmployee(emp.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Chưa có nhân viên nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'SHIFTS' && (
          <div className="animate-in fade-in duration-300">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Cấu hình ca làm việc</h2>
            </div>

            {/* Add Shift */}
            <form onSubmit={addShift} className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tên ca</label>
                <input
                  required
                  value={newShiftName}
                  onChange={e => setNewShiftName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  placeholder="Ca Sáng"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Bắt đầu</label>
                <input
                  type="time"
                  required
                  value={newShiftStart}
                  onChange={e => setNewShiftStart(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Kết thúc</label>
                <input
                  type="time"
                  required
                  value={newShiftEnd}
                  onChange={e => setNewShiftEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>
              <button type="submit" className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
                <Plus className="w-4 h-4" /> Thêm ca
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shifts.map(shift => (
                <div key={shift.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                  <div>
                    <h4 className="font-bold text-slate-800">{shift.name}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> {shift.startTime} - {shift.endTime}
                    </p>
                  </div>
                  <button onClick={() => deleteShift(shift.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {shifts.length === 0 && (
                 <div className="col-span-full py-8 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
                   Chưa có ca làm việc nào
                 </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};