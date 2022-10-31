import f7Dom from "dom7";
import {
	RandomItems,
	RandomColor,
	Shuffle,
	SetBackground,
	SetLevel,
} from "./util";
import $ from "jquery";
import Sortable from "sortablejs";
import "jquery-sortablejs";


let level = 1;
let time = 10;
let itemCount = 3;
let playGame = true;
let referenceItems = []; // items to be referenced
let forSortingItems = []; // shuffled referenceItems
let sortedItems = []; // items sorted by the player
let isSolved = false; // if a given level is solved
let sortable;

let GAME_PAGE = '.game-page[data-name="look-and-arrange"]';

/** initialize on page refresh */
$(document).ready(async function (e) {
	if ($(GAME_PAGE).length > 0) {
		await Play();
	}
});

/** initialize on page navigation */
f7Dom(document).on("page:init", GAME_PAGE, async function (e) {
	await Play();
});

async function Play() {
	level = 1;
	playGame = true;

	while (playGame) {
		referenceItems = [];
		forSortingItems = [];
		sortedItems = [];
		isSolved = false;

		LevelConfig();
		SetBackground($(".gradient"));
		SetLevel($(".level"), level);
		$(GAME_PAGE).find('.itemCount').text(itemCount);
		$(GAME_PAGE).find('.timer').text(time);

		referenceItems = GetItems(itemCount);

		// making sure the items are really shuffled
		do {
			forSortingItems = Shuffle([...referenceItems]);
		} while (CheckMatch(referenceItems, forSortingItems));

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
					console.log("exiting game");
					playGame = false;
					break;
				} else {
					sortable.destroy();
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
}

async function ShowReferencePage() {
	const closeButton = $(GAME_PAGE).find(".navbar a");
	console.log("close button: ", closeButton);
	closeButton.attr("href", "/");

	return new Promise(function (resolve) {
		const referencePage = $(GAME_PAGE).find("#reference-page");
		const grid = referencePage.find(".grid");
		HideAllPageContent();

		// show reference items
		grid.html("");
		referenceItems.forEach(function (item) {
			grid.append(CreateCard(item));
		});
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

async function ShowSortingPage() {
	const closeButton = $(GAME_PAGE).find(".navbar a");
	closeButton.attr("href", "#");

	return new Promise(function (resolve) {
		const sortingPage = $(GAME_PAGE).find("#sorting-page");
		const grid = sortingPage.find(".grid");
		HideAllPageContent();

		// show items to be sorted
		grid.html("");
		forSortingItems.forEach(function (item) {
			grid.append(CreateCard(item));
		});

		const INTERVAL = 100;
		let timer;
		time = time * 1000;

		function RunTime() {
			let counter = Math.ceil(time / 1000);
			sortingPage.find(".timer").html(counter);
			console.log("counter: ", counter);

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
		sortingPage.show();

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
				console.log(
					"isMatch: ",
					CheckMatch(referenceItems, sortedItems)
				);
				isSolved = CheckMatch(referenceItems, sortedItems);
			},
		});

		closeButton.on("click", function (e) {
			$(this).off();
			clearTimeout(timer);
			resolve(false);
		});
	});
}


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
		const { bgColor, fgColor } = RandomColor();
		return { item: item, order: index, bgColor: bgColor, fgColor: fgColor };
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

function HideAllPageContent() {
	$(GAME_PAGE).find(".page-content").hide();
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
