// =========================================================================================================================
// Import FirebaseDB
// =========================================================================================================================

import { firebaseDB } from "./firebase.js"; 
import { ref, push, get, child } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const testRef = ref(firebaseDB, "testData/");
get(testRef)
    .then((snapshot) => {
        if (snapshot.exists()) {
            console.log("✅ Firebase Data:", snapshot.val());
        } else {
            console.log("❌ No data available");
        }
    })
    .catch((error) => {
        console.error("❌ Error fetching Firebase data:", error);
    });
// =========================================================================================================================
// Global Variables
// =========================================================================================================================

// API Keys
import apiKeys from "./api-config.js";  // Import API keys

const musicApiKey = apiKeys.musixmatch;  // Use imported keys
const ticketMasterApiKey = apiKeys.ticketmaster;
const youtubeApiKey = apiKeys.youTube;

console.log("🎥 YouTube API Key:", youtubeApiKey);
//console.log("🎵 Musixmatch API Key:", musicApiKey);
//console.log("🎟️ Ticketmaster API Key:", ticketMasterApiKey);
//console.log("🔥 Firebase DB:", firebaseDB);


// =========================================================================================================================
// GET ZIP CODE
// =========================================================================================================================

$(document).on("click",".fas", async function() {
  
    const {value: text} = await Swal.fire({title: 'Enter Your State!',
        text: 'Enter your state code to see events near you!.\ne.g tx',
        imageUrl: "resources/images/5.jpg",
        imageWidth: 400,
        imageHeight: 200,
        imageAlt: 'Custom image',
        animation: false,
        input: 'text',
        inputPlaceholder: 'Type your message here...',
        showCancelButton: true
      })
      
      if (text) {
        if(isNaN(text)) {
            var state = text;
            ticketSearch($(this).attr("artist"), state);
        }
        else {
            Swal.fire({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
                footer: '<a href>Why do I have this issue?</a>'
              })
        }
      }

});

//purchase button new window
$("#purchase").on("click", function() {
    window.open($(this).attr("href"),"_blank");
});


// =========================================================================================================================
// API: MUSIXMATCH - FOR SEARCH BY SONG
// CREATE TABLE OF RESULTS
// requires a string of any song name
// returns an array of 5 objects of the results
// object contains: album name, artist name, and the song name
// =========================================================================================================================

function searchBySong(song) {
    $.ajax({
        data: {
            apikey: musicApiKey,
            q_track: song,
            page_size: 10,
            format:"jsonp",
            callback:"jsonp_callback"
        },
        url: "https://api.musixmatch.com/ws/1.1/track.search",
        method: "GET",
        dataType: "jsonp",
        jsonpCallback: 'jsonp_callback',
        contentType: 'application/json',

    }).then(function(response) {
        let result = [];
        let listArray = response.message.body.track_list;
        listArray.forEach(element => {
            let track = {
                albumName: element.track.album_name,
                artistName: element.track.artist_name,
                songName: element.track.track_name
            }
            result.push(track);
        });
        console.log(result);
        createTableSong(result, song);
      //  songDatabaseUpdate(result);
    });
}


// =========================================================================================================================
// API: MUSIXMATCH - FOR SEARCH BY ARTIST NAME
// CREATE TABLE OF RESULTS
// requires a string of an artist
// returns an array of 5 objects of the results
// object contains: album name, artist name, and the song name
// =========================================================================================================================

function searchByArtist(artist) {
    $.ajax({
        data: {
            apikey: musicApiKey,
            q_artist: artist,
            page_size: 10,
            format:"jsonp",
            callback:"jsonp_callback"
        },
        url: "https://api.musixmatch.com/ws/1.1/artist.search",
        method: "GET",
        dataType: "jsonp",
        jsonpCallback: 'jsonp_callback',
        contentType: 'application/json',

    }).then(function(response) {
        let result = [];
        let listArray = response.message.body.artist_list;
        listArray.forEach(element => {
            let track = {
                artistName: element.artist.artist_name,
                songName: "",
                albumName: "",
                twitterUrl: element.artist.artist_twitter_url
            }
            result.push(track);
            
        });
        createTableArtist(result, artist);
    });
}

$(this).parent('td').parent('tr').parent().children('tr.expanded').each(
    function(i)
    {
       $(this).remove();
    }
 );


// And here's the expand:

// get a handle on where we want to insert some rows
//var recurDetails = $(this).parent('td').parent('tr');

// grab the ID number from the first cell
//var eventID = $(this).parent('td').parent('tr').children('td.event-id').html();

// use an ajax call to get the rows to show   
/*$.get(
    '/manage/ajax/manage_event_recurring.php?event=' + eventID,
    function(ajaxhtml){
       recurDetails.after(ajaxhtml);
      // end throbber
      $this.parent('td').children('img.throbber').remove();
    }
 );*/


