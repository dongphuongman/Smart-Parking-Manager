import React, { useState } from 'react';
import { ParkingEntry, ParkingRates } from '../types';
import { X, Clock, Calendar, Car, CheckCircle } from 'lucide-react';

interface CheckoutModalProps {
  entry: ParkingEntry;
  onConfirm: () => void;
  onClose: () => void;
  rates: ParkingRates;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ entry, onConfirm, onClose, rates }) => {
  const [checkOutTime] = useState(new Date());
  
  // Calculate details
  const checkInTime = new Date(entry.checkInTime);
  const durationMs = checkOutTime.getTime() - checkInTime.getTime();
  const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
  const chargeableHours = Math.max(1, durationHours);
  const rate = rates[entry.vehicleType];
  const totalFee = rate * chargeableHours;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">Thanh toán phí gửi xe</h3>
            <p className="text-slate-400 text-sm mt-1">Vui lòng kiểm tra kỹ thông tin</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-6">
          {/* Plate Number & Type */}
          <div className="flex items-center gap-4 pb-6 border-b border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
              <Car className="w-8 h-8 text-slate-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Biển số xe</p>
              <h2 className="text-3xl font-mono font-bold text-slate-800 tracking-tight">{entry.plateNumber}</h2>
              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                {entry.vehicleType}
              </span>
            </div>
          </div>

          {/* Time Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Giờ vào
              </p>
              <p className="font-medium text-slate-700">{formatTime(checkInTime)}</p>
              <p className="text-xs text-slate-400">{formatDate(checkInTime)}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                <Calendar className="w-3 h-3" /> Giờ ra
              </p>
              <p className="font-medium text-slate-700">{formatTime(checkOutTime)}</p>
              <p className="text-xs text-slate-400">{formatDate(checkOutTime)}</p>
            </div>
          </div>

          {/* Calculation */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Thời gian gửi</span>
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                {durationHours} giờ
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Đơn giá / giờ</span>
              <span className="font-medium text-slate-800">{rate.toLocaleString()} đ</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
              <span className="font-bold text-slate-700">Tổng cộng</span>
              <span className="text-2xl font-bold text-green-600 flex items-center gap-1">
                {totalFee.toLocaleString()} <span className="text-sm text-green-500">vnđ</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={onConfirm}
            className="flex-[2] py-3 px-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Xác nhận thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};