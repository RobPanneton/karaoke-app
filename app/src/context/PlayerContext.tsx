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
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

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

  useEffect(() => {
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

    const updateCurrentState = () => {
      if (processedTranscript) {
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
              (paragraph) => paragraph.time <= currentTime && paragraph.time + paragraph.duration >= currentTime
            ) || null;

          setCurrentParagraph(newCurrentParagraph);
        }

        console.log({ processedTranscript, newCurrentParagraph });

        if (newCurrentParagraph) {
          const currentWord = findCurrentWord(newCurrentParagraph.words, currentTime);
          setCurrentWord(currentWord || null);
          setCurrentSpeaker(newCurrentParagraph.speaker);
        } else {
          setCurrentWord(null);
          setCurrentSpeaker(null);
        }
      }
    };

    const debouncedUpdate = debounce(updateCurrentState, 250);
    debouncedUpdate();

    return () => {
      debouncedUpdate.cancel();
    };
  }, [currentTime, processedTranscript]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata); // Listen for metadata loading
      return () => {
        audioRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current?.removeEventListener("loadedmetadata", handleLoadedMetadata); // Cleanup
      };
    }
  }, [handleTimeUpdate]);

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
