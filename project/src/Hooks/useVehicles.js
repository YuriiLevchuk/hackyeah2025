import { useEffect, useState } from "react";
let updates = 0;

const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchVehicles = async () => {
      try {
        console.log("update", updates++);
        const response = await fetch("http://localhost:3003/api/vehiclepos");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (isMounted) setVehicles(data);
      } catch (err) {
        console.error("Failed to fetch vehicles:", err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchVehicles(); // initial fetch
    const interval = setInterval(fetchVehicles, 1000 * 2); // refetch every 2 seconds

    return () => {
      isMounted = false;
      clearInterval(interval); // cleanup on unmount
    };
  }, []);

  return { vehicles, loading, error };
};

export default useVehicles;
