import React from "react";
import { Heading } from "../components/common/heading/Heading";
import { Player } from "../components/player/Player";
import { TranscriptList } from "../components/transcripts/TranscriptList";

import styles from "./Homepage.module.scss";
import { PlayerProvider } from "../context/PlayerContext";

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
