import React, { createContext, useContext, useState } from "react";

export const TransacriptContext = createContext(null);

export const SearchProvider: React.FC = ({}) => {
  return (
    <TransacriptContext.Provider value={null}>{}</TransacriptContext.Provider>
  );
};

export const useTranscriptContext = () => {
  const context = useContext(TransacriptContext);
  if (context === null)
    throw new Error("useSearchContext must be used within an AppProvider");

  return context;
};
