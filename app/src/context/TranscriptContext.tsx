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
  SetTranscriptDataFn,
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
      setDataFn: SetTranscriptDataFn,
      setErrorFn: Dispatch<SetStateAction<any>>
    ) => {
      console.log("fetching data");
      try {
        const res = await fetch(`${apiURL}${endpoint}`);
        const data = await res.json();
        console.log({ data });
        setDataFn(data);
        setErrorFn(null);
      } catch (e) {
        console.log({ e });
        setErrorFn(e);
      }
    },
    [apiURL]
  );

  const handleUserSelect = (e: React.MouseEvent<HTMLButtonElement>) => {
    const id = e?.currentTarget.value;
    if (!id) {
      setTranscriptError(true);
      return;
    }
    getTranscriptData(
      `/transcripts/${id}`,
      setCurrentTranscript,
      setTranscriptError
    );
  };

  useEffect(() => {
    console.log("use effect triggered");
    getTranscriptData("/transcripts", setTranscriptList, setListError);
  }, [getTranscriptData]);

  return (
    <TransacriptContext.Provider
      value={{
        transcriptList,
        currentTranscript,
        listError,
        transcriptError,
        handleUserSelect,
      }}
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
