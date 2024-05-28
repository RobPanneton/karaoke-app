import { Dispatch, SetStateAction } from "react";
import { CurrentTranscript, Paragraph, Speaker, Word } from "./transcriptTypes";

export type PlayerContext = {
  currentTime: number;
  isPlaying: boolean;
  currentParagraph: Paragraph | null;
  currentWord: Word | null;
  currentSpeaker: Speaker | null;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  audioRef: React.RefObject<HTMLAudioElement> | null;
};

export type CurrentParagraph = Paragraph & {
  speaker: Speaker;
};
