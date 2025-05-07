import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { v4 as uuidv4 } from "uuid";
import Auth from "./pages/Auth";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    if (user) {
      fetchProducts();
      const channel = supabase
        .channel("realtime-products")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "products" },
          () => {
            fetchProducts();
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (!error) setProducts(data as Product[]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${uuidv4()}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file);
    if (error) return alert(error.message);

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
  };

  const handleCreateProduct = async () => {
    const { name, description, price } = newProduct;
    const priceVal = parseFloat(price);
    if (!name || !description || isNaN(priceVal))
      return alert("Fill all fields");

    const { error } = await supabase.from("products").insert({
      name,
      description,
      price: priceVal,
    });

    if (error) alert(error.message);
    else setNewProduct({ name: "", description: "", price: "" });
  };

  if (!user)
    return (
      <Auth
        onAuthSuccess={() =>
          supabase.auth.getUser().then(({ data }) => setUser(data.user))
        }
      />
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-3xl font-bold">📦 Tech Product Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-1 rounded"
        >
          Logout
        </button>
      </div>

      <div className="border p-4 rounded mb-8">
        <h2 className="text-xl font-semibold mb-2">Add Product</h2>
        <div className="flex flex-col gap-2">
          <input
            placeholder="Name"
            className="border p-2"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct((p) => ({ ...p, name: e.target.value }))
            }
          />
          <input
            placeholder="Description"
            className="border p-2"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct((p) => ({ ...p, description: e.target.value }))
            }
          />
          <input
            placeholder="Price"
            className="border p-2"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct((p) => ({ ...p, price: e.target.value }))
            }
          />
          <input
            type="file"
            onChange={(e) =>
              e.target.files && handleFileUpload(e.target.files[0])
            }
          />
          {uploading && <p>Uploading image...</p>}
          {imageUrl && (
            <img src={imageUrl} alt="Product" className="w-32 mt-2 rounded" />
          )}
          <button
            onClick={handleCreateProduct}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add Product
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">All Products</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((p) => (
          <li key={p.id} className="border p-4 rounded shadow">
            <h3 className="text-xl font-semibold">{p.name}</h3>
            <p>{p.description}</p>
            <p className="text-green-600 font-bold">${p.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
