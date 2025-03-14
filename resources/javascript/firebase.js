// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onChildAdded, remove, update, serverTimestamp } from "firebase/database";
import config from "./firebase-config.js"; // Import Firebase credentials

// Initialize Firebase
const app = initializeApp(config);
const firebaseDB = getDatabase(app);

// Export Firebase database functions for easy use in logic.js
export { firebaseDB, ref, push, onChildAdded, remove, update, serverTimestamp };

// ==========
// Global Variables
// ==========

var searchBySong = [];
var searchByArtist = [];
var dbRecordCount = 0;
var resultNum;
var albumName; 
var social;
var dateAdded;
var music = []; // Store Firebase records for deletions

// Used for Firebase updates and deletes
var keyId;
var savedRow;
var deletedRow;
var searchedSong;
var searchedArtist;

// On-click button to push data to Firebase database
$(".btn.btn-default").on("click", function(event) {
  event.preventDefault();

  // Grabbing user input
  var searchBySong = $("#songName").val().trim();
  var searchByArtist = $("#artistName").val().trim();

  var resultsShow = { 
    song: searchBySong,
    artist: searchByArtist,
  };

  // Push search results to Firebase database
  push(ref(firebaseDB, "searches"), resultsShow);

  console.log(resultsShow);

  // Clear input box
  $("#search-bar").val("");
});

// Function to update song database
function songDatabaseUpdate(objects) {
  objects.forEach(object => {
    push(ref(firebaseDB, "songs"), {
      resultNum: object.resultNum,
      songName: object.songName,
      artistName: object.artistName,
      albumName: object.albumName,
      social: object.social,
      dateAdded: serverTimestamp()
    });
  });
}

// Listen for child added events to update `music[]`
onChildAdded(ref(firebaseDB, "songs"), (childSnapshot) => {
  let songData = {
    resultNum: childSnapshot.val().resultNum,
    songName: childSnapshot.val().songName,
    artistName: childSnapshot.val().artistName,
    albumName: childSnapshot.val().albumName,
    social: childSnapshot.val().social,
    keyId: childSnapshot.key
  };

  music.push(songData); // Store record in music[]
  console.log("New song added:", songData);
});

// Delete row function
function deleteRow(num) {
  var rowDeleted = num;
  console.log("rowDeleted:", rowDeleted);
  document.getElementById("tableId").deleteRow(rowDeleted);

  for (var i = 0; i < music.length; i++) {
    if (music[i].keyId === rowDeleted) {
      keyId = music[i].keyId;
      console.log("Found keyId:", keyId);
    }
  }

  if (keyId) {
    remove(ref(firebaseDB, "songs/" + keyId))
      .then(() => console.log("Row deleted successfully"))
      .catch(error => console.error("Error deleting row:", error));
  }
}

// Export deleteRow function
export { deleteRow };










