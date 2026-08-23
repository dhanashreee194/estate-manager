import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export default function FileUpload({
  onUploaded,
}: {
  onUploaded: (data: any) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setLoading(true);

      const fileRef = ref(storage, `documents/${Date.now()}-${file.name}`);

      await uploadBytes(fileRef, file);

      const url = await getDownloadURL(fileRef);

      onUploaded({
        url,
        fileName: file.name,
      });

      alert("Upload successful");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />

      {loading && <p>Uploading...</p>}
    </div>
  );
}
