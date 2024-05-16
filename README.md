# Verbit Karaoke App

## Instructions to Run the Project

1. **Clone the repository**:

   ```bash
   git clone https://github.com/RobPanneton/karaoke-app.git
   cd karaoke-app
   cd app
   ```

2. **Create a .env file in the app folder:**:

   ```bash
   touch .env
   ```

3. **Add the following line to the .env file:**:

   ```bash
   REACT_APP_TRANSCRIPT_API_URL=YOUR_API_URL_HERE
   ```

   Replace YOUR_API_URL_HERE with the URL provided in the submission email.

4. **Install depdencies**:

   ```bash
   npm install
   ```

5. **Start the app**:
   ```bash
   npm start
   ```

## Project Structure and Architecture

The project uses vanilla React instead of the Vite-react I have been exploring due to potential issues with audio tags. The structure is component-based, promoting reusability and maintainability.

## Components

- Player: Manages the audio playback and displays the captions.
- TranscriptList: Displays a list of available transcripts for selection.
- Loader: Shows a loading spinner while data is being fetched.

## Context

- PlayerContext: Manages the state and logic for audio playback, including play/pause functionality, seeking, and updating the current time, paragraph, word, and speaker.
- TranscriptContext: Manages the state and logic for fetching and handling transcripts.

## Technical Choices

- Vanilla React: Chosen for simplicity and reliability, avoiding potential issues with audio tags in Vite-react.
- Context API: Used for state management to keep the code clean and maintainable.
- Debounce: Utilized to optimize performance by limiting the frequency of updates during playback.
- SASS/SCSS: Used for styling to leverage features like variables, making the CSS more maintainable and scalable.

## Trade-offs and Future Improvements

### Trade-offs

- Error Handling: Currently minimal error handling. Need to handle errors coming from the backend more robustly.
- Performance at 2x Speed: Some paragraphs might be skipped. Consider removing the debounce function for 2x speed to ensure accuracy.
- Paragraph Loading: Decided to load the next paragraph slightly before it starts, similar to traditional caption services. This decision can be revisited based on user feedback.

### Future Improvements

- Console Warnings: If this were for production use, I would have spent more time clearing the console warnings as they came up. However, I prioritized completing the app functionality.
- Testing: More extensive testing to ensure no paragraphs are skipped and the captions are synchronized correctly.
- Styling and UI Enhancements: Further improvements to the UI/UX, including better error messages and user feedback.

By focusing on these areas, the app can be made more robust and user-friendly, ensuring a better overall experience.
