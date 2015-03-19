var score = 0;
var roundsLeft = 20;

var months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var tierScore = [0, 128, 64, 32, 16];
var lastImage = null;
var usedPosts = [];

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

	    chosenShot = data[getRandomInt(0, 9)];

	    while (usedPosts.indexOf(chosenShot.id) != -1) {
	    	chosenShot = data[getRandomInt(0, 9)];
	    }

	    usedPosts.push(chosenShot.id);

	    alert(usedPosts);

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
  // var dribbblerBio = document.getElementById("dribbbler-bio");
  var dribbblerUrl = document.getElementById("dribbbler-url");

  var dribbblerLocation = document.getElementById("dribbbler-location");
  var dribbblerSite = document.getElementById("dribbbler-site");

  var dribbblerTinyImage = document.getElementById("tiny-shot");
  var dribbblerTinyImageUrl = document.getElementById("tiny-shot-url");
  var shotTitle = document.getElementById("shot-title");
  var shotCreation = document.getElementById("shot-creation");

  dribbblerImage.setAttribute("src", chosenShot.user.avatar_url);
  dribbblerUrl.href = chosenShot.user.html_url;
  dribbblerName.innerHTML = chosenShot.user.name;
  // dribbblerBio.innerHTML = chosenShot.user.bio;

  document.getElementById("dribbbler-spacing").style.display = "none";

  if (chosenShot.user.location) {
  	dribbblerLocation.style.display = "";
  	dribbblerLocation.innerHTML = chosenShot.user.location;
  	dribbblerLocation.href = "https://dribbble.com/designers?location=" + encodeURI(chosenShot.user.location);
  } else {
  	dribbblerLocation.style.display = "none";
  }

  if (chosenShot.user.links.web) {
  	dribbblerSite.style.display = "";
		dribbblerSite.innerHTML = chosenShot.user.links.web.replace(/.*?:\/\//g, "").replace(/www./, "").replace(/\/$/, "");
		dribbblerSite.href = chosenShot.user.links.web;
	} else {
		dribbblerSite.style.display = "none";
	}

	if (chosenShot.user.location && chosenShot.user.links.web) {
		document.getElementById("dribbbler-spacing").style.display = "";
	}

	dribbblerTinyImageUrl.href = chosenShot.html_url;
  dribbblerTinyImage.setAttribute("src", chosenShot.images.teaser);
  // shotTitle.innerHTML = chosenShot.title;

  var creationDate = new Date(Date.parse(chosenShot.created_at));

  shotCreation.innerHTML = "Was posted on " + creationDate.getDate().toString() + "/" + (creationDate.getMonth() + 1).toString() + "/" + creationDate.getFullYear().toString();
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
		guessSelection.innerHTML = guessSelection.innerHTML + '<div id="' + i.toString() + '" data-date="' + mm.toString() + '-' + yyyy.toString() + '" class="guess-segment ' + (yyyy % 2 == 0 ? "even-year" : "odd-year") + '" style="width: ' + guessSegmentWidth + 'px; z-index: ' + (i + 1).toString() + '"><div class="guess-tooltip" style="display: none;"><span>' + months[mm] + '</span><br/>' + yyyy.toString() + '</div></div>';

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
    	document.getElementById("guess-selection").style.paddingTop = "0px";

    	this.children[0].style.display = "";

    	for(var j = 0; j < guesses.length; j++) {
				if (guesses[j].classList) {
				  guesses[j].classList.remove("active");
				} else {
				  guesses[j].active = guesses[j].active.replace(new RegExp('(^|\\b)' + "active".split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
				}
    	}

    	// index of segment mouse is pointing to
    	j = parseInt(this.getAttribute("id"));

    	var from = null;
    	var to = null;

    	if (j - 6 > 0) {
    		from = j - 6;
    	} else {
    		from = 0;
    		to = 12; // + 12
    	}

    	if (from != 0) {
	    	if (j + 7 < guesses.length) {
	    		to = j + 7;
	    	} else {
	    		to = guesses.length - 1;
	    		from = to - 12;
	    	}
	    }

			for (j = from; j <= to; j++) {
				currentSegment = document.getElementById(j.toString());

				if (currentSegment.classList) {
				  currentSegment.classList.add("active");
				} else {
				  currentSegment.active += ' ' + "active";
				}				
			}
    }

    guess.onmouseleave = function() {
    	document.getElementById("guess-selection").style.paddingTop = "3px";

    	this.children[0].style.display = "none";

    	for(var j = 0; j < guesses.length; j++) {
				if (guesses[j].classList) {
				  guesses[j].classList.remove("active");
				} else {
				  guesses[j].active = guesses[j].active.replace(new RegExp('(^|\\b)' + "active".split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
				}
    	}
    }

    guess.onclick = function() {
    	userRoundsLeft = document.getElementById("rounds-left").children[1];
    	userRoundsLeft.innerHTML = (parseInt(userRoundsLeft.innerHTML) - 1).toString();

    	var roundsLeft = parseInt(userRoundsLeft.innerHTML);

    	guessSelection = document.getElementById("guess-selection");
    	guessSelection.style.pointerEvents = "none";

			if (guessSelection.classList) {
			  guessSelection.classList.add("animations-active");
			} else {
			  guessSelection.animationsActive += ' ' + "animations-active";
			}	

    	var guessDate = this.getAttribute("data-date");
    	var guessSegment = this.getAttribute("id");
    	var guessMonth = parseInt(guessDate.split("-")[0]);
    	var guessYear = parseInt(guessDate.split("-")[1]);

    	var shotYear = parseInt(document.getElementById("date").innerHTML.split("-")[0]);
    	var shotMonth = parseInt(document.getElementById("date").innerHTML.split("-")[1]);

    	var correctSegment = null;

    	var voteTier = null;

    	if (shotYear == 2009) {
    		correctSegment = shotMonth - 1; // segments start from 0
    	} else {
    		correctSegment = 6 + 12 * (shotYear - 2010) + shotMonth - 1;
    	}

    	// tier 1: 5 segments up and down
    	j = (correctSegment >= 5 ? correctSegment - 5 : 0);

    	while (j <= correctSegment + 5 && j < monthlySegments) {
    		if (j == guessSegment) {
    			voteTier = 1;
    		}

				currentSegment = document.getElementById(j.toString());

				if (currentSegment.classList) {
				  currentSegment.classList.add("tier-one");
				} else {
				  currentSegment.tierOne += ' ' + "tier-one";
				}	

    		j++;
    	}

    	// tier 2: 13 segments up and down
    	j = (correctSegment >= 13 ? correctSegment - 13 : 0);

    	while (j <= correctSegment + 13 && j < monthlySegments) {
    		if (j == guessSegment && voteTier == null) {
    			voteTier = 2;
    		}

				currentSegment = document.getElementById(j.toString());

				if (currentSegment.classList) {
				  currentSegment.classList.add("tier-two");
				} else {
				  currentSegment.tierTwo += ' ' + "tier-two";
				}	

    		j++;
    	}

    	// tier 3: 23 segments up and down
    	j = (correctSegment >= 23 ? correctSegment - 23 : 0);

    	while (j <= correctSegment + 23 && j < monthlySegments) {
    		if (j == guessSegment && voteTier == null) {
    			voteTier = 3;
    		}

				currentSegment = document.getElementById(j.toString());

				if (currentSegment.classList) {
				  currentSegment.classList.add("tier-three");
				} else {
				  currentSegment.tierThree += ' ' + "tier-three";
				}	

    		j++;
    	}

    	// tier 4: 35 segments up and down
    	j = (correctSegment >= 35 ? correctSegment - 35 : 0);

    	while (j <= correctSegment + 35 && j < monthlySegments) {
    		if (j == guessSegment && voteTier == null) {
    			voteTier = 4;
    		}

				currentSegment = document.getElementById(j.toString());

				if (currentSegment.classList) {
				  currentSegment.classList.add("tier-four");
				} else {
				  currentSegment.tierFour += ' ' + "tier-four";
				}	

    		j++;
    	}

    	if (voteTier != null) {
    		// load and animate the spectre
    		scoreSpectre = document.getElementById("score-spectre");
    		scoreSpectre.innerHTML = tierScore[voteTier].toString();
    		scoreSpectre.style.display = "";

    		function spookySpectre(c) {
    			if (c < 0.05) {
    				scoreSpectre.style.display = "none";
    				scoreSpectre.style.top = "20px";
    				scoreSpectre.opacity = 1;

    				return;
    			} else {
    				scoreSpectre.style.opacity = c;
    				scoreSpectre.style.top = (parseInt(getComputedStyle(scoreSpectre)["top"]) - c * 3).toString() + "px";

    				setTimeout(function() { spookySpectre(c - 0.025); }, 20);	
    			}
    		}

    		spookySpectre(1);

    		// the h3 with the actual numeric value is the third child
    		userScore = document.getElementById("score").children[2];
    		userScore.innerHTML = (parseInt(userScore.innerHTML) + tierScore[voteTier]).toString();

				banner = document.getElementById("bbbanner");

				tiers = ["", "one", "two", "three", "four"];

				if (banner.classList) {
				  banner.classList.add("tier-" + tiers[voteTier]);
				} else {
				  banner.tierOne += ' ' + "tier-" + tiers[voteTier];
				}

				setTimeout(function() {
					if (banner.classList) {
					  banner.classList.remove(("tier-" + tiers[voteTier]));
					} else {
					  banner.tierOne = banner.tierOne.replace(new RegExp('(^|\\b)' + ("tier-" + tiers[voteTier]).split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
					}
				}, 1000);	    		
    	}

    	var flipContainer = document.getElementById("flip-container");

			if (flipContainer.classList) {
			  flipContainer.classList.add("flip");
			} else {
			  flipContainer.flip += ' ' + "flip";
			}

			if (roundsLeft > 0) {
				loadNextShot(false);
			} else {
				document.getElementById("game-over-screen").style.display = "";
				document.getElementById("final-game-score").innerHTML = userScore.innerHTML;
				document.getElementById("twitter-share-button").setAttribute("data-text", "I scored " + userScore.innerHTML + " on Trendddy, a Dribbble quiz game.");

				window.twttr=(function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],t=window.twttr||{};if(d.getElementById(id))return;js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);t._e=[];t.ready=function(f){t._e.push(f);};return t;}(document,"script","twitter-wjs"));
			}

			if (roundsLeft > 0) {
				document.getElementById("countdown-text").innerHTML = "Next round starting in 5 seconds";
			} else {
				document.getElementById("countdown-text").innerHTML = "Game ending in 5 seconds";
			}

			var countdownTimer = setInterval(function() { countDown() }, 1000);
			var c = 4;

			function clearTieredSegment(c) {
				if (c >= guesses.length) {
					return;
				} else {
					if (guesses[c].classList) {
						guesses[c].classList.remove("tier-one");
						guesses[c].classList.remove("tier-two");
						guesses[c].classList.remove("tier-three");
					  guesses[c].classList.remove("tier-four");
					} else {
					  guesses[c].tierOne = guesses[j].tierOne.replace(new RegExp('(^|\\b)' + "tier-one".split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
					  guesses[c].tierTwo = guesses[j].tierTwo.replace(new RegExp('(^|\\b)' + "tier-two".split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
					  guesses[c].tierThree = guesses[j].tierThree.replace(new RegExp('(^|\\b)' + "tier-three".split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
					  guesses[c].tierFour = guesses[j].tierFour.replace(new RegExp('(^|\\b)' + "tier-four".split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
					}		

					setTimeout(function() { clearTieredSegment(c + 1); }, 20);			
				}
			}

			function countDown() {
				if (c < 0) {
					clearInterval(countdownTimer);

					if (flipContainer.classList) {
					  flipContainer.classList.remove("flip");
					} else {
					  flipContainer.flip = flipContainer.flip.replace(new RegExp('(^|\\b)' + "flip".split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
					}

					setTimeout(function() {
						if (roundsLeft > 0) {
				    	guessSelection = document.getElementById("guess-selection");
				    	guessSelection.style.pointerEvents = "";
				    }

						if (guessSelection.classList) {
						  guessSelection.classList.remove("animations-active");
						} else {
						  guessSelection.animationsActive = guessSelection.animationsActive.replace(new RegExp('(^|\\b)' + "animations-active".split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
						}
					}, 500);

		    // 	for(var j = 0; j < guesses.length; j++) {
						// if (guesses[j].classList) {
						//   guesses[j].classList.remove("tier-four");
						// } else {
						//   guesses[j].tierFour = guesses[j].tierFour.replace(new RegExp('(^|\\b)' + "tier-four".split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
						// }
		    // 	}

					setTimeout(function() { setAuthor(); }, 600);
				} else {
					if (c == 3) {
						// start early
						clearTieredSegment(0);
					}

					if (roundsLeft > 0) {
						document.getElementById("countdown-text").innerHTML = "Next round starting in " + c.toString() + " second" + (c != 1 ? "s" : "");
					} else {
						document.getElementById("countdown-text").innerHTML = "Game ending in " + c.toString() + " second" + (c != 1 ? "s" : "");
					}

					c--;
				}
			}
    }
  }
}