// =========================================================================================================================
// API: TICKETMASTER - SEARCH FOR EVENTS
// search for an event
// returns an array of event objects
// =========================================================================================================================

function ticketSearch(searchTerm, state) {
    $.ajax({
        type: "GET",
        url: "https://app.ticketmaster.com/discovery/v2/events.json",
        data: {
            apikey: ticketMasterApiKey,
            keyword: searchTerm,
            countryCode: "US",
            stateCode: state,
            size: 5,
            includeSpellcheck: "yes",
        },
        dataType: "json",
        success: function(response) {
            try {
                console.log("Ticketmaster API Response:", response);
                
                let result = [];

                // Check if _embedded exists to avoid breaking the loop
                if (response._embedded && response._embedded.events) {
                    let jsonArray = response._embedded.events;

                    jsonArray.forEach(element => {
                        let event = {
                            eventName: element.name,
                            date: element.dates.start.localDate || "Date Not Available",
                            status: element.dates.status.code || "Status Not Available",
                            venueName: element._embedded?.venues?.[0]?.name || "Venue Not Available",
                            address: element._embedded?.venues?.[0]?.address?.line1 || "Address Not Available",
                            city: element._embedded?.venues?.[0]?.city?.name || "City Not Available",
                            country: element._embedded?.venues?.[0]?.country?.name || "Country Not Available",
                            countryCode: element._embedded?.venues?.[0]?.country?.countryCode || "N/A",
                            eventUrl: element.url || "#",
                        };
                        result.push(event);
                    });

                    if (result.length > 0) {
                        populateModal(result);
                        $("#exampleModal").modal("show");
                        // 🎵 Call YouTube API to fetch related music videos
                        fetchYouTubeVideo(searchTerm);
                    } else {
                        throw new Error("No events found");
                    }
                } else {
                    throw new Error("No events found in API response");
                }
            } catch (exception) {
                console.error("Error processing API response:", exception);
                Swal.fire({
                    icon: "error",
                    title: "No Events Found",
                    text: "Try a different search term.",
                });
            }
        },
        error: function(xhr, status, error) {
            console.error("Ticketmaster API Error:", status, error);
            Swal.fire({
                icon: "error",
                title: "API Error",
                text: "The Ticketmaster API is unavailable. Try again later.",
            });
        }
    });
}
// ============================
// 🎵 YOUTUBE API: FETCH VIDEO
// ============================
function fetchYouTubeVideo(searchQuery) {
    
    const youtubeURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(searchQuery)}&key=${youtubeApiKey}`;

    fetch(youtubeURL)
        .then(response => response.json())
        .then(data => {
            if (data.items.length > 0) {
                const videoId = data.items[0].id.videoId;
                displayYouTubeVideo(videoId); // Send videoId to display function
            } else {
                console.log("No videos found");
            }
        })
        .catch(error => console.error("YouTube API Error:", error));
}



// =========================================================================================================================
// SEARCH BY ARTIST NAME: API CALL TO MUSIXMATCH
// CREATE TICKET MODAL
// =========================================================================================================================

$("#artistBtn").on("click", function(event) {
    event.preventDefault();
  
    // Slide Up to display results table
    $(".header").slideUp();
  
    // Trim spaces from user input
    var artist = $("#searchTerm").val().trim();

    searchByArtist(artist);
  
  });

//Ticket modal
function populateModal(resultList) {
    resultList.forEach(event => {
        $("#modalTital").text(event.eventName);

        $("#address").text(event.address);
        $("#city").text(event.city);
        $("#country").text(event.country);
        $("#date").text(event.date);
        $("#genre").text(event.genre);
        $("#status").text(event.status);
        $("#purchase").attr("href", event.eventUrl);
    });
}



// =========================================================================================================================
// SEARCH BY SONG NAME: API CALL TO MUSIXMATCH
// =========================================================================================================================

$("#songBtn").on("click", function(event) {
    event.preventDefault();
  
    // Slide Up to display results table
    //$(".header").slideUp();

    // Trim spaces from user input
    var song = $("#searchTerm").val().trim();
  
    searchBySong(song);
    // Clear input field
    $("#searchTerm").val("");
  
  });


  export function songDatabaseUpdate(objects) {
      
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


// =========================================================================================================================
// CREATE AND POPULATE HTML TABLE - FOR ARTIST SEARCH RESULTS
// =========================================================================================================================

function createTableArtist(result, artist) {
    
    var tableHeader = $("#tableId");

    $(tableHeader).html("<thead class='thead-light'>" +
        "<tr>" +
            "<th scope='col'>Result</th>" +
            "<th scope='col'>Artist</th>" +
            "<th scope='col'>Social</th>" +
            "<th scope='col' id = 'thAction' colspan='4'>Events</th>" +
        "</tr>" +
    "</thead>");

    result.forEach(function(element, index) {
        index++;

        var row = $("<tr>");

        var id = $("<td>").text(index);
        var artist = $("<td>").text(element.artistName);
        var twitterUrl = $("<td>").text(element.twitterUrl);

        var ticketBtn = $("<i class='fas fa-ticket-alt'></i>").attr("id", index);
        $(ticketBtn).attr("artist", element.artistName);

        $(row).append(id);  
        $(row).append(artist); 
        $(row).append(twitterUrl); 
        $(row).append(ticketBtn);

        $("#tableId").append(row);
        index++;
    });

    // Attach click event to Artist names
    $("td:nth-child(2)").on("click", function () {  // Selects the second column (Artist name)
        const artistName = $(this).text();
        fetchYouTubeVideo(artistName); // Fetch video for the artist
        slideDownAction(); // Hide header and show video
    });
    
    var ua = navigator.userAgent;
    localStorage.setItem("user agent", ua);
    
    var databaseSave = {
        searchValue: artist,
        ua: ua,
        record: result,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    }
    
    // Push results to Firebase
    firebaseDB.ref().push(databaseSave);
    };
    
    


// =========================================================================================================================
// CREATE AND POPULATE HTML TABLE - FOR SONG SEARCH RESULTS
// =========================================================================================================================

function createTableSong(result, song) {

    var tableHeader = $("#tableId");

    $(tableHeader).html("<thead class='thead-light'>" +
        "<tr>" +
            "<th scope='col'>Result</th>" +
            "<th scope='col'>Song Title</th>" +
            "<th scope='col'>Artist</th>" +
            "<th scope='col'>Album</th>" +
            "<th scope='col' id = 'thAction' colspan='4'>Events</th>" +
        "</tr>" +
    "</thead>");

    result.forEach(function(element, index) {
        index++;

        var row = $("<tr>");

        var id = $("<td>").text(index);
        var song = $("<td>").text(element.songName);
        var artist = $("<td>").text(element.artistName);
        var album = $("<td>").text(element.albumName);
        var twitterUrl = $("<td>").text(element.twitterUrl);

        var ticketBtn = $("<i class='fas fa-ticket-alt'></i>").attr("id", index);
        $(ticketBtn).attr("artist", element.artistName);

        $(row).append(id);  
        $(row).append(song); 
        $(row).append(artist); 
        $(row).append(album); 
        $(row).append(twitterUrl); 
        $(row).append(ticketBtn);

        $("#tableId").append(row);

    
    });

    // Attach click event to Song names
    $("td:nth-child(2)").on("click", function () {  // Selects the second column (Song title)
        const songName = $(this).text();
        fetchYouTubeVideo(songName); // Fetch video for the song
        slideDownAction(); // Hide header and show video
    });
    
    var ua = navigator.userAgent;
    localStorage.setItem("user agent", ua);
    
    var databaseSave = {
        searchValue: song,
        ua: ua,
        record: result,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    }
    
    // Push results to Firebase
    firebaseDB.ref().push(databaseSave);
    };
    
    // Back Button: Reloads the last search results
$(".backDiv").html("<button type='button' class='btn btn-secondary' id='backButton'>Back</button>");

$("#backButton").on("click", function () {
    console.log("🔄 Reloading last search results...");

    // Show the search form again
    $(".header").fadeIn("fast");

    // Hide the YouTube video
    $("#youtube-video").empty().hide();

    // Ensure the last search results remain
    $("#tableId").fadeIn("fast");

    // Scroll back to the table
    $("html, body").animate({
        scrollTop: $("#tableId").offset().top
    }, "slow");
});


// =========================================================================================================================
// SLIDE DOWN FUNCTION
// =========================================================================================================================

const slideDownAction = function () {
    console.log("🎥 Hiding search, displaying video...");

    // Hide only the search elements, NOT the entire header
    $(".welcome-msg, .logo, #searchTerm, #artistBtn, #songBtn").addClass("hidden");

    // Show the YouTube video container
    $("#youtube-container").css("display", "block").fadeIn("fast");

    // Show the back button
    $("#backButton").fadeIn("fast");
};



// ============================
// 🎥 DISPLAY YOUTUBE VIDEO
// ============================
function displayYouTubeVideo(videoId) {
    const videoContainer = document.getElementById("youtube-container");
    const videoFrame = document.getElementById("youtube-video");

    if (!videoContainer || !videoFrame) {
        console.error("YouTube video container not found!");
        return;
    }

    if (!videoId) {
        console.error("No valid video ID. Skipping...");
        return;
    }

    // Update the iframe source
    videoFrame.src = `https://www.youtube.com/embed/${videoId}`;

    // Show the YouTube container and ensure it's centered
    $(videoContainer).fadeIn("fast");

    // Move the table further down so it doesn’t overlap
    $(".table-responsive").css("margin-top", "600px");
}







