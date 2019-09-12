// Firebase Information  
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyA8q2rbKpbeMXY6Ni4Ex0XHFRmAlpA9CqY",
  authDomain: "train-app-ce663.firebaseapp.com",
  databaseURL: "https://train-app-ce663.firebaseio.com",
  projectId: "train-app-ce663",
  storageBucket: "",
  messagingSenderId: "118843225076",
  appId: "1:118843225076:web:b75313105ec19937a37fa1"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


let db = firebase.database();

// Input Fields
const trainName = document.querySelector('#train-name');
const trainDestination = document.querySelector('#train-destination');
const firstTrainTime = document.querySelector('#train-time');
const trainFrequency = document.querySelector('#train-frequency');
// End of Input Fields

// Button links
const submitBtn = document.querySelector('#submitBtn');
const clearBtn = document.querySelector('#clearBtn');
// End of Button Links

// =======================================================================
// Load the data for the user upon app startup
db.ref().once('value', function(snapshot) {
  var tableBody = $('#table-body');
  snapshot.forEach(function(childSnapshot) {
    var childKey = childSnapshot.key;
    var childData = childSnapshot.val();

    // varibales needed for DOM Manipulation
    var tr = $('<tr>');
    var tdTrainName = $('<td>');
    var tdTrainDestination = $('<td>');
    var tdTrainFrequency = $('<td>');

    // MomentJS Variables for DOM Manipulation
    var tdNextTrain = $('<td>');
    var tdMinutesRemaining = $('<td>');

    // Train Name Creation
    tdTrainName.attr('class', 'trainName');
    tdTrainName.text(childData.Train_Name);

    // Train Destination Creation
    tdTrainDestination.attr('class', 'trainDestination');
    tdTrainDestination.text(childData.Train_Destination);

    // Train Frequency Creation
    tdTrainFrequency.attr('class', 'trainFrequency');
    tdTrainFrequency.text(childData.Train_Frequency);

    // Applying the Time Calculation For The Next Arriving Train.
    tdNextTrain.attr('class', 'nextTrain');
    tdNextTrain.text(calculateNextTrainArrival(childData.Train_Frequency, childData.First_Arrival));

    // Applying the Time Calculation For The Minutes Left Until Next Train
    var timeRemaining = calculateRemainingTimeInMinutes(childData.Train_Frequency, childData.First_Arrival);
    tdMinutesRemaining.attr('class', 'minutesRemaining');
    tdMinutesRemaining.text(timeRemaining);
    // Appending Everything To A Table Row
    tr.append(tdTrainName);
    tr.append(tdTrainDestination);
    tr.append(tdTrainFrequency);
    tr.append(tdNextTrain);
    tr.append(tdMinutesRemaining);
    // Appending The Table Row To The Table Body. 
    tableBody.append(tr);
  });
});

// =========================================================================
// Button Clicks 

submitBtn.addEventListener('click', function(e) {
  dataAttributes = [];
  e.preventDefault();
  let data = {
    Train_Name: trainName.value,
    Train_Destination: trainDestination.value,
    First_Arrival: firstTrainTime.value,
    Train_Frequency: trainFrequency.value
  };
  db.ref().push(data);
  // var newTD = $('<td>').html(`${data.Train_Destination}`);
  // console.log(data);
  // console.log(newTD);

  db.ref().limitToLast(1).on('child_added', function(snapshot) {
    var data = snapshot.val();
    // console.log(data);
    // console.log(data.Train_Name);

    // Setting all the local variables
    var tableBody = $('#table-body');
    var tr = $('<tr>');
    var tdTrainName = $('<td>');
    var tdTrainDestination = $('<td>');
    var tdTrainFrequency = $('<td>');

     // MomentJS Variables for DOM Manipulation
     var tdNextTrain = $('<td>');
     var tdMinutesRemaining = $('<td>');

    // Creating the first <td> and specifying the appropriate things. (The class is just for my visuals to know everything is working. It does nothing. )
    tdTrainName.attr('class', 'trainName');
    tdTrainName.text(data.Train_Name);

    // Setting the Train Destination TD
    tdTrainDestination.attr('class', 'trainDestination');
    tdTrainDestination.text(data.Train_Destination);

    // Setting the Train Frequency TD
    tdTrainFrequency.attr('class', 'trainFrequency');
    tdTrainFrequency.text(data.Train_Frequency);

     // Applying the Time Calculation For The Next Arriving Train.
     tdNextTrain.attr('class', 'nextTrain');
     tdNextTrain.text(calculateNextTrainArrival(data.Train_Frequency, data.First_Arrival));

     // Applying the Time Calculation For The Minutes Left Until Next Train
    var timeRemaining = calculateRemainingTimeInMinutes(data.Train_Frequency, data.First_Arrival);
    tdMinutesRemaining.attr('class', 'minutesRemaining');
    tdMinutesRemaining.text(timeRemaining);
    
    // Appending All of the TD's from up top in order. 
    tr.append(tdTrainName);
    tr.append(tdTrainDestination);
    tr.append(tdTrainFrequency);
    tr.append(tdNextTrain);
    tr.append(tdMinutesRemaining);

    // Finally appending the TR tag to the body to make sure its visible. 
    tableBody.append(tr);
  })
});

