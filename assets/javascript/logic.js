
// Global Variables
var trainName = "";
var trainDestination = "";
var trainTime = "";
var trainFrequency = "";
var nextArrival = "";
var minutesAway = "";

// jQuery Variables (Reference)
var elTrain = $("#train-name");
var elTrainDestination = $("#train-destination");

// Form validation for time using jQuery mask
var elTrainTime = $("#train-time").mask("00:00");
var elTimeFreq = $("#time-freq").mask("00");

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAhmgUsDd0lUsxUNQW4WUbAN4r5B-1_1v8",
    authDomain: "train-scheduler-b3733.firebaseapp.com",
    databaseURL: "https://train-scheduler-b3733.firebaseio.com",
    projectId: "train-scheduler-b3733",
    storageBucket: "train-scheduler-b3733.appspot.com",
    messagingSenderId: "49095919384"
  };

firebase.initializeApp(config);

// Assign the reference to the database to a variable named 'database'
var database = firebase.database();

database.ref("/trains").on("child_added", function(snapshot) {

    // Local variables to store to Firebase
    var trainDiff = 0;
    var trainRemainder = 0;
    var minutesTillArrival = "";
    var nextTrainTime = "";
    var frequency = snapshot.val().frequency;

    // Compute the difference in time from 'now' and the first train using UNIX timestamp, store in var and convert to minutes
    trainDiff = moment().diff(moment.unix(snapshot.val().time), "minutes");

    // Get the remaining time by using 'moderator' with the frequency & time difference, store in the variable trainRemainder
    trainRemainder = trainDiff % frequency;

    // Subtract remainder from the frequency, store in var minutesTillArrival
    minutesTillArrival = frequency - trainRemainder;

    // add minutesTillArrival to now, to find next train & convert to Standard Time Format
    nextTrainTime = moment().add(minutesTillArrival, "m").format("hh:mm A");

    // Append to table of trains, inside tbody, with a new row of the train data
    $("#table-data").append(
        "<tr><td>" + snapshot.val().name + "</td>" +
        "<td>" + snapshot.val().destination + "</td>" +
        "<td>" + frequency + "</td>" +
        "<td>" + minutesTillArrival + "</td>" +
        "<td>" + nextTrainTime + "  " + "<a><span class='glyphicon glyphicon-remove icon-hidden' aria-hidden='true'></span></a>" + "</td></tr>"
    );

    $("span").hide();

    // Hover view of delete button
    $("tr").hover(
        function() {
            $(this).find("span").show();
        },
        function() {
            $(this).find("span").hide();
        });

    // Remove Items
    $("#table-data").on("click", "tr span", function() {
        var trainRef = database.ref("/trains/");
        trainRef.remove();
        window.location.reload();
        })
    });

// function to call the button event, and store the values in the input form
var storeInputs = function(event) {
    // prevent from from reseting
    event.preventDefault();

    // get & store input values
    trainName = elTrain.val().trim();
    trainDestination = elTrainDestination.val().trim();
    trainTime = moment(elTrainTime.val().trim(), "HH:mm").subtract(1, "years").format("X");
    trainFrequency = elTimeFreq.val().trim();

    // add to firebase databse
    database.ref("/trains").push({
        name: trainName,
        destination: trainDestination,
        time: trainTime,
        frequency: trainFrequency,
        nextArrival: nextArrival,
        minutesAway: minutesAway,
        date_added: firebase.database.ServerValue.TIMESTAMP
    });

    // Alert saying train was added
    alert("Train successuflly added!");

    // Clear form after submit
    elTrain.val("");
    elTrainDestination.val("");
    elTrainTime.val("");
    elTimeFreq.val("");
};

// Calls the storeInputs function if submit button is clicked
$("#btn-add").on("click", function(event) {
    // If the form is empty
    if (elTrain.val().length === 0 || elTrainDestination.val().length === 0 || elTrainTime.val().length === 0 || elTimeFreq === 0) {
        alert("Please Fill All Required Fields");
    // If the form is filled out
    } else {
        storeInputs(event);
    }
});

// Calls the storeInputs function if the 'Enter' key is clicked (Extra functionality)
$('form').on("keypress", function(event) {
    if (event.which === 13) {
        // If the form is empty
        if (elTrain.val().length === 0 || elTrainDestination.val().length === 0 || elTrainTime.val().length === 0 || elTimeFreq === 0) {
            alert("Please Fill All Required Fields");
        // If the form is filled out
        } else {
            storeInputs(event);
        }
    }
});