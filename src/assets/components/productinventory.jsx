import React, { useState, useEffect } from "react";
import axios from "axios";
import { Package, Plus, Minus, RefreshCw, AlertCircle, Edit3, Trash2, Search, Filter } from "lucide-react";

export default function ProductInventory() {
  const [products, setProducts] = useState([]);

  const [stockAction, setStockAction] = useState({
    productId: "",
    variantCombination: "",
    quantity: 1,
    action: "add"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    productName: "",
    productCode: "",
    productImage: "",
    hsnCode: "",
    createdUser: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // You might want to get this from user context
    variants: [{
      name: "",
      options: [""]
    }]
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("ProductInventory?page=1&pageSize=10");
      setProducts(response.data);
    } catch (err) {
      setError("Failed to fetch products.");
    }
  };

  // Updated initial form state


  // Updated handleCreateProduct function
  const handleCreateProduct = async () => {
    if (!formData.productName.trim()) return setError("Product name is required.");
    if (!formData.productCode.trim()) return setError("Product code is required.");

    // Transform the form data to match API format
    const productData = {
      productCode: formData.productCode,
      productName: formData.productName,
      productImage: formData.productImage || "",
      createdUser: formData.createdUser,
      hsnCode: formData.hsnCode || "",
      variants: formData.variants
        .filter(variant => variant.name.trim()) // Only include variants with names
        .map(variant => ({
          name: variant.name,
          options: variant.options.filter(option => option.trim()) // Only include non-empty options
        }))
    };

    setLoading(true);
    try {
      await axios.post("ProductInventory/create", productData);

      // Reset form
      setFormData({
        productName: "",
        productCode: "",
        productImage: "",
        hsnCode: "",
        createdUser: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        variants: [{ name: "", options: [""] }]
      });

      setError("");
      fetchProducts();
    } catch (err) {
      console.error('Create product error:', err);
      setError(err.response?.data?.message || "Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  // Updated handleFormChange function
  const handleFormChange = (variantIndex, optionIndex, e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData };

    if (name === 'variant') {
      updatedFormData.variants[variantIndex].name = value;
    } else if (optionIndex !== null) {
      updatedFormData.variants[variantIndex].options[optionIndex] = value;
    }

    setFormData(updatedFormData);
  };

  // Updated addVariant function
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { name: "", options: [""] }]
    });
  };

  // Updated removeVariant function
  const removeVariant = (index) => {
    const updatedVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: updatedVariants });
  };

  // Updated addSubVariant function (now addOption)
  const addSubVariant = (variantIndex) => {
    const updatedFormData = { ...formData };
    updatedFormData.variants[variantIndex].options.push("");
    setFormData(updatedFormData);
  };

  // Updated removeSubVariant function (now removeOption)
  const removeSubVariant = (variantIndex, optionIndex) => {
    const updatedFormData = { ...formData };
    updatedFormData.variants[variantIndex].options =
      updatedFormData.variants[variantIndex].options.filter((_, i) => i !== optionIndex);
    setFormData(updatedFormData);
  };

  const handleStockChange = async () => {
    if (!stockAction.productId.trim()) {
      return setError("Product ID is required.");
    }

    if (!stockAction.variantCombination.trim()) {
      return setError("Variant combination is required.");
    }

    if (stockAction.quantity <= 0) {
      return setError("Quantity must be greater than 0.");
    }

    // Prepare the request data
    const requestData = {
      productId: stockAction.productId,
      variantCombination: stockAction.variantCombination,
      quantity: stockAction.quantity
    };

    // Determine the endpoint based on action
    const endpoint = stockAction.action === "add"
      ? "ProductInventory/stock/add"
      : "ProductInventory/stock/remove";

    setLoading(true);
    try {
      await axios.post(endpoint, requestData);

      // Reset form
      setStockAction({
        productId: "",
        variantCombination: "",
        quantity: 1,
        action: "add"
      });

      setError("");
      fetchProducts();
    } catch (err) {
      console.error('Stock update error:', err);
      setError(err.response?.data?.message || "Stock update failed.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products?.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productCode.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const copyProductId = (productId) => {
    navigator.clipboard.writeText(productId).then(() => {
      // You could add a toast notification here
      console.log('Product ID copied to clipboard');
    });
  };

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
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Code *
                </label>
                <input
                  type="text"
                  placeholder="Enter product code (e.g., PRD001)"
                  value={formData.productCode}
                  onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image URL
                </label>
                <input
                  type="url"
                  placeholder="Enter image URL (optional)"
                  value={formData.productImage}
                  onChange={(e) => setFormData({ ...formData, productImage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HSN Code
                </label>
                <input
                  type="text"
                  placeholder="Enter HSN code (e.g., 6109)"
                  value={formData.hsnCode}
                  onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
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
                          placeholder="Variant name (e.g., Size, Color)"
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
                          Options
                        </label>
                        {variant.options.map((option, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Option value (e.g., S, M, L or Red, Blue)"
                              value={option}
                              onChange={(e) => handleFormChange(i, j, e)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            />
                            {variant.options.length > 1 && (
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
                          Add Option
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
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Stock Management
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product ID *
                </label>
                <input
                  type="text"
                  placeholder="Enter product ID (UUID)"
                  value={stockAction.productId}
                  onChange={(e) => setStockAction({ ...stockAction, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can copy the product ID from the product list below
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variant Combination *
                </label>
                <input
                  type="text"
                  placeholder="Enter variant combination (e.g., blue, red-large, size-m-color-blue)"
                  value={stockAction.variantCombination}
                  onChange={(e) => setStockAction({ ...stockAction, variantCombination: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the specific variant combination (case-sensitive)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
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
                    Action *
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-blue-100 rounded">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-1">How to use:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Copy the Product ID from any product card below</li>
                      <li>• Enter the exact variant combination (e.g., "blue", "large-red")</li>
                      <li>• Choose quantity and action (Add/Remove)</li>
                      <li>• Click "Update Stock" to apply changes</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStockChange}
                disabled={loading || !stockAction.productId || !stockAction.variantCombination}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : `${stockAction.action === 'add' ? 'Add' : 'Remove'} Stock`}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{product.productName}</h3>
                  <p className="text-sm text-gray-600">{product.productCode}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      ID: {product.id.substring(0, 8)}...
                    </span>
                    <button
                      onClick={() => copyProductId(product.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy full Product ID"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                    Stock: {product.totalStock || 0}
                  </span>
                </div>
              </div>

              {product.hsncode && (
                <div className="mb-3">
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    HSN: {product.hsncode}
                  </span>
                </div>
              )}

              {product.variants?.length > 0 && (
                <div className="space-y-3">
                  {product.variants.map((variant, vi) => (
                    <div key={vi} className="bg-gray-50 rounded-md p-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        {variant.name}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {variant.options?.map((option, oi) => (
                          <span
                            key={oi}
                            className="inline-block bg-white text-gray-600 text-xs px-2 py-1 rounded border cursor-pointer hover:bg-blue-50 transition-colors"
                            title="Click to use as variant combination"
                            onClick={() => setStockAction({ ...stockAction, variantCombination: option.optionValue })}
                          >
                            {option.optionValue}
                          </span>
                        )) || (
                            <span className="inline-block bg-white text-gray-400 text-xs px-2 py-1 rounded border italic">
                              No options
                            </span>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span>Created: {new Date(product.createDate).toLocaleDateString()}</span>
                <span className={`px-2 py-1 rounded-full ${product.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {product.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

}
