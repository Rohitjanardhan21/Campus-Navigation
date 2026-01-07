// Integration with campus systems
export interface CampusService {
  id: string;
  name: string;
  location: [number, number];
  status: 'open' | 'closed' | 'busy';
  hours: {
    [day: string]: { open: string; close: string; };
  };
  realTimeData?: {
    crowdLevel: 'low' | 'medium' | 'high';
    waitTime?: number; // minutes
    capacity?: { current: number; max: number; };
  };
}

// Library integration
export const getLibraryData = async (): Promise<CampusService[]> => {
  // Integrate with library management system API
  const response = await fetch('/api/campus/libraries');
  return response.json();
};

// Cafeteria/dining integration  
export const getDiningData = async (): Promise<CampusService[]> => {
  // Integrate with dining services API
  const response = await fetch('/api/campus/dining');
  return response.json();
};

// Parking availability
export const getParkingData = async (): Promise<CampusService[]> => {
  // Integrate with parking management system
  const response = await fetch('/api/campus/parking');
  return response.json();
};

// Bus/shuttle tracking
export const getShuttleData = async () => {
  // Integrate with campus transportation API
  const response = await fetch('/api/campus/shuttles');
  return response.json();
};

// Event integration
export const getCampusEvents = async (location: [number, number]) => {
  // Integrate with campus event management system
  const response = await fetch(`/api/campus/events?lat=${location[1]}&lng=${location[0]}`);
  return response.json();
};