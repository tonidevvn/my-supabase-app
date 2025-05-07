import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("products-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => fetchProducts()
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Product List (Live)</h1>
      <ul className="space-y-3">
        {products.map((p) => (
          <li key={p.id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <p>{p.description}</p>
            <p className="text-green-600 font-bold">${p.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
