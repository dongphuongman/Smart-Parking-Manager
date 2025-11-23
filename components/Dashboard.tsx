import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Car, DollarSign, Clock, AlertCircle, AlertTriangle } from 'lucide-react';
import { ParkingEntry, ParkingRates } from '../types';
import { VehicleInfoCard } from './VehicleInfoCard';

interface DashboardProps {
  entries: ParkingEntry[];
  onCheckOut: (entry: ParkingEntry) => void;
  rates: ParkingRates;
  overdueThreshold: number;
  maxCapacity: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ entries, onCheckOut, rates, overdueThreshold, maxCapacity }) => {
  const activeEntries = entries.filter(e => e.status === 'PARKED');
  const completedEntries = entries.filter(e => e.status === 'COMPLETED');
  
  // Calculate today's revenue
  const todayRevenue = completedEntries.reduce((sum, entry) => sum + (entry.fee || 0), 0);

  // Calculate capacity
  const occupiedCount = activeEntries.length;
  const availableSpots = maxCapacity - occupiedCount;
  const occupancyRate = (occupiedCount / maxCapacity) * 100;
  
  // Define thresholds
  const isFull = availableSpots <= 0;
  const isLowCapacity = availableSpots > 0 && availableSpots <= 10; // Low if 10 or fewer spots remain

  // Calculate overdue vehicles
  const now = new Date();
  const OVERDUE_THRESHOLD_MS = overdueThreshold * 60 * 60 * 1000;

  const isEntryOverdue = (entry: ParkingEntry) => {
    if (entry.status !== 'PARKED') return false;
    return (now.getTime() - entry.checkInTime.getTime()) > OVERDUE_THRESHOLD_MS;
  };

  const overdueCount = activeEntries.filter(isEntryOverdue).length;

  // Generate 24h Occupancy Data
  const generateHourlyOccupancy = () => {
    const data = [];
    const end = new Date();
    end.setMinutes(0, 0, 0); // Align to current hour

    // Loop back 24 hours
    for (let i = 23; i >= 0; i--) {
      const timePoint = new Date(end.getTime() - i * 60 * 60 * 1000);
      
      // Count vehicles present at this timePoint
      const count = entries.filter(entry => {
        const checkIn = new Date(entry.checkInTime);
        const checkOut = entry.checkOutTime ? new Date(entry.checkOutTime) : null;
        
        // Vehicle was in before this hour
        const isCheckedIn = checkIn <= timePoint;
        
        // Vehicle was still there (checked out after this hour or never checked out)
        const isNotCheckedOut = !checkOut || checkOut > timePoint;
        
        return isCheckedIn && isNotCheckedOut;
      }).length;

      data.push({
        time: timePoint.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        count: count
      });
    }
    return data;
  };

  const chartData = generateHourlyOccupancy();

  const StatCard = ({ title, value, icon: Icon, color, alert }: any) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border ${alert ? 'border-red-200 bg-red-50' : 'border-slate-100'} flex items-center gap-4`}>
      <div className={`p-4 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <p className={`text-sm font-medium ${alert ? 'text-red-600' : 'text-slate-500'}`}>{title}</p>
        <h3 className={`text-2xl font-bold ${alert ? 'text-red-700' : 'text-slate-800'}`}>{value}</h3>
      </div>
    </div>
  );

  const latestActiveEntry = activeEntries.length > 0 ? activeEntries[activeEntries.length - 1] : null;

  return (
    <div className="space-y-6">
      {/* Capacity Alert Banners */}
      {isFull && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3 animate-pulse">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-bold text-red-800 uppercase tracking-wide">Bãi đỗ đã hết chỗ!</h3>
            <p className="text-red-600 text-sm">Vui lòng không nhận thêm xe mới cho đến khi có xe ra.</p>
          </div>
        </div>
      )}
      {!isFull && isLowCapacity && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600" />
          <div>
            <h3 className="font-bold text-yellow-800 uppercase tracking-wide">Sắp hết chỗ đỗ</h3>
            <p className="text-yellow-700 text-sm">Chỉ còn <strong>{availableSpots}</strong> vị trí trống trong bãi.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Xe đang đỗ" 
          value={`${occupiedCount} / ${maxCapacity}`} 
          icon={Car} 
          color={isFull ? 'bg-red-500' : isLowCapacity ? 'bg-yellow-500' : 'bg-blue-500'}
          alert={isFull}
        />
        <StatCard 
          title="Doanh thu hôm nay" 
          value={`${todayRevenue.toLocaleString()} đ`} 
          icon={DollarSign} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Lượt xe hôm nay" 
          value={entries.length} 
          icon={Clock} 
          color="bg-purple-500" 
        />
        <StatCard 
          title={`Cảnh báo quá giờ (>${overdueThreshold}h)`} 
          value={overdueCount} 
          icon={AlertCircle} 
          color="bg-red-500"
          alert={overdueCount > 0}
        />
      </div>

      {/* Capacity Progress Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-end mb-2">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Trạng thái sức chứa</h3>
          <span className={`text-2xl font-bold ${isFull ? 'text-red-600' : isLowCapacity ? 'text-yellow-600' : 'text-blue-600'}`}>
            {Math.round(occupancyRate)}%
          </span>
        </div>
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out ${
              isFull ? 'bg-red-500' : isLowCapacity ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(occupancyRate, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>0</span>
          <span>{Math.round(maxCapacity * 0.5)}</span>
          <span>{maxCapacity}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px]">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Biểu đồ lưu lượng xe (24h qua)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  interval={3}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#64748b', marginBottom: '0.25rem' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  name="Số lượng xe"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              Chưa có dữ liệu
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {latestActiveEntry && (
            <VehicleInfoCard 
              entry={latestActiveEntry} 
              onCheckOut={onCheckOut} 
              rates={rates} 
              overdueThreshold={overdueThreshold}
            />
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex-1">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Danh sách xe vào gần đây</h3>
            <div className="space-y-4">
              {activeEntries.slice(-5).reverse().map((entry) => {
                const overdue = isEntryOverdue(entry);
                return (
                  <div 
                    key={entry.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      overdue 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-slate-50 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                        overdue ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {entry.vehicleType.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-semibold ${overdue ? 'text-red-900' : 'text-slate-900'}`}>
                          {entry.plateNumber}
                        </p>
                        <p className={`text-xs ${overdue ? 'text-red-600' : 'text-slate-500'}`}>
                          {entry.checkInTime.toLocaleTimeString()}
                          {overdue && <span className="ml-1 font-bold">(Quá giờ)</span>}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      overdue ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-700'
                    }`}>
                      {overdue ? 'Cảnh báo' : 'Đang đỗ'}
                    </span>
                  </div>
                );
              })}
              {activeEntries.length === 0 && (
                <p className="text-center text-slate-500 py-8">Bãi xe trống</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
