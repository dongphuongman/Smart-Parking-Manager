import React, { useState, useEffect } from 'react';
import { VehicleType, LicensePlateAnalysis } from '../types';
import { Save, X } from 'lucide-react';

interface EntryFormProps {
  analysis: LicensePlateAnalysis | null;
  capturedImage: string;
  onConfirm: (data: LicensePlateAnalysis) => void;
  onCancel: () => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({ analysis, capturedImage, onConfirm, onCancel }) => {
  const [formData, setFormData] = useState<LicensePlateAnalysis>({
    plateNumber: '',
    vehicleType: VehicleType.CAR,
    color: '',
    confidence: 0
  });

  useEffect(() => {
    if (analysis) {
      setFormData(analysis);
    }
  }, [analysis]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Xác nhận thông tin xe vào</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-red-500">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden border border-slate-200">
            <img src={capturedImage} alt="Captured" className="w-full h-auto object-cover" />
          </div>
          {analysis && analysis.confidence < 0.7 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-lg text-sm">
              ⚠️ Độ tin cậy thấp ({Math.round(analysis.confidence * 100)}%). Vui lòng kiểm tra kỹ biển số.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Biển số xe</label>
            <input
              type="text"
              required
              value={formData.plateNumber}
              onChange={(e) => setFormData({...formData, plateNumber: e.target.value.toUpperCase()})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg font-bold tracking-wider"
              placeholder="VD: 30A-123.45"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Loại xe</label>
            <select
              value={formData.vehicleType}
              onChange={(e) => setFormData({...formData, vehicleType: e.target.value as VehicleType})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(VehicleType).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Màu sắc (Tham khảo)</label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Xác nhận vào bến
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};