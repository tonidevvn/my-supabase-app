import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import ImageUploader from "./components/ImageUploader";
import Auth from "./pages/Auth";
import Products from "./pages/Products";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleCreateProduct = async () => {
    const { name, description, price } = newProduct;
    const priceVal = parseFloat(price);
    if (!name || !description || isNaN(priceVal))
      return alert("Please fill in all fields correctly");

    const { error } = await supabase.from("products").insert({
      name,
      description,
      price: priceVal,
      image_url: imageUrl || null,
    });

    if (error) alert(error.message);
    else {
      setNewProduct({ name: "", description: "", price: "" });
      setImageUrl("");
    }
  };

  return (
    <>
      {!user ? (
        <Auth
          onAuthSuccess={() =>
            supabase.auth.getUser().then(({ data }) => setUser(data.user))
          }
        />
      ) : (
        <h2>Required to login to access more information.</h2>
      )}

      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">📦 Tech Product Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-1 rounded"
          >
            Logout
          </button>
        </div>

        {/* Add product form */}
        <div className="border p-4 rounded mb-8 bg-white shadow">
          <h2 className="text-xl font-semibold mb-2">Add Product</h2>
          <div className="flex flex-col gap-2">
            <input
              className="border p-2"
              placeholder="Name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
            <input
              className="border p-2"
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
            />
            <input
              className="border p-2"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
            />
            <ImageUploader onUpload={(url) => setImageUrl(url)} />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-32 mt-2 rounded border"
              />
            )}
            <button
              onClick={handleCreateProduct}
              className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
            >
              Add Product
            </button>
          </div>
        </div>

        {/* Product list from separate component */}
        <Products />
      </div>
    </>
  );
}