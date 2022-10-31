import f7Dom from "dom7";
import {
	RandomItems,
	RandomColor,
	Shuffle,
	SetBackground,
	SetLevel,
} from "./util";
import "flip/dist/jquery.flip";

let level = 1;
let time = 15;
let itemCount = 4;
let cards = [];
let isSolved = false;
let playGame = true;
let cardsOpened = [];



let GAME_PAGE = '.game-page[data-name="flip-and-match"]';

/** initialize on page refresh */
$(document).ready(async function (e) {
	if (jQuery(GAME_PAGE).length > 0) {
		Play();
	}
});

/** initialize on page navigation */
f7Dom(document).on("page:init", GAME_PAGE, function (e) {
	Play();
});


async function Play() {
    level = 1;
    playGame = true;

    while(playGame) {
        cards = [];
        cardsOpened = [];
        isSolved = false;
        LevelConfig();
        SetBackground($(".gradient"));
        SetLevel($(".level"), level);

        cards = GetItems(itemCount);
        console.log('cards: ', cards);

        if(await ShowReferencePage()) {
            // executes when user pressed "Let's Go" Button
            console.log("continue playing ...");

            if(await ShowMatchingPage()) {
                // success page
                console.log("success...");
                if (!(await ShowSucessPage())) {
                    console.log('exiting the game');
                    playGame = false;
                    break;
                } else {
                    playGame = true;
                    level++;
                    continue;
                }
            } else {
                // fail page
                console.log("fail...");
                if (!(await ShowFailPage())) {
					console.log("exiting game");
					playGame = false;
					break;
				} else {
					playGame = true;
					level = 1;
					continue;
				}
            }
        } else {
            // close reference page
            playGame = false;
            level = 1;
            break;
        }
    }
    console.log('playing flip and match');
    // console.log('game page: ', $(GAME_PAGE))
}


async function ShowReferencePage() {
	const closeButton = $(GAME_PAGE).find(".navbar a");
	console.log("close button: ", closeButton);
	closeButton.attr("href", "/");

	return new Promise(function (resolve) {
		const referencePage = $(GAME_PAGE).find("#reference-page");
		HideAllPageContent();
		referencePage.show();
		referencePage.find("#startButton").on("click", function (e) {
			resolve(true);
		});
		closeButton.on("click", function (e) {
			$(this).off();
			resolve(false);
		});
	});
}

async function ShowMatchingPage() {
    const closeButton = $(GAME_PAGE).find(".navbar a");
    closeButton.attr("href", "#");

    return new Promise(function (resolve) {
        const matchingPage = $(GAME_PAGE).find("#matching-page");
        const grid = matchingPage.find(".grid");
        HideAllPageContent();

        // show cards to be opened
        grid.html("");
        cards.forEach(function (item) {
            grid.append(CreateCard(item));
        });

        const INTERVAL = 100;
        let timer;
        time = time * 1000;

        function RunTime() {
			let counter = Math.ceil(time / 1000);
			matchingPage.find("#timer").html(counter);
			// console.log("counter: ", counter);

			if (counter > 0) {
				if (isSolved) {
					// level completed
					clearTimeout(timer);
					resolve(true);
				} else {
					// continue playing until end of time
                    console.log('isSolved: ', isSolved);
					timer = setTimeout(RunTime, INTERVAL);
					time = time - INTERVAL;
				}
			} else {
				// game over
				clearTimeout(timer);
				resolve(false);
			}
		}

        let cell = grid.children('.cell');
        cell.on('click', function(e) {
            const card = $(this);

            if(card.hasClass('closed')) {
                
                if(cardsOpened.length <= 2) {
                    cardsOpened = [...cardsOpened, card.attr('data-item') ];
                    card.removeClass('closed').addClass('open');
                    console.log(cardsOpened);
                } 
                
                if(cardsOpened.length == 2) {
                    let timerCloseAll = setTimeout(function(e) {

                        // check if the 2 opened cards match
                        if(cardsOpened[0] == cardsOpened[1]) {
                            // if match, remove card
                            grid.find(`[data-item=${cardsOpened[0]}]`).remove();
                            cell = grid.children('.cell');
                        }

                        console.log('cell: ', cell)
                        // check if all cards have been removed
                        if (cell.length > 0) {
                            cell.removeClass('open').addClass('closed');
                            isSolved = false;
                        } else {
                            isSolved = true;   
                        }
                        
                        cardsOpened = [];
                        clearTimeout(timerCloseAll);
                    }, 500);
                }       
            }
        });
        
        

        RunTime();
        matchingPage.show();

        closeButton.on("click", function (e) {
			$(this).off();
			clearTimeout(timer);
			resolve(false);
		});
    });
}



async function ShowSucessPage() {
	const successPage = $(GAME_PAGE).find("#success-page");
	const closeButton = $(GAME_PAGE).find(".navbar a");
	closeButton.attr('href', '/');
	
	return new Promise(function (resolve) {
		HideAllPageContent();
		successPage.find(".level").text(level);
		successPage.show();
		successPage.find(".nextButton").on("click", () => resolve(true));
		successPage.find(".exitButton").on("click", () => resolve(false));
		closeButton.on('click', () => {
			$(this).off();
			resolve(false);
		});
	});
}


function ShowFailPage() {
	const failPage = $(GAME_PAGE).find("#fail-page");
	const closeButton = $(GAME_PAGE).find(".navbar a");
	closeButton.attr('href', '/');
	
	return new Promise(function (resolve) {
		HideAllPageContent();
		failPage.find(".level").text(level);
		failPage.show();
		failPage.find(".playAgainButton").on("click", () => resolve(true));
		failPage.find(".exitButton").on("click", () => resolve(false));
		closeButton.on('click', () => {
			$(this).off();
			resolve(false);
		});
	});
}


function GetItems(itemCount) {
    let randomItems = RandomItems(Math.round(itemCount / 2));
    randomItems = randomItems.map(function (item, index) {
        const { bgColor, fgColor } = RandomColor();
        return { item: item, bgColor: bgColor, fgColor: fgColor };
    });
    return Shuffle([...randomItems, ...randomItems]);
}

function CreateCard(item) {
    return `
    <div class="cell flex-center closed" 
         data-item="${item.item}" 
         style="background-color: ${item.bgColor}; color: ${item.fgColor}">
         <div class="cover flex-center">
            <i class="fa-solid fa-question"></i>
         </div>
        <i class="fa-solid fa-${item.item}"></i>
    </div>`;
}

function HideAllPageContent() {
	$(GAME_PAGE).find(".page-content").hide();
}

function LevelConfig() {
	if (level <= 3) {
		itemCount = 4;
		time = 1500;
	} else if (level <= 6) {
		itemCount = 6;
		time = 15;
	} else if (level <= 9) {
		itemCount = 8;
		time = 20;
	} else if (level <= 12) {
		itemCount = 10;
		time = 20;
	} else if (level <= 15) {
		itemCount = 12;
		time = 25;
	} else if (level <= 18) {
		itemCount = 14;
		time = 25;
	} else if (level <= 21) {
		itemCount = 16;
		time = 30;
	} else if (level <= 24) {
		itemCount = 18;
		time = 35;
	} else if (level <= 27) {
		itemCount = 20;
		time = 40;
	} else {
		itemCount = 15;
		time = 90;
	}
}