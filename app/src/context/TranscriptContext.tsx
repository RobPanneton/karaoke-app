import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  CurrentTranscript,
  TranscriptContext,
  TranscriptItemList,
} from "../types/transcriptTypes";

export const TransacriptContext = createContext<TranscriptContext | null>(null);

export const TranscriptProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [transcriptList, setTranscriptList] =
    useState<TranscriptItemList | null>(null);
  const [currentTranscript, setCurrentTranscript] =
    useState<CurrentTranscript | null>(null);
  const [listError, setListError] = useState<null | any>(null);
  const [transcriptError, setTranscriptError] = useState<null | any>(null);

  const apiURL = process.env.REACT_APP_TRANSCRIPT_API_URL;

  const getTranscriptData = useCallback(
    async (
      endpoint: string,
      setFn:
        | Dispatch<SetStateAction<TranscriptItemList | null>>
        | Dispatch<SetStateAction<CurrentTranscript | null>>,
      setErrorFn: Dispatch<SetStateAction<any>>
    ) => {
      console.log("fetching data");
      try {
        const res = await fetch(`${apiURL}${endpoint}`);
        const data = await res.json();
        console.log({ data });
        setFn(data);
      } catch (e) {
        console.log({ e });
        setErrorFn(e);
      }
    },
    [apiURL]
  );

  useEffect(() => {
    console.log("use effect triggered");
    getTranscriptData("/transcripts", setTranscriptList, setListError);
  }, [getTranscriptData]);

  return (
    <TransacriptContext.Provider
      value={{ transcriptList, currentTranscript, listError, transcriptError }}
    >
      {children}
    </TransacriptContext.Provider>
  );
};

export const useTranscriptContext = () => {
  const context = useContext(TransacriptContext);
  if (context === null)
    throw new Error("useSearchContext must be used within an AppProvider");

  return context;
};
