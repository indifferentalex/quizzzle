/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var request = new XMLHttpRequest();

var randomYear = getRandomInt(2010, 2014);
var randomMonth = getRandomInt(1, 12);

request.open("GET", "https://api.dribbble.com/v1/shots?timeframe=month&date=" + randomYear.toString() + "-" + randomMonth.toString() + "-01&per_page=5&access_token=123", true);

request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    // Success!
    var data = JSON.parse(request.responseText);

    var dribbblerImage = document.getElementById("dribbbler-image");
    var dribbblerName = document.getElementById("dribbbler-name");
    var shot = document.getElementById("shot");
    var date = document.getElementById("date");

    var chosenShot = data[getRandomInt(0, 4)];

    dribbblerImage.setAttribute("src", chosenShot.user.avatar_url);
    dribbblerName.innerHTML = chosenShot.user.name;
    shot.setAttribute("src", chosenShot.images.normal);
    date.innerHTML = chosenShot.created_at;
  } else {
    // We reached our target server, but it returned an error
  }
};

request.onerror = function() {
  // There was a connection error of some sort
};

request.send();

window.onload = function() {
  var guesses = document.getElementsByClassName("guess");

  for(var i = 0; i < guesses.length; i++) {
    var guess = guesses[i];

    guess.onclick = function() {
    	var guessYear = parseInt(this.innerHTML);
    	var shotYear = parseInt(document.getElementById("date").innerHTML);
      
      if (guessYear == shotYear) {
      	alert("Correct!");
      } else {
      	alert("Wrong!");
      }
    }
  }
}