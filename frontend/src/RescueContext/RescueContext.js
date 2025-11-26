// src/context/RescueContext.js
import React, { createContext, useState } from 'react';

export const RescueContext = createContext();

export const RescueProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [drivers, setDrivers] = useState([
    { id: 1, name: "Driver A", location: { lat: 7.8731, lng: 80.7718 }, status: "available" },
    { id: 2, name: "Driver B", location: { lat: 7.8800, lng: 80.7800 }, status: "available" }
  ]);

  const updateReport = (updatedReport) => {
    setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
  };

  const updateDriverLocation = (driverId, location) => {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, location } : d));
  };

  return (
    <RescueContext.Provider value={{ reports, setReports, updateReport, drivers, updateDriverLocation }}>
      {children}
    </RescueContext.Provider>
  );
};
