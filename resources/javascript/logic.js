// =========================================================================================================================
// Import Firebase
// =========================================================================================================================

import { firebaseDB, ref, push, onChildAdded, remove, update, serverTimestamp } from "./firebase.js";
import apiKeys from "./api-config.js"; // Import API keys

// =========================================================================================================================
// Import Global Variables
// =========================================================================================================================

// API Keys
const musicApiKey = apiKeys.musixmatch;
const ticketMasterApiKey = apiKeys.ticketmaster;

// =========================================================================================================================
// GET ZIP CODE
// =========================================================================================================================

$(document).on("click", ".fas", async function () {
    const { value: text } = await Swal.fire({
        title: "Enter Your State!",
        text: "Enter your state code to see events near you! (e.g., TX)",
        imageUrl: "resources/images/5.jpg",
        imageWidth: 400,
        imageHeight: 200,
        imageAlt: "Custom image",
        animation: false,
        input: "text",
        inputPlaceholder: "Type your state code here...",
        showCancelButton: true,
    });

    if (text) {
        if (isNaN(text)) {
            let state = text.toUpperCase();
            ticketSearch($(this).attr("artist"), state);
        } else {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Invalid state code entered!",
                footer: "<a href>Why do I have this issue?</a>",
            });
        }
    }
});

// Purchase button new window
$("#purchase").on("click", function () {
    window.open($(this).attr("href"), "_blank");
});

// =========================================================================================================================
// API: MUSIXMATCH - SEARCH BY SONG NAME
// =========================================================================================================================

function searchBySong(song) {
    $.ajax({
        data: {
            apikey: musicApiKey,
            q_track: song,
            page_size: 10,
            format: "jsonp",
            callback: "jsonp_callback",
        },
        url: "https://api.musixmatch.com/ws/1.1/track.search",
        method: "GET",
        dataType: "jsonp",
        jsonpCallback: "jsonp_callback",
        contentType: "application/json",
    }).then(function (response) {
        let result = [];
        let listArray = response.message.body.track_list;
        listArray.forEach((element) => {
            let track = {
                albumName: element.track.album_name,
                artistName: element.track.artist_name,
                songName: element.track.track_name,
            };
            result.push(track);
        });
        console.log(result);
        createTableSong(result, song);
    });
}

// =========================================================================================================================
// API: MUSIXMATCH - SEARCH BY ARTIST NAME
// =========================================================================================================================

function searchByArtist(artist) {
    $.ajax({
        data: {
            apikey: musicApiKey,
            q_artist: artist,
            page_size: 10,
            format: "jsonp",
            callback: "jsonp_callback",
        },
        url: "https://api.musixmatch.com/ws/1.1/artist.search",
        method: "GET",
        dataType: "jsonp",
        jsonpCallback: "jsonp_callback",
        contentType: "application/json",
    }).then(function (response) {
        let result = [];
        let listArray = response.message.body.artist_list;
        listArray.forEach((element) => {
            let track = {
                artistName: element.artist.artist_name,
                songName: "",
                albumName: "",
                twitterUrl: element.artist.artist_twitter_url,
            };
            result.push(track);
        });
        createTableArtist(result, artist);
    });
}

// =========================================================================================================================
// API: TICKETMASTER - SEARCH FOR EVENTS
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
        success: function (response) {
            try {
                console.log(response);
                let result = [];
                let jsonArray = response._embedded.events;
                jsonArray.forEach((element) => {
                    let event = {
                        eventName: element.name,
                        date: element.dates.start.localDate,
                        status: element.dates.status.code,
                        venueName: element._embedded.venues[0].name,
                        address: element._embedded.venues[0].address.line1,
                        city: element._embedded.venues[0].city.name,
                        country: element._embedded.venues[0].country.name,
                        eventUrl: element.url,
                    };

                    result.push(event);
                });
                
                populateModal(result);
                $("#exampleModal").modal("show");

            } catch (exception) {
                console.error("No results found:", exception);
                Swal.fire({
                    icon: "error",
                    title: "No events found",
                });
            }
        },
    }).fail(function () {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong!",
        });
    });
}

// =========================================================================================================================
// CREATE "BUY TICKETS" BUTTON FOR EACH EVENT
// =========================================================================================================================

function createTicketButton(eventUrl) {
    const button = document.createElement("a");
    button.href = eventUrl;
    button.target = "_blank"; // Opens Ticketmaster in a new tab
    button.textContent = "Buy Tickets 🎟️";
    button.classList.add("btn", "btn-primary");
    return button;
}

// =========================================================================================================================
// UPDATE `populateModal` FUNCTION TO INCLUDE THE BUY BUTTON
// =========================================================================================================================

function populateModal(resultList) {
    $("#modalContent").empty(); // Clear old content

    resultList.forEach(event => {
        $("#modalTitle").text(event.eventName);
        $("#address").text(event.address);
        $("#city").text(event.city);
        $("#date").text(event.date);

        // Append Ticketmaster purchase link
        const buyButton = createTicketButton(event.eventUrl);
        $("#purchase").empty().append(buyButton); // Insert button inside modal
    });
}


// =========================================================================================================================
// DATABASE UPDATE FUNCTION
// =========================================================================================================================

function songDatabaseUpdate(objects) {
    objects.forEach((object) => {
        push(ref(firebaseDB, "songs"), {
            resultNum: object.resultNum,
            songName: object.songName,
            artistName: object.artistName,
            albumName: object.albumName,
            social: object.social,
            dateAdded: serverTimestamp(),
        });
    });
}

// =========================================================================================================================
// CREATE AND POPULATE TABLES
// =========================================================================================================================

function createTableArtist(result, artist) {
    $("#tableId").html(`
        <thead class='thead-light'>
            <tr>
                <th scope='col'>Result</th>
                <th scope='col'>Artist</th>
                <th scope='col'>Social</th>
                <th scope='col' id='thAction' colspan='4'>Events</th>
            </tr>
        </thead>
    `);

    result.forEach((element, index) => {
        let row = $(`
            <tr>
                <td>${index + 1}</td>
                <td>${element.artistName}</td>
                <td>${element.twitterUrl}</td>
                <td><i class='fas fa-ticket-alt' id='${index}' artist='${element.artistName}'></i></td>
            </tr>
        `);
        $("#tableId").append(row);
    });

    push(ref(firebaseDB, "searches"), {
        searchValue: artist,
        record: result,
        dateAdded: serverTimestamp(),
    });
}

function createTableSong(result, song) {
    $("#tableId").html(`
        <thead class='thead-light'>
            <tr>
                <th scope='col'>Result</th>
                <th scope='col'>Song Title</th>
                <th scope='col'>Artist</th>
                <th scope='col'>Album</th>
                <th scope='col' id='thAction' colspan='4'>Events</th>
            </tr>
        </thead>
    `);

    result.forEach((element, index) => {
        let row = $(`
            <tr>
                <td>${index + 1}</td>
                <td>${element.songName}</td>
                <td>${element.artistName}</td>
                <td>${element.albumName}</td>
                <td><i class='fas fa-ticket-alt' id='${index}' artist='${element.artistName}'></i></td>
            </tr>
        `);
        $("#tableId").append(row);
    });

    push(ref(firebaseDB, "searches"), {
        searchValue: song,
        record: result,
        dateAdded: serverTimestamp(),
    });
}

// =========================================================================================================================
// SLIDE DOWN FUNCTION
// =========================================================================================================================

function slideDownAction() {
    $(".header").slideDown();
}





