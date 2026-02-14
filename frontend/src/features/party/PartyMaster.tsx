import React, { useEffect, useState } from "react";
import axios from "axios";

export interface Party {
  id: number;
  name: string;
  type: "Customer" | "Consignor" | "Consignee";
  gstin?: string;
  mobile?: string;
  address?: string;
}

export default function PartyMaster() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/party/")
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setParties(data);
        } else if (data && Array.isArray((data as any).results)) {
          setParties((data as any).results);
        } else {
          console.warn("Unexpected party response shape:", data);
          setParties([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load parties:", err);
        setParties([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Party Master</h2>
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
            </tr>
          </thead>
          <tbody>
            {parties.map((party) => (
              <tr key={party.id}>
                <td>{party.id}</td>
                <td>{party.name}</td>
                <td>{party.type}</td>
                <td>{party.gstin}</td>
                <td>{party.mobile}</td>
                <td>{party.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
