// Import Firebase SDKs (ensure these are included in index.html)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, remove, update, onChildAdded, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Initialize Firebase
const firebaseConfig = {

  apiKey: "AIzaSyD57sfDQp-DLbA4VU_9IvialIKuqJmcelE",

  authDomain: "livevibe.firebaseapp.com",

  databaseURL: "https://livevibe-default-rtdb.firebaseio.com/",

  projectId: "livevibe",

  storageBucket: "livevibe.firebasestorage.app",

  messagingSenderId: "496199824526",

  appId: "1:496199824526:web:e38f4d71454616563045df",

  measurementId: "G-5496LBF4MP"

};

const app = initializeApp(firebaseConfig);
const firebaseDB = getDatabase(app);

export { firebaseDB };

// ==========
// Globals (used for updates & pulls)
// ==========
export let searchBySong = [];
export let searchByArtist = [];
export let dbRecordCount = 0;
export let resultNum;
export let albumName;
export let social;
export let dateAdded;

// Used for Firebase updates and deletes
export let keyId;
export let savedRow;
export let deletedRow;
export let searchedSong;
export let searchedArtist;

// ===============================
// Push search data to Firebase
// ===============================

$(".btn.btn-default").on("click", function(event) {
  event.preventDefault();

  // Grabbing user input
  let songInput = $("#songName").val().trim();
  let artistInput = $("#artistName").val().trim();

  let resultsShow = { 
    song: songInput,
    artist: artistInput
  };

  console.log("Adding to Firebase:", resultsShow);

  // Firebase Reference
  const dbRef = ref(firebaseDB, "/"); 
  push(dbRef, resultsShow);

  // Clear input fields
  $("#search-bar").val("");
});

// ===============================
// Listen for New Data in Firebase
// ===============================

onChildAdded(ref(firebaseDB, "/"), function(snapshot) {
  let data = snapshot.val();
  if (data) {
    resultNum = data.resultNum;
    albumName = data.albumName || "Unknown Album";
    social = data.social || "No Social Link";

    keyId = snapshot.key;
    
    console.log("Firebase New Entry:", data);
  }
}, function(error) {
  console.error("Firebase error:", error.code);
});

// ===============================
// Function to Push Search Results
// ===============================
export function songDatabaseUpdate(objects) {
  const dbRef = ref(firebaseDB, "/");

  objects.forEach(object => {
    push(dbRef, {
      resultNum: object.resultNum,
      songName: object.songName,
      artistName: object.artistName,
      albumName: object.albumName || "Unknown Album",
      social: object.social || "No Social Link",
      dateAdded: serverTimestamp()  // Use Firebase Server Timestamp
    });
  });
}

// ===============================
// Delete Row from Firebase
// ===============================
export function deleteRow(num) {
  console.log("Deleting row:", num);

  if (!keyId) {
    console.warn("No keyId found for deletion!");
    return;
  }

  const rowDeleted = num;
  document.getElementById("tableId").deleteRow(num);

  for (let i = 0; i < dbRecordCount; i++) {
    if (music[i].record === rowDeleted) {
      keyId = music[i].keyId;
      console.log("Deleting Firebase Record:", keyId);
    }
  }

  //Firebase Remove
  remove(ref(firebaseDB, keyId));
}









