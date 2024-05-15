import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import debounce from "lodash.debounce";

import { Word, Speaker, CurrentTranscript } from "../types/transcriptTypes";
import { CurrentParagraph, PlayerContext as IPlayerContext } from "../types/playerTypes";
import { useTranscriptContext } from "./TranscriptContext";

const PlayerContext = createContext<IPlayerContext | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [transcriptDuration, setTranscriptDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
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
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
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

  // Preprocess paragraphs with their words
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

  const findCurrentWord = (words: Word[], time: number) => {
    // Binary search for efficiency
    let left = 0;
    let right = words.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (words[mid].time <= time && words[mid].time + words[mid].duration >= time) {
        return words[mid];
      } else if (words[mid].time < time) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    return null;
  };

  const updateCurrentState = useCallback(() => {
    if (processedTranscript && audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      setCurrentTime(currentTime);

      let newCurrentParagraph: CurrentParagraph | null = currentParagraph;
      // check if the current paragraph is still valid
      if (
        currentParagraph &&
        currentParagraph.time <= currentTime &&
        currentParagraph.time + currentParagraph.duration >= currentTime
      ) {
        // skip searching, no need for new paragraph
      } else {
        // find new current paragraph
        newCurrentParagraph =
          processedTranscript.find(
            (paragraph) => paragraph.time <= currentTime + 0.5 && paragraph.time + paragraph.duration >= currentTime
          ) || null;

        setCurrentParagraph(newCurrentParagraph);
      }

      console.log({ processedTranscript, newCurrentParagraph, currentTime });

      if (newCurrentParagraph) {
        const currentWord = findCurrentWord(newCurrentParagraph.words, currentTime);
        setCurrentWord(currentWord || null);
        setCurrentSpeaker(newCurrentParagraph.speaker);
      } else {
        setCurrentWord(null);
        setCurrentSpeaker(null);
      }

      if (isPlaying) {
        requestRef.current = requestAnimationFrame(debouncedUpdateCurrentState);
      }
    }
  }, [currentTime, processedTranscript, currentParagraph, isPlaying]);

  // Use lodash.debounce for updateCurrentState
  const debouncedUpdateCurrentState = useCallback(debounce(updateCurrentState, 30), [updateCurrentState]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata); // Listen for metadata loading
      return () => {
        audioRef.current?.removeEventListener("loadedmetadata", handleLoadedMetadata); // Cleanup
      };
    }
  }, []);

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
      }}
    >
      <audio ref={audioRef} src={currentTranscript?.audio_url} />
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
