import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import debounce from "lodash.debounce";

import { Word, Speaker, CurrentTranscript } from "../types/transcriptTypes";
import { CurrentParagraph, PlayerContext as IPlayerContext } from "../types/playerTypes";
import { useTranscriptContext } from "./TranscriptContext";
import { getNewCurrentParagraph, getCurrentTime, getWordAndSpeaker } from "./PlayerContext.helpers";

const PlayerContext = createContext<IPlayerContext | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [transcriptDuration, setTranscriptDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(isPlaying);
  const [processedTranscript, setProcessedTranscript] = useState<CurrentParagraph[] | null>(null);
  const [currentParagraph, setCurrentParagraph] = useState<CurrentParagraph | null>(null);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestRef = useRef<number | null>(null);

  const { currentTranscript } = useTranscriptContext();

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      isPlayingRef.current = true;
      requestRef.current = requestAnimationFrame(debouncedUpdateCurrentState);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setTranscriptDuration(audioRef.current.duration);
    }
  };

  // preprocess paragraphs with their words and speaker
  const preprocessTranscript = useCallback((transcript: CurrentTranscript) => {
    return transcript.paragraphs.map((paragraph) => ({
      ...paragraph,
      words: transcript.words.filter((word) => word.paragraph_id === paragraph.id),
      speaker: transcript.speakers.find((speaker) => speaker.id === paragraph.speaker_id) ?? {
        id: "unknown",
        name: "Unknown",
      },
    }));
  }, []);

  useEffect(() => {
    if (currentTranscript) {
      const preprocessed = preprocessTranscript(currentTranscript);
      setProcessedTranscript(preprocessed);
    }
  }, [currentTranscript, preprocessTranscript]);

  // update current state for currentTime, currentParagraph, currentWord, currentSpeaker
  const updateCurrentState = useCallback(() => {
    if (!isPlayingRef.current) return;

    if (processedTranscript) {
      const time = getCurrentTime(audioRef);
      setCurrentTime(time);

      // assign up-to-date paragraph to local variable
      const newCurrentParagraph: CurrentParagraph | null = getNewCurrentParagraph(
        currentParagraph,
        time,
        processedTranscript
      );

      // get current word and speaker
      const { updatedWord, updatedSpeaker } = getWordAndSpeaker(newCurrentParagraph, time);

      // update state variables
      setCurrentParagraph(newCurrentParagraph);
      setCurrentWord(updatedWord);
      setCurrentSpeaker(updatedSpeaker);

      if (isPlayingRef.current) {
        requestRef.current = requestAnimationFrame(debouncedUpdateCurrentState);
      }
    }
  }, [currentTime, processedTranscript, currentParagraph]);

  // Use lodash.debounce for updateCurrentState
  const debouncedUpdateCurrentState = useCallback(debounce(updateCurrentState, 30), [updateCurrentState]);

  // add listener to watch audioRef metadata
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata); // Listen for metadata loading
      //
      audioRef.current.addEventListener("play", play);
      audioRef.current.addEventListener("pause", pause);

      return () => {
        audioRef.current?.removeEventListener("loadedmetadata", handleLoadedMetadata);
        //
        audioRef.current?.removeEventListener("play", play);
        audioRef.current?.removeEventListener("pause", pause); // Cleanup
      };
    }
  }, [processedTranscript]);

  // add or remove animation frame depending when user changes isPlaying state
  useEffect(() => {
    if (isPlaying && requestRef.current === null) {
      requestRef.current = requestAnimationFrame(debouncedUpdateCurrentState);
    } else if (!isPlaying && requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  }, [isPlaying, debouncedUpdateCurrentState]);

  return (
    <PlayerContext.Provider
      value={{
        currentTime,
        isPlaying,
        currentParagraph,
        currentWord,
        currentSpeaker,
        play,
        pause,
        seek,
        transcriptDuration,
        audioRef,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayerContext must be used within a PlayerProvider");
  }
  return context;
};
