import f7Dom from 'dom7';
import { RandomItems, RandomColor, Shuffle } from './util';
import Sortable from 'sortablejs'
import 'jquery-sortablejs';
import $ from 'jquery';
// const $ = jQuery;

let level = 10;
let score = 0;
let time = 10;
let itemCount = 3;
let playGame = true;
let referenceItems = []; // {item: '', order: ''}
let forSortingItems = [];
let sortedItems = [];
let isSolved = false; // if a given level is solved


$(document).ready(async function() {
    

    if($('.game-page#look-and-arrange').length > 0) {
        console.log('game page for look and arrange');
        console.log('dom: ', f7Dom);
        Play();   
    }
});

// f7Dom(document).on('page:init', '.page[data-name="look-and-arrange"]', function(e) {
//     console.log('page initialized');
// })


function test() {
    console.log('test');
    console.log(f7Dom)
}


async function Play() {
    while(playGame) {
        LevelConfig();
        referenceItems = GetItems(itemCount);
        forSortingItems = Shuffle([...referenceItems]);

        console.log('referenceItems: ', referenceItems)
        console.log('forSortingItems: ', forSortingItems)

        if(await ShowReferencePage()) {
            // continue playing
            console.log('continue playing')

            if(await ShowSortingPage()) {
                // success page
                console.log('success..')
            } else {
                // fail page
                console.log('fail..')
            }
        } else {
            // end game
        }
        playGame = false;
    }
}


async function ShowReferencePage() {
    return new Promise(function(resolve, reject) {
        const grid = $('#reference-page > .grid');
        HideAllPageContent();
        grid.html();
        referenceItems.forEach(function (item){
            grid.append(CreateCard(item));
        });
        $('.game-page #reference-page').show();
        $('button#startButton').on('click', function(e) {
            resolve(true);
        });
    });
}


async function ShowSortingPage() {
    return new Promise(function(resolve, reject) {
        const grid = $('#sorting-page > .grid');
        HideAllPageContent();

        // show all the grids
        grid.html();
        forSortingItems.forEach(function (item) {
            grid.append(CreateCard(item));
        });

        let timer;
        let counter = time;
        function RunTime() {
            $('#sorting-page #timer').html(counter);
            if(counter > 0) {
                
                // console.log('counter: ', counter)
                if(isSolved) {
                    clearTimeout(timer);
                    resolve(true);
                } else {
                    timer = setTimeout(RunTime, 1000);
                }

            } else {
                console.log('done');
                clearTimeout(timer);
                resolve(false);
            }
            counter--;
        }

        RunTime();
        $('.game-page #sorting-page').show();

        console.log('parent: ', grid);
        new Sortable(grid.get(0), {
            onSort: function(e) {
                sortedItems = grid.children('.cell').map(function(index, element) {
                    return {item: $(this).attr('data-item'), order: index}
                });


            }
        })

    });
    
}


function CheckMatch() {
    
}

function GetSortedItems() {

}

function GetItems(itemCount) {
    const randomItems = RandomItems(itemCount);
    const orderedItems = randomItems.map(function(item, index){
        return {item: item, order: index};
    });
    return orderedItems;
}

function CreateCard(item) {
    return `
    <div class="cell flex-center" data-order="${item.order}" data-item="${item.item}">
        <i class="fa-solid fa-${item.item}">
        </i>
    </div>`;
}

function ShowSucessPage() {
    HideAllPageContent();
    $('.game-page #success-page').show();
}

function ShowFailPage() {
    HideAllPageContent();
    $('.game-page #fail-page').show();
}

function HideAllPageContent() {
    $('.game-page .page-content').hide();
}

function NextLevel() {
    level++;
}

function LevelConfig() {
    if (level <= 3) {
        itemCount = 3;
        time = 10;
    } else if(level <= 6) {
        itemCount = 4;
        time = 10;
    } else if(level <= 9) {
        itemCount = 5;
        time = 15;
    } else if(level <= 12) {
        itemCount = 6;
        time = 15;
    } else if(level <= 15) {
        itemCount = 7;
        time = 20;
    } else if(level <= 18) {
        itemCount = 8;
        time = 20;
    } else if(level <= 21) {
        itemCount = 9;
        time = 25;
    } else if(level <= 24) {
        itemCount = 10;
        time = 30;
    } else if(level <= 27) {
        itemCount = 12;
        time = 35;
    } else {
        itemCount = 15;
        time = 60;
    }
}