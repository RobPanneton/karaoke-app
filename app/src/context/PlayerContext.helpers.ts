import { CurrentParagraph } from "../types/playerTypes";
import { CurrentTranscript, Paragraph, Speaker, Word } from "../types/transcriptTypes";

export const getNewCurrentParagraph = (
  currentParagraph: CurrentParagraph | null,
  currentTime: number,
  processedTranscript: CurrentParagraph[]
): CurrentParagraph | null => {
  // check if the current paragraph is still valid
  if (
    currentParagraph &&
    currentParagraph.time <= currentTime &&
    currentParagraph.time + currentParagraph.duration >= currentTime
  ) {
    return currentParagraph; // current paragraph is still valid, return it
  }

  // find updated current paragraph
  return (
    processedTranscript.find(
      (paragraph) => paragraph.time <= currentTime + 0.5 && paragraph.time + paragraph.duration >= currentTime
    ) || null
  );
};

// get and return updated word and speaker
export const getWordAndSpeaker = (
  newCurrentParagraph: CurrentParagraph | null,
  currentTime: number
): { updatedWord: Word | null; updatedSpeaker: Speaker | null } => {
  if (!newCurrentParagraph) return { updatedWord: null, updatedSpeaker: null };

  const updatedWord = getCurrentWord(newCurrentParagraph.words, currentTime);
  const updatedSpeaker = newCurrentParagraph.speaker;
  return { updatedWord: updatedWord || null, updatedSpeaker: updatedSpeaker };
};

// optimize finding current word with binary search algo
export const getCurrentWord = (words: Word[], time: number) => {
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

export const getCurrentTime = (audioRef: React.RefObject<HTMLAudioElement>): number => {
  if (audioRef?.current) return audioRef.current.currentTime;
  return 0;
};

export const mapParagraphs = (transcript: CurrentTranscript): CurrentParagraph[] => {
  return transcript.paragraphs.map((paragraph) => ({
    ...paragraph,
    words: transcript.words.filter((word) => word.paragraph_id === paragraph.id),
    speaker: transcript.speakers.find((speaker) => speaker.id === paragraph.speaker_id) ?? {
      id: "unknown",
      name: "Unknown",
    },
  }));
};

export const isParagraphStillCurrent = (currentTime: number, paragraph: Paragraph | null) => {
  if (!currentTime || !paragraph) return false;

  const paragraphEndTime = paragraph.time + paragraph.duration;
  return currentTime + 0.5 >= paragraph.time && currentTime <= paragraphEndTime;
};
