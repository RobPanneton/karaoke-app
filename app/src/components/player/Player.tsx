import React from "react";
import { usePlayerContext } from "../../context/PlayerContext";
import { useTranscriptContext } from "../../context/TranscriptContext";
import { Word } from "../../types/transcriptTypes";
import { Loader } from "../common/loader/Loader";

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

  const { currentTranscript, isLoading } = useTranscriptContext();

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <div className={styles.playerContainer}>
      {isLoading && <Loader />}
      {!isLoading && (
        <>
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
                <div className={styles.paragraph}>
                  <span>
                    {currentSpeaker && <span className={styles.speaker}>{currentSpeaker.name}</span>} :{" "}
                    {currentParagraph && (
                      <span>
                        {currentParagraph?.words.map((word: Word, index: number) => {
                          const key = `${index}-${word.text}-${word.duration}-${word.time}`;
                          return (
                            <span key={key} className={currentWord?.time === word.time ? styles.highlight : ""}>
                              {word.text}{" "}
                            </span>
                          );
                        })}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.cta}>
              <h2>Pick a file to get started!</h2>
            </div>
          )}
        </>
      )}
    </div>
  );
};
