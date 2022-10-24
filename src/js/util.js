import items from './icons';

// https://bost.ocks.org/mike/shuffle/
export function Shuffle(array) {
    let m = array.length, t, i;
    while (m) {
  
      i = Math.floor(Math.random() * m--);
  
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
    return array;
}

// https://stackoverflow.com/questions/23095637/how-do-you-get-random-rgb-in-javascript
export function RandomColor() {
    let o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
}

export function RandomItems(numOfItems) {
    let shuffledItems = Shuffle(items);
    return shuffledItems.slice(0, numOfItems);
}