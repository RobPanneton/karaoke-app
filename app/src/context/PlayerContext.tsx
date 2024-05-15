import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import { Word, Paragraph, Speaker } from "../types/transcriptTypes";
import { PlayerContext as IPlayerContext } from "../types/playerTypes";
import { useTranscriptContext } from "./TranscriptContext";

const PlayerContext = createContext<IPlayerContext | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState<Paragraph | null>(
    null
  );
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

  useEffect(() => {
    console.log("triggered useEffect");
    if (currentTranscript) {
      // first, find current paragraph based on the current time
      const currentParagraph = currentTranscript.paragraphs.find(
        (paragraph) =>
          paragraph.time <= currentTime &&
          paragraph.time + paragraph.duration >= currentTime
      );

      // next, populate the current paragraph with it's assocaited words
      if (currentParagraph) {
        const wordsInParagraph = currentTranscript.words.filter(
          (word) => word.paragraph_id === currentParagraph.id
        );

        const populatedParagraph = {
          ...currentParagraph,
          words: wordsInParagraph,
        };

        // next, find current word
        const currentWord = wordsInParagraph.find(
          (word) =>
            word.time <= currentTime && word.time + word.duration >= currentTime
        );

        const currentSpeaker = currentTranscript.speakers.find(
          (speaker) => speaker.id === currentParagraph.speaker_id
        );

        setCurrentParagraph(populatedParagraph || null);
        setCurrentWord(currentWord || null);
        setCurrentSpeaker(currentSpeaker || null);

        console.log({ populatedParagraph, currentWord, currentSpeaker });
      } else {
        setCurrentParagraph(null);
        setCurrentWord(null);
        setCurrentSpeaker(null);
      }
    }
  }, [currentTime, currentTranscript]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      return () => {
        audioRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, [handleTimeUpdate, audioRef.current]);

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
