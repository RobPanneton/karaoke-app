import React from "react";
import { useTranscriptContext } from "../../context/TranscriptContext";
import { TranscriptListItem } from "../../types/transcriptTypes";

import styles from "./TranscriptList.module.scss";

export const TranscriptList: React.FC = () => {
  const { transcriptList, handleUserSelect } = useTranscriptContext();

  return (
    <div>
      {transcriptList && (
        <ul className={styles.listContainer}>
          {transcriptList.map((t: TranscriptListItem) => {
            return (
              <li key={`${t.id}-${t.name}`}>
                <button
                  type='button'
                  value={t.id.toString()}
                  onClick={handleUserSelect}
                >
                  {t.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
