import f7Dom from "dom7";
import { RandomItems, RandomColor, Shuffle, SetBackground, SetLevel } from "./util";
import Sortable from "sortablejs";
import "jquery-sortablejs";
import $ from "jquery";

let level = 1;
let time = 10;
let itemCount = 3;
let playGame = true;
let referenceItems = [];	// items to be referenced
let forSortingItems = [];	// shuffled referenceItems
let sortedItems = [];		// items sorted by the player
let isSolved = false; 		// if a given level is solved
let sortable;

const GAME_PAGE = $('[data-name="look-and-arrange"]');


$(document).ready(async function () {
	if ($(".game-page#look-and-arrange").length > 0) {
		console.log("game page for look and arrange");
		console.log("dom: ", f7Dom);
		Play();
	}
});

f7Dom(document).on(
	"page:init",
	'.page[data-name="look-and-arrange"]',
	function (e) {
		console.log("page initialized");
		Play();
	}
);


async function Play() {
	level = 1;
	playGame = true;

	while (playGame) {
        referenceItems = [];
        forSortingItems = [];
        sortedItems = [];
        isSolved = false;

		LevelConfig();
		SetBackground($('.gradient'));
		SetLevel($('.level'), level);

		referenceItems = GetItems(itemCount);

		// making sure the items are really shuffled
		do {
			forSortingItems = Shuffle([...referenceItems]);
		} while(CheckMatch(referenceItems, forSortingItems));


		console.log("referenceItems: ", referenceItems);
		console.log("forSortingItems: ", forSortingItems);

		if (await ShowReferencePage()) {
			// executes when user pressed "Let's Go" Button
			// continue playing
			console.log("continue playing");

            

			if (await ShowSortingPage()) {
				// success page
				console.log("success..");
				if (!(await ShowSucessPage())) {
                    sortable.destroy();
					console.log("exiting game");
                    playGame = false;
					break;
				} else {
                    sortable.destroy();
                    playGame = true;
                    level++;
                    continue;
                }
			} else {
				// fail page
				console.log("fail..");
                if (!(await ShowFailPage())) {
                    sortable.destroy();
                    console.log('exiting game');
                    playGame = false;
                    break;
                } else {
                    sortable.destroy();
                    playGame = true;
                    level = 1;
                    continue;
                }
			}
		}
	}
}


async function ShowReferencePage() {
	return new Promise(function (resolve) {
		const grid = $("#reference-page .grid");
		HideAllPageContent();
		grid.html('');
		referenceItems.forEach(function (item) {
			grid.append(CreateCard(item));
		});
		$(".game-page #reference-page").show();
		$("button#startButton").on("click", function (e) {
			resolve(true);
		});
	});
}

async function ShowSortingPage() {
	return new Promise(function (resolve, reject) {
		const grid = $("#sorting-page .grid");
		HideAllPageContent();

		// show all the grids
		grid.html('');
		forSortingItems.forEach(function (item) {
			grid.append(CreateCard(item));
		});

		const INTERVAL = 100;
		let timer;
		time = time * 1000;

		function RunTime() {
			let counter = Math.ceil(time / 1000);
			$("#sorting-page #timer").html(counter);
			console.log('counter: ', counter);


			if (counter > 0) {
				if (isSolved) {
					// level completed
					clearTimeout(timer);
					resolve(true);
				} else {
					// continue playing until end of time
					timer = setTimeout(RunTime, INTERVAL);
					time = time - INTERVAL;
				}
			} else {
				// game over
				clearTimeout(timer);
				resolve(false);
			}
		}

		RunTime();
		$(".game-page #sorting-page").show();

		console.log("parent: ", grid);
		sortable = new Sortable(grid.get(0), {
			onSort: function (e) {
				sortedItems = grid
					.children(".cell")
					.map(function (index, element) {
						return {
							item: $(this).attr("data-item"),
							order: index,
						};
					});
				sortedItems = [...sortedItems];
				console.log("referenceItems: ", referenceItems);
				console.log("sortedItems: ", sortedItems);
				console.log("isMatch: ", CheckMatch(referenceItems, sortedItems));
				isSolved = CheckMatch(referenceItems, sortedItems);
			},
		});
	});
}

/**
 * 
 * @param {array} arrayItems1 
 * @param {array} arrayItems2 
 * @returns true if 2 arrays are the same, otherwise false
 */
function CheckMatch(arrayItems1, arrayItems2) {
	return arrayItems1.every(function (item, index) {
		return (
			item.item == arrayItems2[index].item &&
			item.order == arrayItems2[index].order
		);
	});
}

function GetItems(itemCount) {
	const randomItems = RandomItems(itemCount);
	const orderedItems = randomItems.map(function (item, index) {
        const {bgColor, fgColor} = RandomColor();
		return { item: item, order: index, bgColor: bgColor, fgColor: fgColor};
	});
	return orderedItems;
}

function CreateCard(item) {
	return `
    <div class="cell flex-center" 
         data-order="${item.order}" 
         data-item="${item.item}" 
         style="background-color: ${item.bgColor}; color: ${item.fgColor}">
        <i class="fa-solid fa-${item.item}">
        </i>
    </div>`;
}

async function ShowSucessPage() {
	const successPage = $(".game-page #success-page");
	return new Promise(function (resolve) {
		HideAllPageContent();
		successPage.find(".level").text(level);
		successPage.show();
		successPage.find(".nextButton").on("click", () => resolve(true));
		successPage.find(".exitButton").on("click", () => resolve(false));
	});
}

function ShowFailPage() {
	const failPage = $(".game-page #fail-page");
	return new Promise(function (resolve) {
		HideAllPageContent();
		failPage.find(".level").text(level);
		failPage.show();
		failPage.find(".playAgainButton").on("click", () => resolve(true));
		failPage.find(".exitButton").on("click", () => resolve(false));
	});
}

function HideAllPageContent() {
	$(".game-page .page-content").hide();
}

function LevelConfig() {
	if (level <= 3) {
		itemCount = 3;
		time = 15;
	} else if (level <= 6) {
		itemCount = 4;
		time = 15;
	} else if (level <= 9) {
		itemCount = 5;
		time = 20;
	} else if (level <= 12) {
		itemCount = 6;
		time = 20;
	} else if (level <= 15) {
		itemCount = 7;
		time = 25;
	} else if (level <= 18) {
		itemCount = 8;
		time = 25;
	} else if (level <= 21) {
		itemCount = 9;
		time = 30;
	} else if (level <= 24) {
		itemCount = 10;
		time = 35;
	} else if (level <= 27) {
		itemCount = 12;
		time = 40;
	} else {
		itemCount = 15;
		time = 90;
	}
}
