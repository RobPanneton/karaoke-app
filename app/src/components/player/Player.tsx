import React from "react";
import { usePlayerContext } from "../../context/PlayerContext";
import { useTranscriptContext } from "../../context/TranscriptContext";
import { Word } from "../../types/transcriptTypes";
import { Loader } from "../common/loader/Loader";

import styles from "./Player.module.scss";

export const Player: React.FC = () => {
  const { currentParagraph, currentWord, currentSpeaker, audioRef } = usePlayerContext();

  const { currentTranscript, isLoading, playerContainerRef } = useTranscriptContext();

  return (
    <div className={styles.playerContainer} ref={playerContainerRef}>
      {isLoading && <Loader />}
      {!isLoading && (
        <>
          {currentTranscript ? (
            <>
              <div className={styles.playerControls}>
                <audio ref={audioRef} controls src={currentTranscript.audio_url}></audio>
              </div>
              <div className={styles.captionDisplay}>
                <div className={styles.paragraph}>
                  <span>
                    {currentSpeaker && <span className={styles.speaker}>{currentSpeaker?.name || "Unknown"} : </span>}
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
