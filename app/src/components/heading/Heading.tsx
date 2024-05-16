import React from "react";

import styles from "./Heading.module.scss";

export const Heading: React.FC = () => {
  return (
    <div className={styles.heading}>
      <h1>Caption App</h1>
    </div>
  );
};
