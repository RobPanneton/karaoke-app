import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import debounce from "lodash.debounce";

import { Word, Speaker, CurrentTranscript } from "../types/transcriptTypes";
import { CurrentParagraph, PlayerContext as IPlayerContext } from "../types/playerTypes";
import { useTranscriptContext } from "./TranscriptContext";
import {
  getNewCurrentParagraph,
  getCurrentTime,
  getWordAndSpeaker,
  mapParagraphs,
  isParagraphStillCurrent,
  getCurrentWord,
} from "./PlayerContext.helpers";

const PlayerContext = createContext<IPlayerContext | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(isPlaying);
  const isSeekingRef = useRef<boolean>(false);
  const [processedTranscript, setProcessedTranscript] = useState<CurrentParagraph[] | null>(null);
  const [currentParagraph, setCurrentParagraph] = useState<CurrentParagraph | null>(null);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestRef = useRef<number | null>(null);

  const { currentTranscript } = useTranscriptContext();

  const resetPlayerState = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    setProcessedTranscript(null);
    setCurrentParagraph(null);
    setCurrentWord(null);
    setCurrentSpeaker(null);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  }, []);

  // preprocess paragraphs with their words and speaker
  const preprocessTranscript = useCallback((transcript: CurrentTranscript) => {
    return mapParagraphs(transcript);
  }, []);

  // update current state for currentTime, currentParagraph, currentWord, currentSpeaker
  const updateCurrentState = useCallback(() => {
    if (!isPlayingRef.current && !isSeekingRef.current) return;
    if (processedTranscript) {
      const time = getCurrentTime(audioRef);
      setCurrentTime(time);

      let newCurrentParagraph: CurrentParagraph | null;
      let updatedWord: Word | null;
      let updatedSpeaker: Speaker | null;

      if (isParagraphStillCurrent(time, currentParagraph)) {
        newCurrentParagraph = currentParagraph;
        updatedSpeaker = currentParagraph?.speaker ?? null;
        updatedWord = getCurrentWord(currentParagraph?.words ?? [], time);
      } else {
        newCurrentParagraph = getNewCurrentParagraph(currentParagraph, time, processedTranscript);
        ({ updatedWord, updatedSpeaker } = getWordAndSpeaker(newCurrentParagraph, time));
      }

      // update state variables
      setCurrentParagraph(newCurrentParagraph);
      setCurrentWord(updatedWord);
      setCurrentSpeaker(updatedSpeaker);
      isSeekingRef.current = false;

      if (isPlayingRef.current) {
        requestRef.current = requestAnimationFrame(debouncedUpdateCurrentState.current);
      }
    }
  }, [processedTranscript, currentParagraph]);

  // use lodash.debounce for updateCurrentState
  // assign as ref to fix scoping issue
  const debouncedUpdateCurrentState = useRef(debounce(updateCurrentState, 30));
  useEffect(() => {
    console.log("trig useEffect updateCurrentState changed");
    debouncedUpdateCurrentState.current = debounce(updateCurrentState, 30);
  }, [updateCurrentState]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      isPlayingRef.current = true;
      requestRef.current = requestAnimationFrame(debouncedUpdateCurrentState.current);
    }
  }, [debouncedUpdateCurrentState]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    }
  }, []);

  const handleSeeked = useCallback(() => {
    if (audioRef.current) {
      isSeekingRef.current = true;
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      updateCurrentState();
    }
  }, [updateCurrentState]);

  // set script data when user current transcript
  useEffect(() => {
    if (currentTranscript) {
      pause();
      resetPlayerState();
      const preprocessed = preprocessTranscript(currentTranscript);
      setProcessedTranscript(preprocessed);
    }
  }, [currentTranscript, preprocessTranscript, pause, resetPlayerState]);

  // add listener to watch audioRef metadata and play/pause
  useEffect(() => {
    if (audioRef.current) {
      const audioElement = audioRef.current;
      audioElement.addEventListener("play", play);
      audioElement.addEventListener("pause", pause);
      audioElement.addEventListener("seeked", handleSeeked);

      return () => {
        audioElement?.removeEventListener("play", play);
        audioElement?.removeEventListener("pause", pause);
        audioElement?.removeEventListener("seeked", handleSeeked);
      };
    }
  }, [processedTranscript, play, pause, handleSeeked]);

  // add or remove animation frame depending when user changes isPlaying state
  useEffect(() => {
    if (isPlaying && requestRef.current === null) {
      requestRef.current = requestAnimationFrame(debouncedUpdateCurrentState.current);
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
