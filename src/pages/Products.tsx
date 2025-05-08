import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("public:products")
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
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (!error) setProducts(data as Product[]);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">All Products</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((p) => (
          <li key={p.id} className="border p-4 rounded shadow bg-white">
            <h3 className="text-xl font-semibold">{p.name}</h3>
            {p.image_url && (
              <img
                src={p.image_url}
                alt={p.name}
                className="w-full h-48 object-cover rounded mt-2"
              />
            )}
            <p className="mt-2 text-sm text-gray-700">{p.description}</p>
            <p className="text-green-600 font-bold mt-1">
              ${p.price.toFixed(2)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}