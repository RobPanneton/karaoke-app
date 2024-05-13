import React from "react";
import { Heading } from "../components/common/heading/Heading";
import { Player } from "../components/player/Player";
import { TranscriptList } from "../components/transcripts/TranscriptList";

import styles from "./Homepage.module.scss";

export const HomePage: React.FC = () => {
  return (
    <div>
      <Heading />
      <Player />
      <TranscriptList />
    </div>
  );
};
