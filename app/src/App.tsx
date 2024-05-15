import { HomePage } from "./pages/Homepage";
import { TranscriptProvider } from "./context/TranscriptContext";

import "./cssReset.scss";

export function App() {
  return (
    <div>
      <TranscriptProvider>
        <HomePage />
      </TranscriptProvider>
    </div>
  );
}
