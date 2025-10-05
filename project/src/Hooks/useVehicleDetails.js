import { useState } from "react";

const useVehicleDetails = () => {
  const [vehicleDetails, setVehicleDetails] = useState(null);
  return { vehicleDetails, setVehicleDetails };
};

export default useVehicleDetails;