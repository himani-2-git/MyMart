import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useSettings } from '../context/settings-context';
import { useToast } from '../components/toast-context';
import ConfirmModal from '../components/ConfirmModal';
import { SkeletonTable } from '../components/ui/Loader';
import { Plus, DollarSign, X, Edit2, Trash2, Download } from 'lucide-react';

const S = { card: '#1e1e1e', surface: '#060c06', border: '#3e3f3e', muted: '#6b7280' };
const inputSt = { backgroundColor: '#060c06', border: '1px solid #3e3f3e', color: '#e2e8f0', borderRadius: '12px', padding: '10px 14px', outline: 'none', width: '100%', fontSize: '14px' };

const Expenses = () => {
    const { currency } = useSettings();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [formData, setFormData] = useState({ expenseType: 'Rent', amount: '', description: '' });
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    const fetchExpenses = useCallback(async () => {
        try { const { data } = await API.get('/api/expenses'); setExpenses(data); setLoading(false); }
        catch { toast.error('Failed to load expenses'); setLoading(false); }
    }, [toast]);
    useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

    const openModal = (expense = null) => {
        if (expense) {
            setEditingExpense(expense);
            setFormData({ expenseType: expense.expenseType, amount: expense.amount, description: expense.description || '' });
        } else {
            setEditingExpense(null);
            setFormData({ expenseType: 'Rent', amount: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingExpense) {
                await API.put(`/api/expenses/${editingExpense._id}`, formData);
                toast.success('Expense updated successfully');
            } else {
                await API.post('/api/expenses', formData);
                toast.success('Expense added successfully');
            }
            fetchExpenses(); setIsModalOpen(false); setEditingExpense(null);
            setFormData({ expenseType: 'Rent', amount: '', description: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save expense');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await API.delete(`/api/expenses/${deleteTarget}`);
            toast.success('Expense deleted successfully');
            fetchExpenses();
        } catch {
            toast.error('Failed to delete expense');
        }
        setDeleteTarget(null);
    };

    const expenseTypes = ['Rent', 'Electricity', 'Salary', 'Maintenance', 'Marketing', 'Other'];
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const typeColors = { Rent: '#54c750', Electricity: '#06b6d4', Salary: '#8b5cf6', Maintenance: '#22c55e', Marketing: '#f97316', Other: '#6b7280' };

    const exportCSV = () => {
        if (!expenses.length) {
            toast.error('No data to export');
            return;
        }
        const headers = ['Date', 'Type', 'Description', 'Amount'];
        const csvContent = [
            headers.join(','),
            ...expenses.map(e => [
                new Date(e.date).toLocaleDateString(),
                e.expenseType,
                `"${(e.description || '').replace(/"/g, '""')}"`,
                e.amount.toFixed(2)
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Expenses Tracking</h1>
                    <p className="text-sm mt-0.5" style={{ color: S.muted }}>Log and monitor overhead costs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={exportCSV}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                        style={{ backgroundColor: '#1e1e1e', color: '#9ca3af', border: '1px solid #3e3f3e' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>
                        <Download size={16} /> Export
                    </button>
                    <button onClick={() => openModal()}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-black transition-all active:scale-[0.98]"
                        style={{ backgroundColor: '#54c750' }}>
                        <Plus size={18} /> Add Expense
                    </button>
                </div>
            </div>

            {/* Total Summary Card */}
            <div className="rounded-2xl p-5 flex items-center gap-4" style={{ backgroundColor: '#1a1108', border: '1px solid #3a2a08' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#54c75022' }}>
                    <DollarSign size={22} className="text-white" />
                </div>
                <div>
                    <p className="text-sm" style={{ color: S.muted }}>Total Expenses</p>
                    <p className="text-3xl font-bold text-white">{currency}{total.toFixed(2)}</p>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                <div className="p-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${S.border}`, backgroundColor: S.surface }}>
                    <DollarSign size={18} className="text-white" />
                    <h2 className="font-bold text-white">Recent Expenses</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr style={{ backgroundColor: '#060c06' }}>
                                {['Date', 'Type', 'Description', 'Amount', 'Actions'].map((h, i) => (
                                    <th key={h} className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}
                                        style={{ color: S.muted, borderBottom: `1px solid ${S.border}` }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5"><SkeletonTable rows={5} cols={5} /></td></tr>
                            ) : expenses.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center" style={{ color: S.muted }}>No expenses recorded yet.</td></tr>
                            ) : expenses.map(exp => (
                                <tr key={exp._id} className="transition-colors"
                                    style={{ borderBottom: `1px solid ${S.border}` }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#060c06'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td className="px-6 py-4 text-sm" style={{ color: S.muted }}>
                                        {new Date(exp.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold"
                                            style={{
                                                backgroundColor: (typeColors[exp.expenseType] || '#6b7280') + '22',
                                                color: typeColors[exp.expenseType] || '#6b7280'
                                            }}>{exp.expenseType}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm" style={{ color: '#9ca3af' }}>{exp.description || '—'}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-white">{currency}{exp.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openModal(exp)} className="mr-4 transition-colors hover:text-blue-400"
                                            style={{ color: '#6b7280' }}><Edit2 size={16} /></button>
                                        <button onClick={() => setDeleteTarget(exp._id)} className="transition-colors hover:text-red-400"
                                            style={{ color: '#6b7280' }}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Delete Expense"
                message="Are you sure you want to delete this expense?"
                confirmText="Delete"
                confirmColor="red"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: '#000000aa' }}>
                    <div className="w-full max-w-md rounded-2xl shadow-2xl"
                        style={{ backgroundColor: '#060c06', border: '1px solid #3e3f3e' }}>
                        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #3e3f3e' }}>
                            <h3 className="text-lg font-bold text-white">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
                            <button onClick={() => { setIsModalOpen(false); setEditingExpense(null); }} style={{ color: S.muted }}
                                className="hover:text-white transition-colors"><X size={22} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>Expense Type</label>
                                <select value={formData.expenseType}
                                    onChange={e => setFormData({ ...formData, expenseType: e.target.value })}
                                    style={{ ...inputSt }}
                                    onFocus={e => e.target.style.borderColor = '#54c750'}
                                    onBlur={e => e.target.style.borderColor = '#3e3f3e'}>
                                    {expenseTypes.map(t => <option key={t} value={t} style={{ backgroundColor: '#060c06' }}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>Amount ({currency}) *</label>
                                <input required type="number" step="0.01" value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    style={inputSt}
                                    onFocus={e => e.target.style.borderColor = '#54c750'}
                                    onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>Description</label>
                                <textarea rows="3" value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ ...inputSt, resize: 'none' }}
                                    onFocus={e => e.target.style.borderColor = '#54c750'}
                                    onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => { setIsModalOpen(false); setEditingExpense(null); }}
                                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                    style={{ backgroundColor: '#3e3f3e', color: '#9ca3af' }}>Cancel</button>
                                <button type="submit" disabled={saving}
                                    className="px-4 py-2.5 rounded-xl text-sm font-bold text-black disabled:opacity-60"
                                    style={{ backgroundColor: '#54c750' }}>
                                    {saving ? 'Saving...' : editingExpense ? 'Save Changes' : 'Save Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
