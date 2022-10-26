import items from "./icons";
import contrast from "contrast";
import $ from "jquery";

// https://bost.ocks.org/mike/shuffle/
export function Shuffle(array) {
	let m = array.length,
		t,
		i;
	while (m) {
		i = Math.floor(Math.random() * m--);

		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}
	return array;
}

// https://stackoverflow.com/questions/23095637/how-do-you-get-random-rgb-in-javascript
// export function RandomColor() {
//     let o = Math.round, r = Math.random, s = 255;
//     const bgColor = 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';

// }

function RandomBgColor() {
	let letters = "0123456789ABCDEF";
	let color = "#";
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function RandomFgColor(bgColor) {
	if(contrast(bgColor) === 'light')
		return "#000";
	else
		return "#fff";
}

export function RandomColor() {
	const bgColor = RandomBgColor();
	const fgColor = RandomFgColor(bgColor);
	return { bgColor: bgColor, fgColor: fgColor };
}

export function RandomItems(numOfItems) {
	let shuffledItems = Shuffle(items);
	return shuffledItems.slice(0, numOfItems);
}

export function SetBackground(gradientEl) {
	const bgColor1 = RandomBgColor();
	const bgColor2 = RandomBgColor();
	gradientEl.css('background', bgColor1);
	gradientEl.css('background', `linear-gradient(335deg, ${bgColor1}80 0%, ${bgColor2}80 100%)`);
}

export function SetLevel(displayEl, levelNum) {
	displayEl.text(levelNum)
}