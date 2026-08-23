import { useState, useEffect } from "react";
import { createCustomer, updateCustomer } from "../../api/customer";
import FileUpload from "../../components/FileUpload";
import { uploadKyc, getCustomerKyc } from "../../api/kyc";
export default function EditCustomerModal({ customer, onClose, onSaved }: any) {
  const [form, setForm] = useState<any>({});
  const [kycDocs, setKycDocs] = useState<any[]>([]);
  useEffect(() => {
    if (customer) {
      setForm(customer);

      if (customer.id) {
        loadKyc(customer.id);
      }
    }
  }, [customer]);
  if (!customer) return null;

  const change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // const save = async () => {
  //   try {
  //     await updateCustomer(customer.id, form);

  //     onSaved();
  //     onClose();
  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to update customer");
  //   }
  // };
  const loadKyc = async (customerId: string) => {
    try {
      const res = await getCustomerKyc(customerId);

      setKycDocs(res);
    } catch (err) {
      console.error(err);
    }
  };
  const save = async () => {
    try {
      if (customer?.id) {
        await updateCustomer(customer.id, form);
      } else {
        await createCustomer(form);
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save customer");
    }
  };
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{customer?.id ? "Edit Customer" : "Create Customer"}</h2>

        <div className="form-grid">
          <input
            name="name"
            placeholder="Name"
            value={form.name || ""}
            onChange={change}
          />

          <input
            name="phone"
            placeholder="Phone"
            value={form.phone || ""}
            onChange={change}
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email || ""}
            onChange={change}
          />

          <input
            name="address"
            placeholder="Address"
            value={form.address || ""}
            onChange={change}
          />

          <input
            name="panNumber"
            placeholder="PAN Number"
            value={form.panNumber || ""}
            onChange={change}
          />

          <input
            name="aadharNumber"
            placeholder="Aadhar Number"
            value={form.aadharNumber || ""}
            onChange={change}
          />

          <textarea
            name="notes"
            placeholder="Notes"
            value={form.notes || ""}
            onChange={change}
            rows={4}
          />
        </div>
        <hr />

        {customer?.id && (
          <>
            <hr />

            <h3>KYC Uploads</h3>

            <FileUpload
              onUploaded={async (fileData) => {
                try {
                  console.log("Uploaded:", fileData);

                  await uploadKyc(customer.id, {
                    type: "PAN",
                    number: form.panNumber || "",
                    fileUrl: fileData.url,
                  });

                  alert("KYC uploaded successfully");
                  loadKyc(customer.id);
                  setForm({
                    ...form,
                    uploadedFileUrl: fileData.url,
                  });
                } catch (err) {
                  console.error(err);

                  alert("Failed to save KYC");
                }
              }}
            />
          </>
        )}
        <div
          style={{
            marginTop: 20,
          }}
        >
          <h4>Uploaded Documents</h4>

          {kycDocs.length === 0 && <p>No KYC uploaded yet</p>}

          {kycDocs.map((doc) => (
            <div
              key={doc.id}
              style={{
                border: "1px solid #333",
                padding: 12,
                borderRadius: 8,
                marginBottom: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div>
                  <strong>{doc.type}</strong>
                </div>

                <div>{doc.number}</div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#999",
                  }}
                >
                  {doc.verified ? "Verified" : "Pending"}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                }}
              >
                <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                  View
                </a>

                <a href={doc.fileUrl} download>
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
        {!customer?.id && (
          <p
            style={{
              color: "#999",
              marginTop: 12,
              fontSize: 14,
            }}
          >
            Save customer first before uploading KYC documents.
          </p>
        )}
        <div className="modal-actions">
          <button onClick={onClose}>Close</button>

          <button onClick={save} className="primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
