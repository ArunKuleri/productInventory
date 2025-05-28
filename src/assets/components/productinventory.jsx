import React, { useState, useEffect } from "react";
import axios from "axios"; 

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

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Product Inventory</h1>

      {/* Error Display */}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      {/* Product Form */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Create Product</h2>
        <input
          type="text"
          placeholder="Product Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        {formData.variants.map((variant, i) => (
          <div key={i} className="mb-2">
            <input
              type="text"
              placeholder="Variant"
              name="variant"
              value={variant.name}
              onChange={(e) => handleFormChange(i, null, e)}
              className="border p-2 w-full mb-1"
            />
            {variant.subVariants.map((sub, j) => (
              <input
                key={j}
                type="text"
                placeholder="Sub-Variant"
                value={sub}
                onChange={(e) => handleFormChange(i, j, e)}
                className="border p-2 w-full mb-1"
              />
            ))}
            <button
              className="text-blue-500 text-sm"
              onClick={() => addSubVariant(i)}
            >
              + Add Sub-Variant
            </button>
          </div>
        ))}
        <button className="text-blue-500" onClick={addVariant}>
          + Add Variant
        </button>
        <button
          onClick={handleCreateProduct}
          className="bg-blue-600 text-white px-4 py-2 mt-4 rounded"
        >
          Create Product
        </button>
      </div>

      {/* Product List */}
      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Product List</h2>
        {Array.isArray(products)&& products.map((product) => (
          <div key={product.id} className="border-b py-2">
            <p className="font-medium">{product.name}</p>
            {product.variants?.map((v, vi) => (
              <div key={vi} className="ml-4">
                <p className="text-sm">Variant: {v.name}</p>
                <ul className="ml-4 list-disc">
                  {v.subVariants.map((s, si) => (
                    <li key={si} className="text-xs">{s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Stock Management */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Stock Management</h2>
        <input
          type="text"
          placeholder="Product ID"
          value={stockAction.productId}
          onChange={(e) => setStockAction({ ...stockAction, productId: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <input
          type="text"
          placeholder="Variant"
          value={stockAction.variant}
          onChange={(e) => setStockAction({ ...stockAction, variant: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={stockAction.quantity}
          onChange={(e) => setStockAction({ ...stockAction, quantity: parseInt(e.target.value) })}
          className="border p-2 w-full mb-2"
        />
        <select
          value={stockAction.action}
          onChange={(e) => setStockAction({ ...stockAction, action: e.target.value })}
          className="border p-2 w-full mb-4"
        >
          <option value="add">Add Stock</option>
          <option value="remove">Remove Stock</option>
        </select>
        <button
          onClick={handleStockChange}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Update Stock
        </button>
      </div>
    </div>
  );
}
