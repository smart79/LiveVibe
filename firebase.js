// Ensure firebaseConfig exists before initializing Firebase
if (!window.firebaseConfig) {
  console.error("Firebase configuration not found!");
} else {
  // Initialize Firebase
  const app = firebase.initializeApp(window.firebaseConfig);
  const firebaseDB = firebase.database();

  // Export Firebase database for use in other files
  window.firebaseDB = firebaseDB;
  console.log("Firebase initialized successfully!");
}


// ==========
// globals
// ==========

// used in firebase updates/pulls
var searchBySong = [];
var searchByArtist = [];
var dbRecordCount = 0;
var resultNum;
var albumName; 
var social;
var dateAdded;

// used for firebase updates and deletes
var keyId;
var savedRow;
var deletedRow;
var searchedSong;
var searchedArtist;

// on click button to push data to realtime firebase database
$(".btn btn-default").on("click", function(event) {
  event.preventDefault();

  // grabbing user input
  var searchBySong = $("#songName").val().trim();
  var searchByArtist = $("#artistName").val().trim();

  var resultsShow = { 
    song: searchBySong,
    artist: searchByArtist,
  };

  database.ref().push(resultsShow);

  console.log(searchBySong.song);
  console.log(searchbyArtist.artist);

// clearing text box
   $("#search-bar").val("");

  //  Push search results to Firebase database
    for(var i = 0; i < result.length; i++) {
        firebaseDB.ref().push({
            artistName: result[i].artistName,
            twitterUrl: result[i].songName,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });
    }


firebaseDB.ref().on("child_added", function(childSnapshot) {

  resultNum = childSnapshot.val().resultNum;
  songName = childSnapshot.val().songName;
  artistName = childSnapshot.val().artistName;
  albumName = childSnapshot.val().albumName;
  social = childSnapshot.val().social;
  var keyId = childSnapshot.key;
  
  console.log("keyId", keyId);
     
  // Error Handler
  }, function(errorObject) {
    console.log("firebase return error: " + errorObject.code);
});

   });

   function songDatabaseUpdate(objects) {
      
    objects.forEach(object => {
        firebaseDB.ref().push({
          resultNum: object.resultNum,   
          songName: object.songName,
          artistName: object.artistName,
          albumName: object.albumName,
          social: object.social,
          dateAdded: firebase.database.ServerValue.TIMESTAMP
        });
    })
  }


deleteRow = function (num) {
  var rowDeleted = num;
  
  console.log("rowDeleted:", rowDeleted);
  document.getElementById("tableId").deleteRow(num);


  for(var i = 0; i < dbRecordCount; i++) {

    if(music[i].record === rowDeleted) {
      keyId = music[i].keyId;

      console.log("rowDeleted", rowDeleted);
      console.log("music[i].record", music[i].record);
      console.log("keyId", keyId);
    }
  }

  // Push user input to firebase database
  firebaseDB.ref(keyId).remove();

}

firebaseDB.ref(keyId).update({

});