clearBtn.addEventListener('click', function(e) {
  e.preventDefault();
  clearInputFields();
  console.log('Clear Button Pressed');
})

// =====================================================================
// Functions
function clearInputFields() {
  trainName.value = '';
  trainDestination.value = '';
  firstTrainTime.value = '';
  trainFrequency.value = '';
};

function calculateNextTrainArrival(trainFrequency, InitialTrainTime) {
  // How often the train is coming to the station
  var tFrequency = parseInt(trainFrequency);
  // At what time the first train of the day is supposed be at the station.
  var firstTime = InitialTrainTime;
  // Reformatting the firstTime Varibale to the proper format.  
  var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, 'years');
  //console.log(`First Time After Being Reformated: ${firstTimeConverted}`);
  // Current Time 
  var currentTime = moment().format('HH:mm');
  //console.log(`The Current Time: ${currentTime}`);
  // Calculate the difference in time. In Minutes
  var diffTime = moment().diff(moment(firstTimeConverted, 'minutes'));
  //console.log(`Difference Between First Time and Current: ${diffTime}`);
  // Calculating the remainder.
  var tRemainder = diffTime % tFrequency;
  //console.log(`Remainder: ${tRemainder}`);
  // Calculating the Minutes Til Train 
  var tMinutesTilTrain = tFrequency - tRemainder;
  //console.log(`Minutes Til Next Train: ${tMinutesTilTrain}`);
  // Setting the Next Train Time
  var nextTrain = moment().add(tMinutesTilTrain, 'minutes');
  //console.log(`Next Train: ${moment(nextTrain).format('hh:mm')}`);
  var formattedNextTrain = moment(nextTrain).format('hh:mm')

  return formattedNextTrain;
}

//calculateNextTrainArrival(30, '10:00');

function calculateRemainingTimeInMinutes(trainFrequency, InitialTrainTime) {
  // How often the train is coming to the station
  var tFrequency = parseInt(trainFrequency);
  // At what time the first train of the day is supposed be at the station.
  var firstTime = InitialTrainTime;
  // Reformatting the firstTime Varibale to the proper format.  
  var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, 'years');
  //console.log(`First Time After Being Reformated: ${firstTimeConverted}`);
  // Current Time 
  var currentTime = moment().format('HH:mm');
  //console.log(`The Current Time: ${currentTime}`);
  // Calculate the difference in time. In Minutes
  var diffTime = moment().diff(moment(firstTimeConverted, 'minutes'));
  //console.log(`Difference Between First Time and Current: ${diffTime}`);
  // Calculating the remainder.
  var tRemainder = diffTime % tFrequency;
  //console.log(`Remainder: ${tRemainder}`);
  // Calculating the Minutes Til Train 
  var tMinutesTilTrain = tFrequency - tRemainder;
  //console.log(`Minutes Til Next Train: ${tMinutesTilTrain}`);
  // Setting the Next Train Time
  return tMinutesTilTrain;
  // var nextTrain = moment().add(tMinutesTilTrain, 'minutes');
  // //console.log(`Next Train: ${moment(nextTrain).format('hh:mm')}`);
  // var formattedNextTrain = moment(nextTrain).format('hh:mm');


  // //console.log(typeof tMinutesTilTrain);
  // return tMinutesTilTrain;
}

calculateRemainingTimeInMinutes(30, '10:00');

// =====================================================================

