import { useEffect, useState } from "react";

const useStops = () => {
  const [stops, setStops] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStops = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3003/api/station");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setStops(data);
      } catch (err) {
        console.error("Failed to fetch stations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStops();
  }, []);

  return { stops, loading, error };
};

export default useStops;