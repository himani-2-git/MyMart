import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useSettings } from '../context/settings-context';
import { useToast } from '../components/toast-context';
import ConfirmModal from '../components/ConfirmModal';
import { SkeletonTable } from '../components/ui/Loader';
import { Plus, Edit2, Trash2, Search, AlertTriangle, X, Clock, ChevronLeft, ChevronRight, PackagePlus } from 'lucide-react';

const S = { bg: '#0d0d14', card: '#1e1e1e', surface: '#060c06', border: '#3e3f3e', muted: '#6b7280', text: '#e2e8f0' };
const inputCls = {
    backgroundColor: '#060c06', border: '1px solid #3e3f3e',
    color: '#e2e8f0', borderRadius: '12px',
    outline: 'none', width: '100%', fontSize: '14px',
};

const ITEMS_PER_PAGE = 15;

const Inventory = () => {
    const { currency } = useSettings();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [restockTarget, setRestockTarget] = useState(null);
    const [restockQty, setRestockQty] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({
        name: '', category: '', costPrice: '', sellingPrice: '', quantity: '', expiryDate: '', supplierName: '', barcode: ''
    });
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    const fetchProducts = useCallback(async () => {
        try {
            const { data } = await API.get('/api/products');
            setProducts(data); setLoading(false);
        } catch {
            toast.error('Failed to load products');
            setLoading(false);
        }
    }, [toast]);
    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name, category: product.category,
                costPrice: product.costPrice, sellingPrice: product.sellingPrice,
                quantity: product.quantity,
                expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
                supplierName: product.supplierName || '', barcode: product.barcode || ''
            });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', category: '', costPrice: '', sellingPrice: '', quantity: '', expiryDate: '', supplierName: '', barcode: '' });
        }
        setIsModalOpen(true);
    };
    const closeModal = () => { setIsModalOpen(false); setEditingProduct(null); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingProduct) {
                await API.put(`/api/products/${editingProduct._id}`, formData);
                toast.success('Product updated successfully');
            } else {
                await API.post('/api/products', formData);
                toast.success('Product added successfully');
            }
            fetchProducts(); closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await API.delete(`/api/products/${deleteTarget}`);
            toast.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        }
        setDeleteTarget(null);
    };

    const handleRestock = async (e) => {
        e.preventDefault();
        if (!restockTarget || !restockQty) return;
        setSaving(true);
        try {
            const updatedProduct = {
                name: restockTarget.name,
                category: restockTarget.category,
                costPrice: restockTarget.costPrice,
                sellingPrice: restockTarget.sellingPrice,
                quantity: Number(restockTarget.quantity) + Number(restockQty)
            };

            if (restockTarget.expiryDate) {
                updatedProduct.expiryDate = new Date(restockTarget.expiryDate).toISOString().split('T')[0];
            }

            if (restockTarget.supplierName) {
                updatedProduct.supplierName = restockTarget.supplierName;
            }

            if (restockTarget.barcode) {
                updatedProduct.barcode = restockTarget.barcode;
            }

            await API.put(`/api/products/${restockTarget._id}`, updatedProduct);
            toast.success(`Successfully restocked ${restockTarget.name}`);
            fetchProducts();
            setRestockTarget(null);
            setRestockQty('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to restock');
        } finally {
            setSaving(false);
        }
    };

    // Get unique categories
    const categories = ['All', ...new Set(products.map(p => p.category))];

    const filteredProducts = products
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(p => categoryFilter === 'All' || p.category === categoryFilter);

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Reset page when filters change
    useEffect(() => { setCurrentPage(1); }, [searchTerm, categoryFilter]);

    const isNearExpiry = (d) => { if (!d) return false; const diff = Math.ceil((new Date(d) - new Date()) / 86400000); return diff > 0 && diff <= 7; };

    return (
        <div className="space-y-5 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
                    <p className="text-sm mt-0.5" style={{ color: S.muted }}>Manage stock, prices, and track expiry dates.</p>
                </div>
                <button onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-black transition-all active:scale-[0.98]"
                    style={{ backgroundColor: '#54c750' }}>
                    <Plus size={18} /> Add Product
                </button>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                {/* Search & Filter */}
                <div className="p-4 flex flex-col sm:flex-row gap-3" style={{ borderBottom: `1px solid ${S.border}` }}>
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: S.muted }} />
                        <input type="text" placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
                            style={{ ...inputCls, width: '100%' }}
                            onFocus={e => e.target.style.borderColor = '#54c750'}
                            onBlur={e => e.target.style.borderColor = S.border}
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="py-2.5 px-3 rounded-xl text-sm outline-none"
                        style={{ ...inputCls, width: 'auto', minWidth: '150px' }}
                    >
                        {categories.map(c => (
                            <option key={c} value={c} style={{ backgroundColor: '#060c06' }}>{c}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr style={{ backgroundColor: '#060c06' }}>
                                {['Product Name', 'Category', 'Stock', 'Cost', 'Price', 'Actions'].map((h, i) => (
                                    <th key={h} className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}
                                        style={{ color: S.muted, borderBottom: `1px solid ${S.border}` }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6"><SkeletonTable rows={8} cols={6} /></td></tr>
                            ) : paginatedProducts.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center" style={{ color: S.muted }}>No products found.</td></tr>
                            ) : paginatedProducts.map((p) => (
                                <tr key={p._id} className="transition-colors"
                                    style={{ borderBottom: `1px solid ${S.border}` }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#060c06'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">{p.name}</span>
                                            {p.quantity < 10 && <AlertTriangle size={14} className="text-white" />}
                                            {isNearExpiry(p.expiryDate) && <Clock size={14} className="text-rose-400" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                                            style={{ backgroundColor: '#3e3f3e', color: '#9ca3af' }}>{p.category}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold" style={{ color: p.quantity < 10 ? '#54c750' : '#e2e8f0' }}>
                                            {p.quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm" style={{ color: '#6b7280' }}>{currency}{p.costPrice.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-white">{currency}{p.sellingPrice.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end">
                                        <button onClick={() => { setRestockTarget(p); setRestockQty(''); }} className="mr-4 transition-colors hover:text-green-400"
                                            style={{ color: '#6b7280' }} title="Restock"><PackagePlus size={16} /></button>
                                        <button onClick={() => openModal(p)} className="mr-4 transition-colors hover:text-blue-400"
                                            style={{ color: '#6b7280' }} title="Edit"><Edit2 size={16} /></button>
                                        <button onClick={() => setDeleteTarget(p._id)} className="transition-colors hover:text-red-400"
                                            style={{ color: '#6b7280' }} title="Delete"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-3" style={{ borderTop: `1px solid ${S.border}` }}>
                        <p className="text-xs" style={{ color: S.muted }}>
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length}
                        </p>
                        <div className="flex gap-1">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                className="p-2 rounded-lg transition-colors disabled:opacity-30"
                                style={{ backgroundColor: '#3e3f3e', color: '#e2e8f0' }}><ChevronLeft size={14} /></button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                                Math.max(0, currentPage - 3), currentPage + 2
                            ).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)}
                                    className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
                                    style={{
                                        backgroundColor: currentPage === page ? '#54c750' : '#3e3f3e',
                                        color: currentPage === page ? '#000' : '#e2e8f0'
                                    }}>{page}</button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                className="p-2 rounded-lg transition-colors disabled:opacity-30"
                                style={{ backgroundColor: '#3e3f3e', color: '#e2e8f0' }}><ChevronRight size={14} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
                confirmText="Delete"
                confirmColor="red"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* Restock Modal */}
            {restockTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: '#000000aa' }}>
                    <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
                        style={{ backgroundColor: '#060c06', border: '1px solid #3e3f3e' }}>
                        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #3e3f3e' }}>
                            <h3 className="text-lg font-bold text-white">Restock {restockTarget.name}</h3>
                            <button onClick={() => setRestockTarget(null)} style={{ color: '#6b7280' }} className="hover:text-white transition-colors"><X size={22} /></button>
                        </div>
                        <form onSubmit={handleRestock} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>Quantity to Add *</label>
                                <input type="number" required min="1"
                                    value={restockQty} onChange={e => setRestockQty(e.target.value)}
                                    className="px-3 py-2" style={inputCls}
                                    onFocus={e => e.target.style.borderColor = '#22c55e'}
                                    onBlur={e => e.target.style.borderColor = '#3e3f3e'} autoFocus />
                            </div>
                            <div className="p-3 rounded-xl" style={{ backgroundColor: '#1e1e1e', border: '1px solid #3e3f3e' }}>
                                <p className="text-xs" style={{ color: S.muted }}>
                                    Current Stock: <span className="text-white font-medium">{restockTarget.quantity}</span>
                                </p>
                                <p className="text-xs mt-1" style={{ color: S.muted }}>
                                    New Stock: <span className="text-green-400 font-bold">{restockTarget.quantity + (Number(restockQty) || 0)}</span>
                                </p>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setRestockTarget(null)}
                                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                    style={{ backgroundColor: '#3e3f3e', color: '#9ca3af' }}>Cancel</button>
                                <button type="submit" disabled={saving || !restockQty || Number(restockQty) <= 0}
                                    className="px-4 py-2.5 rounded-xl text-sm font-bold text-black transition-all disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                                    {saving ? 'Saving...' : 'Confirm Restock'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: '#000000aa' }}>
                    <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
                        style={{ backgroundColor: '#060c06', border: '1px solid #3e3f3e' }}>
                        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #3e3f3e' }}>
                            <h3 className="text-lg font-bold text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            <button onClick={closeModal} style={{ color: '#6b7280' }} className="hover:text-white transition-colors"><X size={22} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {[
                                { label: 'Product Name', name: 'name', type: 'text', required: true },
                                { label: 'Category', name: 'category', type: 'text', required: true },
                            ].map(f => (
                                <div key={f.name}>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>{f.label} {f.required && '*'}</label>
                                    <input type={f.type} name={f.name} required={f.required}
                                        value={formData[f.name]} onChange={handleInputChange}
                                        className="px-3 py-2" style={inputCls}
                                        onFocus={e => e.target.style.borderColor = '#54c750'}
                                        onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                                </div>
                            ))}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Cost Price *', name: 'costPrice', type: 'number' },
                                    { label: 'Selling Price *', name: 'sellingPrice', type: 'number' },
                                    { label: 'Quantity *', name: 'quantity', type: 'number' },
                                    { label: 'Expiry Date', name: 'expiryDate', type: 'date' },
                                ].map(f => (
                                    <div key={f.name}>
                                        <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>{f.label}</label>
                                        <input type={f.type} step={f.type === 'number' ? '0.01' : undefined} name={f.name}
                                            required={f.label.includes('*')} value={formData[f.name]}
                                            onChange={handleInputChange} className="px-3 py-2" style={inputCls}
                                            onFocus={e => e.target.style.borderColor = '#54c750'}
                                            onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>Supplier</label>
                                    <input type="text" name="supplierName" value={formData.supplierName}
                                        onChange={handleInputChange} className="px-3 py-2" style={inputCls}
                                        onFocus={e => e.target.style.borderColor = '#54c750'}
                                        onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>Barcode</label>
                                    <input type="text" name="barcode" value={formData.barcode}
                                        onChange={handleInputChange} className="px-3 py-2" style={inputCls}
                                        onFocus={e => e.target.style.borderColor = '#54c750'}
                                        onBlur={e => e.target.style.borderColor = '#3e3f3e'} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={closeModal}
                                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                    style={{ backgroundColor: '#3e3f3e', color: '#9ca3af' }}>Cancel</button>
                                <button type="submit" disabled={saving}
                                    className="px-4 py-2.5 rounded-xl text-sm font-bold text-black transition-all disabled:opacity-60"
                                    style={{ backgroundColor: '#54c750' }}>
                                    {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
