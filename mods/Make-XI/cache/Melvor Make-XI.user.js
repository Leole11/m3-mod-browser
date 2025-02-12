// ==UserScript==
// @name         Melvor Make-XI
// @namespace    http://tampermonkey.net/
// @version      0.1.5
// @description  Specify the number of actions to perform, Firemaking and Cooking are not supported. Forked from the original Melvor MakeX by Breindahl#2660
// @author       GMiclotte
// @match        https://*.melvoridle.com/*
// @exclude      https://wiki.melvoridle.com*
// @noframes
// @grant        none
// ==/UserScript==
/* jshint esversion: 6 */

// Note that this script is made for MelvorIdle version 0.20

function script() {
    // Loading script
    console.log('Melvor Make-XI: Loading...');

    // Funtion to check if task is complete
    function taskComplete(skillID) {
        if (window.makeLeft === 0) {
            notifyPlayer(skillID, "Task Done");
            console.log('make-x task done');
            let ding = new Audio("https://www.myinstants.com/media/sounds/ding-sound-effect.mp3");
            ding.volume = 0.1;
            ding.play();
            window.makeLeft = Infinity;
        }
    }

    const newVerb = (name, selected, start, verb = 'Create') => {
        return {
            name: name,
            verb: verb,
            id: `${name}X`,
            verbX: `${verb} X`,
            start: start,
            selected: () => window[selected],
        }
    };

    const skillVerbs = {
        //[CONSTANTS.skill.Firemaking]: newVerb('Firemaking', 'Burn', 'selectedLog', 'burnLog'),
        //[CONSTANTS.skill.Cooking]: newVerb('Cooking', 'Cook', 'selectedFood', 'startCooking'),
        [CONSTANTS.skill.Smithing]: newVerb('Smithing', 'selectedSmith', 'startSmithing'),
        [CONSTANTS.skill.Fletching]: newVerb('Fletching', 'selectedFletch', 'startFletching'),
        [CONSTANTS.skill.Crafting]: newVerb('Crafting', 'selectedCraft', 'startCrafting'),
        [CONSTANTS.skill.Runecrafting]: newVerb('Runecrafting', 'selectedRunecraft', 'startRunecrafting'),
        [CONSTANTS.skill.Herblore]: newVerb('Herblore', 'selectedHerblore', 'startHerblore'),
        [CONSTANTS.skill.Summoning]: newVerb('Summoning', 'selectedSummon', 'createSummon'),
        [CONSTANTS.skill.Magic]: newVerb('Magic', 'selectedAltMagic', 'castMagic', 'Cast'),
    };


    const TempContainerMakeX = ['<small class="mr-2" id="', '"><button type="button" class="btn btn-warning m-3" onclick="setMakeX(', ');">', '</button></small>'];
    const createMakeXContainer = (skillName, actionName = 'Create') => {
        return ''
            + `<div>`
            + `    <button type="button" class="btn btn-warning m-1 p-2" onClick="setMakeX(CONSTANTS.skill.${skillName});" style="height:48px;" id="${skillName}X">`
            + `${actionName} X`
            + `    </button>`
            + `</div>`;
    }
    //$("#skill-fm-logs-selected-qty").after(TempContainerMakeX[0]+"BurnX"+TempContainerMakeX[1]+"CONSTANTS.skill.Firemaking"+TempContainerMakeX[2]+"Burn X"+TempContainerMakeX[3]);
    //$("#skill-cooking-food-selected-qty").after(TempContainerMakeX[0]+"CookX"+TempContainerMakeX[1]+"CONSTANTS.skill.Cooking"+TempContainerMakeX[2]+"Cook X"+TempContainerMakeX[3]);
    Object.getOwnPropertyNames(skillVerbs).forEach(skillID => {
        const skill = skillVerbs[skillID].name;
        if (skill === 'Magic') {
            $("#magic-item-have").parent().parent().parent().children().last().children().first().children().first().after(TempContainerMakeX[0] + "CastX" + TempContainerMakeX[1] + "CONSTANTS.skill.Magic" + TempContainerMakeX[2] + "Cast X" + TempContainerMakeX[3]);
            return;
        }
        $(`#skill-${skill.toLowerCase()}-interval`).parent().parent().before(createMakeXContainer(skill));
    });

    window.makeLeft = Infinity;
    let startedNow = false;

    function makeX(clicked, skillID) {
        const verbx = skillVerbs[skillID].verbX;
        const id = skillVerbs[skillID].id;
        if (offline.skill === [skillID] && clicked) {
            window.makeLeft = Infinity;
            $(id).children().first().html(verbx);
        }
        if (makeLeft !== Infinity) {
            if (clicked) {
                if (!startedNow) {
                    makeLeft = Infinity;
                    $(id).children().first().html(verbx);
                }
            } else {
                window.makeLeft--;
                $(id).children().first().html(makeLeft + " left");
            }
        }
        startedNow = false;
        // console.log('makeLeft: '+ makeLeft);
        if (window.makeLeft === 0) {
            taskComplete(skillID);
            refs[skillID](true);
            $(id).children().first().html(verbx);
        }

    }

    window.setMakeX = function (skillID) {
        const verb = skillVerbs[skillID].verb;
        const verbx = skillVerbs[skillID].verbX;
        const id = skillVerbs[skillID].id;
        const selected = skillVerbs[skillID].selected();
        if (selected !== undefined && selected !== null && selected >= 0) {
            if (makeLeft === Infinity) {
                let xToSet = prompt('How many would you like to make?');
                try {
                    xToSet = parseInt(xToSet, 10);
                    if (!xToSet) {
                        xToSet = 0;
                    }
                    window.makeLeft = xToSet;
                    $(id).children().first().html(makeLeft + " left");
                    // console.log('makeLeft: '+ makeLeft);
                    if (offline.skill === skillID) {
                        return;
                    }
                } catch (e) {
                    console.error(e)
                }
            } else {
                window.makeLeft = Infinity;
                $(id).children().first().html(verbx);
            }
            startedNow = true;
            skillVerbs[skillID].start(true);
        }
    };

    const refs = {};
    const wrapper = (id) => {
        const start = skillVerbs[id].start;
        refs[id] = window[start];//.bind({});;
        window[start] = (...args) => {
            refs[id](...args);
            makeX(args[0], id);
        }
        skillVerbs[id].start = window[start];
    }
    Object.getOwnPropertyNames(skillVerbs).forEach(skillID => wrapper(skillID));

    // Loading script
    console.log('Melvor Make-XI: Loaded');
}

(function () {
    function injectScript(main) {
        const scriptElement = document.createElement('script');
        scriptElement.textContent = `try {(${main})();} catch (e) {console.log(e);}`;
        document.body.appendChild(scriptElement).parentNode.removeChild(scriptElement);
    }

    function loadScript() {
        if (confirmedLoaded) {
            // Only load script after game has opened
            clearInterval(scriptLoader);
            injectScript(script);
        }
    }

    const scriptLoader = setInterval(loadScript, 200);
})();
