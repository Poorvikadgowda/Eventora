import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import {
  getAdminDashboard,
  getAllPharmacies,
  getAllMedicines,
  updateInventoryItem,
  getInventoryHistory
} from '../../services/api';
import {
  Building2,
  Package,
  AlertCircle,
  CheckCircle2,
  Plus,
  Save,
  Clock,
  History,
  TrendingUp,
  RefreshCw,
  Search,
  X,
  ShieldCheck
} from 'lucide-react';

export const AdminPharmacyDashboard = () => {
  const { user, notify } = useApp();

  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState(
    user.pharmacy_id || 'apollo-cp-01'
  );
  const [dashboardData, setDashboardData] = useState(null);
  const [auditHistory, setAuditHistory] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit State for inventory row
  const [editingRow, setEditingRow] = useState(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [editPrice, setEditPrice] = useState(0.0);
  const [editBatch, setEditBatch] = useState('');
  const [editNotes, setEditNotes] = useState('Routine stock count verification');

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedId, setNewMedId] = useState('dolo-650');
  const [newQty, setNewQty] = useState(50);
  const [newPrice, setNewPrice] = useState(32.0);
  const [newBatch, setNewBatch] = useState('BATCH-2026-N1');

  const loadData = async () => {
    setLoading(true);
    try {
      const [allPharms, allMeds, dash, hist] = await Promise.all([
        getAllPharmacies(),
        getAllMedicines(),
        getAdminDashboard(selectedPharmacyId),
        getInventoryHistory(selectedPharmacyId)
      ]);
      setPharmacies(allPharms);
      setAllMedicines(allMeds);
      setDashboardData(dash);
      setAuditHistory(hist);
    } catch (err) {
      notify('Failed to load dashboard: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPharmacyId]);

  const handleStartEdit = (item) => {
    setEditingRow(item.inventory_id || item.medicine_id);
    setEditQuantity(item.stock_quantity);
    setEditPrice(item.price);
    setEditBatch(item.batch_number || 'BATCH-2026-X');
    setEditNotes('Stock replenishment from distributor');
  };

  const handleSaveEdit = async (item) => {
    try {
      await updateInventoryItem({
        pharmacy_id: selectedPharmacyId,
        medicine_id: item.medicine_id,
        stock_quantity: parseInt(editQuantity),
        price: parseFloat(editPrice),
        batch_number: editBatch,
        changed_by: user.user_name || 'Store Administrator',
        notes: editNotes
      });
      notify(`Inventory for ${item.brand_name} successfully updated!`, 'success');
      setEditingRow(null);
      loadData();
    } catch (err) {
      notify('Update failed: ' + err.message, 'error');
    }
  };

  const handleMarkOutOfStock = async (item) => {
    try {
      await updateInventoryItem({
        pharmacy_id: selectedPharmacyId,
        medicine_id: item.medicine_id,
        stock_quantity: 0,
        price: item.price,
        batch_number: item.batch_number,
        changed_by: user.user_name || 'Store Administrator',
        notes: 'Marked Out of Stock by Pharmacist'
      });
      notify(`${item.brand_name} marked OUT OF STOCK`, 'info');
      loadData();
    } catch (err) {
      notify('Error marking out of stock', 'error');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await updateInventoryItem({
        pharmacy_id: selectedPharmacyId,
        medicine_id: newMedId,
        stock_quantity: parseInt(newQty),
        price: parseFloat(newPrice),
        batch_number: newBatch,
        changed_by: user.user_name || 'Store Administrator',
        notes: 'New medicine added to pharmacy inventory'
      });
      notify('Medicine added to inventory successfully', 'success');
      setShowAddModal(false);
      loadData();
    } catch (err) {
      notify('Failed to add medicine: ' + err.message, 'error');
    }
  };

  const metrics = dashboardData?.metrics || {
    total_medicines_tracked: 8,
    in_stock_count: 5,
    low_stock_count: 2,
    out_of_stock_count: 1
  };

  const inventory = dashboardData?.inventory || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Module 12: Pharmacy Administrator Portal
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
            Pharmacy Inventory & Stock Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update live store inventory quantities, retail prices, and log audit history notes in compliance with state drug guidelines.
          </p>
        </div>

        {/* Pharmacy Store Switcher */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-teal-600" />
          <select
            value={selectedPharmacyId}
            onChange={(e) => setSelectedPharmacyId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            {pharmacies.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Tracked Medicine SKUs</span>
          <div className="text-2xl font-black text-slate-900">{metrics.total_medicines_tracked}</div>
          <div className="text-[11px] text-slate-400">Total catalog inventory</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-emerald-600">In Stock (&gt;10 units)</span>
          <div className="text-2xl font-black text-emerald-600">{metrics.in_stock_count}</div>
          <div className="text-[11px] text-emerald-700">Healthy supply</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-amber-600">Low Stock (4-10 units)</span>
          <div className="text-2xl font-black text-amber-600">{metrics.low_stock_count}</div>
          <div className="text-[11px] text-amber-700">Replenishment needed</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-rose-600">Out of Stock (0 units)</span>
          <div className="text-2xl font-black text-rose-600">{metrics.out_of_stock_count}</div>
          <div className="text-[11px] text-rose-700">Immediate action required</div>
        </div>
      </div>

      {/* Inventory Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-base text-slate-900">Current Store Inventory</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Medicine to Inventory
            </button>
            <button
              onClick={loadData}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
              title="Refresh Inventory"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Medicine & Active API</th>
                <th className="py-3 px-4">Available Units</th>
                <th className="py-3 px-4">Retail Price (₹)</th>
                <th className="py-3 px-4">Batch & Expiry</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map((item) => {
                const isEditing = editingRow === (item.inventory_id || item.medicine_id);

                return (
                  <tr key={item.inventory_id || item.medicine_id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Medicine Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.brand_name}</div>
                      <div className="text-[11px] text-slate-500">{item.active_ingredient} • {item.strength}</div>
                    </td>

                    {/* Stock Units */}
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          className="w-20 px-2 py-1 rounded border border-slate-300 font-bold"
                        />
                      ) : (
                        <span className={item.stock_quantity === 0 ? 'text-rose-600 font-extrabold' : 'text-slate-900'}>
                          {item.stock_quantity} strips
                        </span>
                      )}
                    </td>

                    {/* Retail Price */}
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.5"
                          min={0}
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-20 px-2 py-1 rounded border border-slate-300 font-bold"
                        />
                      ) : (
                        `₹${parseFloat(item.price || 0).toFixed(2)}`
                      )}
                    </td>

                    {/* Batch Number */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editBatch}
                          onChange={(e) => setEditBatch(e.target.value)}
                          className="w-28 px-2 py-1 rounded border border-slate-300 text-xs"
                        />
                      ) : (
                        <div>
                          <div>{item.batch_number || 'AP-2026-A1'}</div>
                          <div className="text-slate-400 text-[10px]">Exp: {item.expiry_date || '2027-10-31'}</div>
                        </div>
                      )}
                    </td>

                    {/* Stock Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-[11px] font-bold inline-block"
                        style={{
                          backgroundColor: item.stock_status?.bg_color || '#ecfdf5',
                          color: item.stock_status?.color || '#10b981'
                        }}
                      >
                        {item.stock_status?.badge || '🟢 IN STOCK'}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      <div className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-teal-600" />
                        {item.last_updated_human || 'Updated just now'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(item)}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs transition-colors"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                        >
                          Update
                        </button>
                      )}
                      <button
                        onClick={() => handleMarkOutOfStock(item)}
                        disabled={item.stock_quantity === 0}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-[11px] transition-colors disabled:opacity-30"
                      >
                        Out of Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Audit History Trail Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <History className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-base text-slate-900">Inventory Change Audit Trail</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {auditHistory.map((hist, idx) => (
            <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900">{hist.brand_name || 'Medicine'}</span>
                <span className="text-slate-500 mx-2">•</span>
                <span className="text-slate-600">
                  Stock changed from <strong>{hist.old_quantity}</strong> to <strong>{hist.new_quantity}</strong>
                </span>
                <div className="text-[11px] text-slate-400">
                  Note: {hist.notes || 'Verified inventory update'}
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-500 shrink-0">
                <div>By: <strong>{hist.changed_by || 'Store Admin'}</strong></div>
                <div className="text-slate-400">{new Date(hist.changed_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add Medicine to Inventory</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Catalog Drug</label>
                <select
                  value={newMedId}
                  onChange={(e) => setNewMedId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  {allMedicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brand_name} ({m.active_ingredient} {m.strength})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    min={1}
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Retail Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Number</label>
                <input
                  type="text"
                  value={newBatch}
                  onChange={(e) => setNewBatch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Add Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
