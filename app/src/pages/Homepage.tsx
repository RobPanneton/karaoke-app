import React from "react";
import { Heading } from "../components/heading/Heading";
import { Player } from "../components/player/Player";
import { TranscriptList } from "../components/transcripts/TranscriptList";
import { PlayerProvider } from "../context/PlayerContext";

import styles from "./Homepage.module.scss";

export const HomePage: React.FC = () => {
  return (
    <div className={styles.pageWrapper}>
      <Heading />
      <PlayerProvider>
        <Player />
      </PlayerProvider>
      <TranscriptList />
    </div>
  );
};
