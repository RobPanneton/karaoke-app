import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CurrentTranscript,
  SetTranscriptDataFn,
  TranscriptContext as ITranscriptContext,
  TranscriptItemList,
} from "../types/transcriptTypes";

export const TranscriptContext = createContext<ITranscriptContext | null>(null);

export const TranscriptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transcriptList, setTranscriptList] = useState<TranscriptItemList | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<CurrentTranscript | null>(null);
  const [userSelect, setUserSelect] = useState<number>(-1); // keep track of user select for ui changes
  const [listError, setListError] = useState<null | any>(null);
  const [transcriptError, setTranscriptError] = useState<null | any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  const apiURL = process.env.REACT_APP_TRANSCRIPT_API_URL;

  if (!apiURL) {
    throw new Error("REACT_APP_TRANSCRIPT_API_URL is not defined");
  }

  const getTranscriptData = useCallback(
    async (endpoint: string, setDataFn: SetTranscriptDataFn, setErrorFn: Dispatch<SetStateAction<any>>) => {
      try {
        setIsLoading(true);
        // fetch data from provided endpoint
        const res = await fetch(`${apiURL}${endpoint}`);

        // throw error if request completes but returns non-2xx status code
        if (!res.ok) throw new Error(`Error fetching data: ${res?.statusText}`);

        // parse data and set to state
        const data = await res.json();

        setDataFn(data);
        setErrorFn(null);
        setIsLoading(false);
      } catch (e) {
        console.error({ e });
        setErrorFn(e);
        setIsLoading(false);
      }
    },
    [apiURL]
  );

  const handleUserSelect = (e: React.MouseEvent<HTMLButtonElement>) => {
    // could check here if the id is a number, if not, handle error
    const id = e?.currentTarget.value;
    setUserSelect(+id);

    // handle no id being sent to function
    if (!id) {
      setTranscriptError(true);
      return;
    }

    // get selected transcript data: call method to fetch it and set to state
    getTranscriptData(`/transcripts/${id}`, setCurrentTranscript, setTranscriptError);

    if (playerContainerRef?.current) {
      const topOffset = playerContainerRef.current.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  useEffect(() => {
    getTranscriptData("/transcripts", setTranscriptList, setListError);
  }, [getTranscriptData]);

  return (
    <TranscriptContext.Provider
      value={{
        transcriptList,
        currentTranscript,
        userSelect,
        listError,
        transcriptError,
        handleUserSelect,
        isLoading,
        playerContainerRef,
      }}
    >
      {children}
    </TranscriptContext.Provider>
  );
};

export const useTranscriptContext = () => {
  const context = useContext(TranscriptContext);
  if (context === null) throw new Error("useTranscriptContext must be used within a TranscriptProvider");

  return context;
};
