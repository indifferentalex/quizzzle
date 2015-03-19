/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var data = null;
var chosenShot = null;

function loadNextShot(initial) {
	var request = new XMLHttpRequest();

	var today = new Date();
	var mm = today.getMonth() + 1;
	var yyyy = today.getFullYear();

	var randomYear = getRandomInt(2009, 2015);
	var randomMonth = 1;

	if (randomYear == 2009) {
		randomMonth = getRandomInt(7, 12);
	} else if (randomYear == yyyy) {
		randomMonth = getRandomInt(1, mm);
	} else {
		randomMonth = getRandomInt(1, 12);
	}

	request.open("GET", "https://api.dribbble.com/v1/shots?timeframe=month&date=" + randomYear.toString() + "-" + randomMonth.toString() + "-01&per_page=10&access_token=ba7e3b7db945481aafc13fdf7d8e864a76b4bc361688249d597078c7c81f7434", true);

	request.onload = function() {
	  if (request.status >= 200 && request.status < 400) {
	    // Success!
	    data = JSON.parse(request.responseText);

	    var shot = document.getElementById("shot");
	    var date = document.getElementById("date");

	    chosenShot = data[getRandomInt(0, 4)];

	    if (chosenShot.images.hidpi) {
	    	shot.setAttribute("src", chosenShot.images.hidpi);
	    } else {
	    	shot.setAttribute("src", chosenShot.images.normal);
	    }

	    date.innerHTML = chosenShot.created_at;

	    if (initial) {
	    	// we want to set author right away instead of after flip back
	    	setAuthor();
	    }
	  } else {
	    // We reached our target server, but it returned an error
	  }
	};

	request.onerror = function() {
	  // There was a connection error of some sort
	};

	request.send();
}

function setAuthor() {
  var dribbblerImage = document.getElementById("dribbbler-image");
  var dribbblerName = document.getElementById("dribbbler-name");

  dribbblerImage.setAttribute("src", chosenShot.user.avatar_url);
  dribbblerName.innerHTML = chosenShot.user.name;
}

window.onload = function() {
	loadNextShot(true);

	/**
	 * Divide the guess selection slider into monthly segments.
	 */
	var today = new Date();
	var mm = today.getMonth() + 1;
	var yyyy = today.getFullYear();

	var monthlySegments = 6 + 12 * (yyyy - 2010) + mm;

	var guessSelection = document.getElementById("guess-selection");
	var guessSegmentWidth = Math.round(440 / monthlySegments * 100) / 100;

	mm = 7;
	yyyy = 2009;

	for (var i = 0; i < monthlySegments; i++) {
		guessSelection.innerHTML = guessSelection.innerHTML + '<div data-date="' + mm.toString() + '-' + yyyy.toString() + '" class="guess-segment" style="width: ' + guessSegmentWidth + 'px;"><div class="guess-tooltip" style="display: none;">' + yyyy.toString() + '</div></div>';

		mm++;

		if (mm > 12) {
			yyyy++;
			mm = 1;
		}
	}

  var guesses = document.getElementsByClassName("guess-segment");

  for(var i = 0; i < guesses.length; i++) {
    var guess = guesses[i];

    guess.onmouseenter = function() {
    	this.children[0].style.display = "";
    }

    guess.onmouseleave = function() {
    	this.children[0].style.display = "none";
    }

    guess.onclick = function() {
    	var guessDate = this.getAttribute("data-date");
    	var guessMonth = parseInt(guessDate.split("-")[0]);
    	var guessYear = parseInt(guessDate.split("-")[1]);

    	var shotYear = parseInt(document.getElementById("date").innerHTML);
      
      if (guessYear == shotYear) {

      } else {

      }

    	var flipContainer = document.getElementById("flip-container");

			if (flipContainer.classList) {
			  flipContainer.classList.add("flip");
			} else {
			  flipContainer.flip += ' ' + "flip";
			}

			loadNextShot(false);

			document.getElementById("countdown-text").innerHTML = "Next round starting in 5 seconds";

			var countdownTimer = setInterval(function() { countDown() }, 1000);
			var c = 1000;

			function countDown() {
				if (c < 0) {
					clearInterval(countdownTimer);

					if (flipContainer.classList) {
					  flipContainer.classList.remove("flip");
					} else {
					  flipContainer.flip = flipContainer.flip.replace(new RegExp('(^|\\b)' + "flip".split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
					}

					setTimeout(function() { setAuthor(); }, 1000);
				} else {
					document.getElementById("countdown-text").innerHTML = "Next round starting in " + c.toString() + " second" + (c != 1 ? "s" : "");
					c--;
				}
			}
    }
  }
}