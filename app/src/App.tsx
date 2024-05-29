import { HomePage } from "./pages/Homepage";
import { TranscriptProvider } from "./context/TranscriptContext";

import "./cssReset.scss";

export const App = () => {
  return (
    <TranscriptProvider>
      <HomePage />
    </TranscriptProvider>
  );
};
