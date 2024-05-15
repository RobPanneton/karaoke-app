import React from "react";
import { usePlayerContext } from "../../context/PlayerContext";
import { useTranscriptContext } from "../../context/TranscriptContext";
import { Word } from "../../types/transcriptTypes";

import styles from "./Player.module.scss";

export const Player: React.FC = () => {
  const {
    isPlaying,
    play,
    pause,
    currentParagraph,
    currentWord,
    currentSpeaker,
    seek,
    currentTime,
    transcriptDuration,
  } = usePlayerContext();

  const { currentTranscript } = useTranscriptContext();

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <div className={styles.playerContainer}>
      {currentTranscript ? (
        <>
          <div className={styles.playerControls}>
            <button onClick={handlePlayPause}>{isPlaying ? "Pause" : "Play"}</button>
            <input
              type='range'
              min='0'
              max={transcriptDuration}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
            />
          </div>
          <div className={styles.captionDisplay}>
            {currentParagraph && (
              <p className='paragraph'>
                {currentParagraph?.words.map((word: Word) => {
                  const key = word.time.toString() + "-" + word.duration.toString() + "-" + word.text;
                  return (
                    <span key={key} className={currentWord?.time === word.time ? styles.highlight : ""}>
                      {word.text}{" "}
                    </span>
                  );
                })}
              </p>
            )}
            {currentSpeaker && <p className={styles.speaker}>{currentSpeaker.name}</p>}
          </div>
        </>
      ) : (
        <div>pick a song to begin!</div>
      )}
    </div>
  );
};
