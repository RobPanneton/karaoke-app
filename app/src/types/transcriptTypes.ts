export type TranscriptContext = {
  transcriptList: TranscriptItemList | null;
  currentTranscript: CurrentTranscript | null;
  listError: boolean;
  transcriptError: boolean;
  handleUserSelect: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export type TranscriptListItem = {
  id: Number;
  name: String;
};

export type TranscriptItemList = TranscriptListItem[];

export type CurrentTranscript = {
  id: number;
  name: string;
  audio_url: string;
  comment: string;
  paragraphs: Paragraph[];
  words: Word[];
  speakers: Speaker[];
};

export type Paragraph = {
  id: string;
  time: number;
  duration: number;
  spearker_id: string;
};

export type Word = {
  time: number;
  duration: number;
  text: string;
  paragraph_id: string;
};

export type Speaker = {
  id: string;
  name: string;
};
