import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Users, Package, DollarSign, ShoppingBag, Database, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAdminStats, seedDatabase, getCategories, createCategory } from '../services/api';

export function Admin() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, categoriesData] = await Promise.all([
        getAdminStats(accessToken!),
        getCategories()
      ]);
      setStats(statsData.stats);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (!confirm('Seed the database with sample data? This will add products and categories.')) {
      return;
    }

    setSeeding(true);
    try {
      await seedDatabase(accessToken!);
      alert('Database seeded successfully!');
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to seed database');
      console.error('Seed error:', error);
    } finally {
      setSeeding(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      await createCategory(categoryForm, accessToken!);
      setShowCategoryModal(false);
      setCategoryForm({ name: '', description: '' });
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to create category');
      console.error('Create category error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#4DC2EF] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#342639] mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your e-commerce platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Users</h3>
            <p className="text-3xl font-bold text-[#342639]">{stats.totalUsers}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingBag size={24} className="text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Orders</h3>
            <p className="text-3xl font-bold text-[#342639]">{stats.totalOrders}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign size={24} className="text-green-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold text-[#342639]">${stats.totalRevenue.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package size={24} className="text-orange-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Products</h3>
            <p className="text-3xl font-bold text-[#342639]">{stats.totalProducts}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-[#342639] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="text-[#4DC2EF]" size={24} />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Manage Products</p>
                <p className="text-sm text-gray-600">Add, edit, or remove products</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/orders')}
              className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ShoppingBag className="text-[#4DC2EF]" size={24} />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Manage Orders</p>
                <p className="text-sm text-gray-600">View and update order status</p>
              </div>
            </button>

            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="text-[#4DC2EF]" size={24} />
              <div className="text-left">
                <p className="font-semibold text-gray-800">Add Category</p>
                <p className="text-sm text-gray-600">Create a new product category</p>
              </div>
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#342639]">Categories</h2>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="bg-[#4DC2EF] hover:bg-[#5E998C] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Add Category
            </button>
          </div>
          
          {categories.length === 0 ? (
            <p className="text-gray-600">No categories yet. Create your first category!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Database Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-[#342639] mb-4">Database Management</h2>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#4DC2EF] rounded-lg flex items-center justify-center flex-shrink-0">
              <Database size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-2">Seed Sample Data</h3>
              <p className="text-gray-600 mb-4">
                Populate the database with sample products and categories for testing and demonstration.
                This will only work if the database is empty.
              </p>
              <button
                onClick={handleSeedDatabase}
                disabled={seeding}
                className="bg-[#5E998C] hover:bg-[#4DC2EF] text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {seeding ? 'Seeding...' : 'Seed Database'}
              </button>
            </div>
          </div>
        </div>

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-[#342639] mb-4">Create Category</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DC2EF] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4DC2EF] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateCategory}
                  className="flex-1 bg-[#4DC2EF] hover:bg-[#5E998C] text-white px-4 py-3 rounded-lg transition-colors font-semibold"
                >
                  Create Category
                </button>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
