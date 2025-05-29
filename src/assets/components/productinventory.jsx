import React, { useState, useEffect } from "react";
import axios from "axios"; 
import {Package, Plus, Minus, RefreshCw, AlertCircle, Edit3, Trash2, Search, Filter } from "lucide-react";

export default function ProductInventory() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    variants: [{ name: "", subVariants: [""] }],
  });
  const [stockAction, setStockAction] = useState({
    productId: "",
    variant: "",
    quantity: 1,
    action: "add",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/products");
      setProducts(response.data);
    } catch (err) {
      setError("Failed to fetch products.");
    }
  };

  const handleFormChange = (index, subIndex, e) => {
    const newVariants = [...formData.variants];
    if (e.target.name === "variant") {
      newVariants[index].name = e.target.value;
    } else {
      newVariants[index].subVariants[subIndex] = e.target.value;
    }
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { name: "", subVariants: [""] }],
    });
  };

  const addSubVariant = (index) => {
    const newVariants = [...formData.variants];
    newVariants[index].subVariants.push("");
    setFormData({ ...formData, variants: newVariants });
  };
  const removeVariant = (index) => {
  const newVariants = [...formData.variants];
  newVariants.splice(index, 1);
  setFormData({ ...formData, variants: newVariants });
};

const removeSubVariant = (variantIndex, subVariantIndex) => {
  const newVariants = [...formData.variants];
  newVariants[variantIndex].subVariants.splice(subVariantIndex, 1);
  setFormData({ ...formData, variants: newVariants });
};

  const handleCreateProduct = async () => {
    if (!formData.name.trim()) return setError("Product name is required.");

    try {
      await axios.post("/api/products", formData);
      setFormData({ name: "", variants: [{ name: "", subVariants: [""] }] });
      setError("");
      fetchProducts();
    } catch (err) {
      setError("Failed to create product.");
    }
  };

  const handleStockChange = async () => {
    try {
      await axios.post(`/api/products/${stockAction.productId}/stock`, {
        variant: stockAction.variant,
        quantity: stockAction.quantity,
        action: stockAction.action,
      });
      fetchProducts();
    } catch (err) {
      setError("Stock update failed.");
    }
  };
const filteredProducts = Array.isArray(products)
  ? products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];
  return (
        <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Inventory</h1>
                <p className="text-gray-600">Manage your products and stock levels</p>
              </div>
            </div>
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Product Form */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Product
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variants
                </label>
                <div className="space-y-3">
                  {formData.variants.map((variant, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Variant name (e.g., Color, Size)"
                          name="variant"
                          value={variant.name}
                          onChange={(e) => handleFormChange(i, null, e)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        {formData.variants.length > 1 && (
                          <button
                            onClick={() => removeVariant(i)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Sub-variants
                        </label>
                        {variant.subVariants.map((sub, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Sub-variant value"
                              value={sub}
                              onChange={(e) => handleFormChange(i, j, e)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            />
                            {variant.subVariants.length > 1 && (
                              <button
                                onClick={() => removeSubVariant(i, j)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addSubVariant(i)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <Plus className="w-3 h-3" />
                          Add Sub-variant
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={addVariant}
                  className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Variant
                </button>
              </div>

              <button
                onClick={handleCreateProduct}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Product"}
              </button>
            </div>
          </div>

          {/* Stock Management */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Stock Management
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product ID
                </label>
                <input
                  type="text"
                  placeholder="Enter product ID"
                  value={stockAction.productId}
                  onChange={(e) => setStockAction({ ...stockAction, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variant
                </label>
                <input
                  type="text"
                  placeholder="Enter variant name"
                  value={stockAction.variant}
                  onChange={(e) => setStockAction({ ...stockAction, variant: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stockAction.quantity}
                    onChange={(e) => setStockAction({ ...stockAction, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action
                  </label>
                  <select
                    value={stockAction.action}
                    onChange={(e) => setStockAction({ ...stockAction, action: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="add">Add Stock</option>
                    <option value="remove">Remove Stock</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleStockChange}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Stock"}
              </button>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Product List ({filteredProducts.length})
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading products...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      ID: {product.id}
                    </span>
                  </div>
                  
                  {product.variants?.length > 0 && (
                    <div className="space-y-3">
                      {product.variants.map((variant, vi) => (
                        <div key={vi} className="bg-gray-50 rounded-md p-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            {variant.name}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {variant.subVariants.map((sub, si) => (
                              <span
                                key={si}
                                className="inline-block bg-white text-gray-600 text-xs px-2 py-1 rounded border"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

}
