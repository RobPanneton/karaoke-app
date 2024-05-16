import React from "react";
import { useTranscriptContext } from "../../context/TranscriptContext";
import { TranscriptListItem } from "../../types/transcriptTypes";

import styles from "./TranscriptList.module.scss";

export const TranscriptList: React.FC = () => {
  const { transcriptList, userSelect, handleUserSelect } = useTranscriptContext();

  return (
    <div>
      {transcriptList && (
        <ul className={styles.listContainer}>
          {transcriptList.map((t: TranscriptListItem, index: number) => {
            return (
              <li key={`${index}-${t.id}-${t.name}`}>
                <button
                  type='button'
                  value={t.id.toString()}
                  onClick={handleUserSelect}
                  className={userSelect === t.id ? styles.active : ""}
                >
                  {t.name}
                </button>
              </li>
            );
          })}
          <li key='a-random'>
            <button type='button' value={"random"} onClick={handleUserSelect}>
              Surprise Me!
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};
