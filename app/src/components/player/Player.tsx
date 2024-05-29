import React, { Fragment } from "react";
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
                <audio ref={audioRef} controls muted src={currentTranscript.audio_url}></audio>
              </div>
              <span className={styles.title}>{currentTranscript.name}</span>
              <div className={styles.captionDisplay}>
                <div className={styles.paragraph}>
                  <span>
                    {currentSpeaker && <span className={styles.speaker}>{currentSpeaker?.name || "Unknown"} : </span>}
                    {currentParagraph && (
                      <span>
                        {currentParagraph?.words.map((word: Word, index: number) => {
                          const key = `${index}-${word.text}-${word.duration}-${word.time}`;
                          return (
                            <Fragment key={key}>
                              <span className={currentWord?.time === word.time ? styles.highlight : ""}>
                                {word.text}
                              </span>
                              {index !== currentParagraph?.words.length - 1 && <span> </span>}
                            </Fragment>
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
