// =========================================================================================================================
// Import Firebase
// =========================================================================================================================
// Ensure firebaseDB is available before using it
if (!window.firebaseDB) {
    console.error("Firebase database is not initialized!");
} else {
    const firebaseDB = window.firebaseDB;
    
    // Now you can use firebaseDB for your logic
    console.log("Firebase is ready:", firebaseDB);
}

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
var recurDetails = $(this).parent('td').parent('tr');

// grab the ID number from the first cell
var eventID = $(this).parent('td').parent('tr').children('td.event-id').html();

// use an ajax call to get the rows to show   
 $.get(
    '/manage/ajax/manage_event_recurring.php?event=' + eventID,
    function(ajaxhtml){
       recurDetails.after(ajaxhtml);
      // end throbber
      $this.parent('td').children('img.throbber').remove();
    }
 );


// =========================================================================================================================
// API: TICKETMASTER - SEARCH FOR EVENTS
// search for an event
// returns an array of event objects
// =========================================================================================================================

function ticketSearch(searchTerm, state) {
   
    $.ajax({
        type:"GET",
        url:"https://app.ticketmaster.com/discovery/v2/events.json",
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
                console.log(response);
                var result = [];
                let jsonArray = response._embedded.events;

                jsonArray.forEach(element => {
                    let event = {
                        eventName: element.name,
                        date: element.dates.start.localDate,
                        status: element.dates.status.code,
                        venueName: element._embedded.venues[0].name,
                        address: element._embedded.venues[0].address.line1,
                        city: element._embedded.venues[0].city.name,
                        country: element._embedded.venues[0].country.name,
                        countryCode: element._embedded.venues[0].country.countryCode,
                        eventUrl: element._embedded.venues[0].url
                    }
                    result.push(event);
                    populateModal(result);
                    $("#exampleModal").modal("show");

                });
            }catch(exception) {
                console.log(exception);
                result = [{}];
                console.log("no results");

                Swal.fire({
                    type: 'error',
                    title: 'No events found'
                  });
            }
        }
    }).fail(function() {
        Swal.fire({
            type: 'error',
            title: 'Oops...',
            text: 'Something went wrong!',
            footer: '<a href>Why do I have this issue?</a>'
          });
    });
}



// =========================================================================================================================
// SEARCH BY ARTIST NAME: API CALL TO MUSIXMATCH
// CREATE TICKET MODAL
// =========================================================================================================================

$("#artistBtn").on("click", function(event) {
    event.preventDefault();
  
    // Slide Up to display results table
    //$(".header").slideUp();
  
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
    var ua= navigator.userAgent;
    localStorage.setItem("user agent",ua);

    // Slide Down Button
    //$(".backDiv").html("<button type='button' class='btn btn-secondary' onclick='slideDownAction()'>Back</button>");


        var databaseSave = {
            searchValue: artist,
            ua: ua,
            record: result,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        }

        // push results to Firebase
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
  
    // Slide Down Button
    //$(".backDiv").html("<button type='button' class='btn btn-secondary' onclick='slideDownAction()'>Back</button>");


    var databaseSave = {
        searchValue: song,
        ua: ua,
        record: result,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    }
        // push results to Firebase
        firebaseDB.ref().push(databaseSave);
   
};


// =========================================================================================================================
// SLIDE DOWN FUNCTION
// =========================================================================================================================

slideDownAction = function () {
    $(".header").slideDown();
}




