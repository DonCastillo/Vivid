import f7Dom from "dom7";
import { RandomItems, RandomColor, Shuffle, SetBackground } from "./util";
import Sortable from "sortablejs";
import "jquery-sortablejs";
import $ from "jquery";

let level = 1;
let score = 0;
let time = 10;
let itemCount = 3;
let playGame = true;
let referenceItems = []; // {item: '', order: ''}
let forSortingItems = [];
let sortedItems = [];
let isSolved = false; // if a given level is solved
let sortable;

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
        $('.level').text(level);
		referenceItems = GetItems(itemCount);
		forSortingItems = Shuffle([...referenceItems]);

		console.log("referenceItems: ", referenceItems);
		console.log("forSortingItems: ", forSortingItems);

		if (await ShowReferencePage()) {
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
	return new Promise(function (resolve, reject) {
		const grid = $("#reference-page > .grid");
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
		const grid = $("#sorting-page > .grid");
		HideAllPageContent();

		// show all the grids
		grid.html('');
		forSortingItems.forEach(function (item) {
			grid.append(CreateCard(item));
		});

		let timer;
		let counter = time;
		function RunTime() {
			$("#sorting-page #timer").html(counter);
			if (counter > 0) {
				// console.log('counter: ', counter)
				if (isSolved) {
					clearTimeout(timer);
					resolve(true);
				} else {
					timer = setTimeout(RunTime, 1000);
				}
			} else {
				console.log("done");
				clearTimeout(timer);
				resolve(false);
			}
			counter--;
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
				console.log("isMatch: ", CheckMatch());
				isSolved = CheckMatch();
			},
		});
	});
}

function CheckMatch() {
	return sortedItems.every(function (item, index) {
		return (
			item.item == referenceItems[index].item &&
			item.order == referenceItems[index].order
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
		time = 10;
	} else if (level <= 6) {
		itemCount = 4;
		time = 10;
	} else if (level <= 9) {
		itemCount = 5;
		time = 15;
	} else if (level <= 12) {
		itemCount = 6;
		time = 15;
	} else if (level <= 15) {
		itemCount = 7;
		time = 20;
	} else if (level <= 18) {
		itemCount = 8;
		time = 20;
	} else if (level <= 21) {
		itemCount = 9;
		time = 25;
	} else if (level <= 24) {
		itemCount = 10;
		time = 30;
	} else if (level <= 27) {
		itemCount = 12;
		time = 35;
	} else {
		itemCount = 15;
		time = 60;
	}
}
