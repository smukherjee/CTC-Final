import { useEffect, useState } from "react";
import axios from "axios";

export interface Vendor {
  id: number;
  name: string;
  type: "Vendor" | "Supplier" | "Broker" | "Driver";
  gstin?: string;
  mobile?: string;
  pan?: string;
  address?: string;
  tds_certificate_url?: string;
}

export default function VendorMaster() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/vendor/")
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setVendors(data);
        } else if (data && Array.isArray((data as any).results)) {
          setVendors((data as any).results);
        } else {
          console.warn("Unexpected vendor response shape:", data);
          setVendors([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load vendors:", err);
        setVendors([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Vendor Master</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>GST No</th>
              <th>Contact</th>
              <th>Address</th>
              <th>TDS Certificate</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td>{vendor.id}</td>
                <td>{vendor.name}</td>
                <td>{vendor.type}</td>
                <td>{vendor.gstin}</td>
                <td>{vendor.mobile}</td>
                <td>{vendor.address}</td>
                <td>
                  {vendor.tds_certificate_url ? (
                    <a href={vendor.tds_certificate_url} target="_blank" rel="noopener noreferrer">View</a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
