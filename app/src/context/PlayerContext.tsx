import React, { createContext, useContext, useState } from "react";

export const PlayerContext = createContext(null);

export const PlayerProvider: React.FC = ({}) => {
  return <PlayerContext.Provider value={null}>{}</PlayerContext.Provider>;
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (context === null)
    throw new Error("useSearchContext must be used within an AppProvider");

  return context;
};
