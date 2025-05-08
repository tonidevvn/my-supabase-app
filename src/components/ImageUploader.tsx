import { useState } from "react";
import { supabase } from "../lib/supabase";
import { v4 as uuidv4 } from "uuid";

export default function ImageUploader({
  onUpload,
}: {
  onUpload: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const filePath = `${uuidv4()}.${file.name.split(".").pop()}`;

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (error) {
      alert("Upload failed: " + error.message);
    } else {
      const { data: publicUrl } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      onUpload(publicUrl.publicUrl);
    }

    setUploading(false);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
}