# LiveVibe 🎶

## Overview

LiveVibe is a dynamic web application that allows users to search for artists, discover upcoming concerts, and watch related music videos—all in one seamless experience. The app integrates multiple APIs to fetch artist details, event listings, and YouTube videos, providing a comprehensive platform for music lovers.

**Live Demo:** [LiveVibe App](#) _(https://smart79.github.io/LiveVibe/)_

## To experience LiveVibe:

Enter an artist’s name and click the “Artist” button to get twitter channel information.

You can also enter a song name and click the “Song Name” button to get information on that song and other similar songs.

Once the results table have populated click on the artist name or song of choice to see the youTube Video associated.

Click the Event (ticket) icon in the results section to get relevant concert and ticket information by entering your abbreviated state code. (ex: tx, or ca)

You may also click the X social media platform url link to the artist's page if available.

Enjoy.

---

## Project Structure

```
LiveVibe/
│── resources/
│   ├── javascript/
│   │   ├── logic.js
│   │   ├── firebase.js
│   │   ├── api-config.js
│   ├── images/
│   ├── CSS/
|       ├── normalize.css
|       ├── styles.css
│── index.html
│── README.md
│── .gitignore
```

---

## Installation

### 🔧 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/livevibe.git
   ```
2. **Navigate to the project folder**
   ```bash
   cd livevibe
   ```
3. **Open **``** in a browser**
   - Or use a local server like `Live Server` in VSCode for a better experience.

---

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript, jQuery
- **APIs:** YouTube Data API, Musixmatch API, Ticketmaster API
- **Database:** Firebase Realtime Database
- **UI Libraries:** Bootstrap, SweetAlert2

---

## Skills Demonstrated

✅ **JavaScript & DOM Manipulation** – Handles dynamic content updates and user interactions. ✅ **Asynchronous API Calls (AJAX & Fetch API)** – Integrates external data sources seamlessly. ✅ **Event Handling & UI Interactivity** – Smooth animations, search functionalities, and modals. ✅ **Firebase Realtime Database** – Stores and retrieves user search history. ✅ **Responsive Web Design** – Ensures a seamless experience across devices.

---

## Features & Functionality

### 🔍 Search for Artists & Songs

- Uses **Musixmatch API** to retrieve a list of artists or tracks based on user input.
- Populates a results table dynamically with clickable entries.

### 🎟️ Find Upcoming Events

- Fetches concert details via **Ticketmaster API**, including:
  - Venue Name
  - Event Date
  - Ticket Purchase Link
- Displays event information in a modal.

### 🎥 Watch Related Music Videos

- Uses the **YouTube Data API** to find and display official music videos.
- Videos autoplay within an embedded player when an artist or song is selected.

### 🔥 User Interaction & UX Enhancements

- **Dynamic UI Updates:** Smooth animations and real-time search results.
- **SweetAlert2 Modals:** Provides better popups for alerts and prompts.
- **State-Based Content Display:** Ensures only relevant sections are shown based on user actions.

---

## Algorithms & Technical Breakdown

### 🎵 YouTube Video Fetching

- The app fetches videos dynamically by constructing API calls to YouTube’s search endpoint.
- Retrieves the **most relevant video ID** and embeds it into the page using the YouTube IFrame API.
- Implements **delayed retries** if the API is not ready.

### 🎟️ Event Lookup

- **Search query** → Calls Ticketmaster API → Returns event list
- Parses JSON data to extract relevant details and renders results dynamically.

### 🔄 Firebase Integration

- Stores **search history** in Firebase for potential future enhancements.
- Retrieves and logs recent user interactions.

---

## Future Enhancements

🔹 **continuous play action** – after the song plays and ends it will play a like artist's music and display that artist 's concert and social media info.
🔹 **User Authentication** – Allow users to save favorite artists and events. 🔹 **Custom Playlists** – Create and save a playlist of YouTube videos.
🔹 **Improved Recommendation System** – Suggest similar artists and events. 🔹 **Dark Mode Support** – Enhance UI for better accessibility.

---

## Contributors

👤 **Stephen Martinez** _(Sole Developer)_

---

## Credits & Acknowledgments

This project was made possible using the following APIs and libraries:

- 🎵 **Musixmatch API** – For retrieving artist and song data.
- 🎟️ **Ticketmaster API** – For event and concert details.
- 📺 **YouTube Data API** – For fetching and displaying music videos.
- 🔥 **Firebase** – For storing user interactions.
- 🎨 **Bootstrap** – For responsive UI components.
- 📢 **SweetAlert2** – For enhanced popups and alerts.

---

## License

This project is licensed under the **MIT License**. Feel free to use and modify it!

---

## More Projects

Check out my GitHub for more projects like this: [**GitHub Profile**](https://github.com/smart79)

---

## Contact

For inquiries or collaboration, visit my portfolio: [**Portfolio Contact Page**](#) _(https://stephenmartinez.dev/contact.html)_
