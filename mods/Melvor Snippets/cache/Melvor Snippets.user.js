// ==UserScript==
// @name		Melvor Snippets
// @namespace	http://tampermonkey.net/
// @version		0.0.6
// @description	Collection of various snippets
// @author		GMiclotte
// @match		https://*.melvoridle.com/*
// @exclude		https://wiki.melvoridle.com*
// @noframes
// @grant		none
// ==/UserScript==

function script() {
    snippet = {
        name: '',
        log: (...args) => console.log('Snippets:', ...args),
        start: () => snippet.log(`Loading ${snippet.name}.`),
        end: () => snippet.log(`Loaded ${snippet.name}.`),
    };
    
    // header end
    
    /////////////////////////////////////
    //AgilityObstacleBuildsRemaining.js//
    /////////////////////////////////////
    snippet.name = 'AgilityObstacleBuildsRemaining.js';
    snippet.start();
    // show agility obstacles that have been built less than 10 times
    listObstaclesWithFewerThanTenBuilds = () => {
        agilityObstacleBuildCount.map((_, i) => i)
            .filter(i => agilityObstacleBuildCount[i] < 10)
            .map(i => agilityObstacles[i])
            .map(x => [x.category + 1, x.name]);
    }
    snippet.end();
    
    //////////////////
    //DefensePure.js//
    //////////////////
    snippet.name = 'DefensePure.js';
    snippet.start();
    // Various Defense Pure Calculations
    window.defensePure = {};
    
    defensePure.defLvlToHPLvl = def => {
        const hpXP = exp.level_to_xp(10) + 1;
        const minDefXP = exp.level_to_xp(def) + 1;
        const maxDefXP = exp.level_to_xp(def + 1);
        const minHpXP = hpXP + minDefXP / 3;
        const maxHpXP = hpXP + maxDefXP / 3;
        const minHp = exp.xp_to_level(minHpXP) - 1;
        const maxHp = exp.xp_to_level(maxHpXP) - 1;
        return {min: minHp, max: maxHp};
    }
    
    defensePure.defLvlToCbLvl = def => {
        const hp = defensePure.defLvlToHPLvl(def);
        const att = 1, str = 1, ran = 1, mag = 1, pray = 1;
        const minBase = (def + hp.min + Math.floor(pray / 2)) / 4;
        const maxBase = (def + hp.max + Math.floor(pray / 2)) / 4;
        const melee = (att + str) * 1.3 / 8;
        const ranged = Math.floor(1.5 * ran) * 1.3 / 8;
        const magic = Math.floor(1.5 * mag) * 1.3 / 8;
        const best = Math.max(melee, ranged, magic);
        return {min: minBase + best, max: maxBase + best};
    }
    
    defensePure.lastHitOnly = (skillID, maxLevel = 1) => {
        if (skillXP[skillID] >= exp.level_to_xp(maxLevel + 1) - 1) {
            combatManager.stopCombat();
            return;
        }
        // swap weapon based on hp left
        let itemID;
        if (combatManager.enemy.hitpoints > 1) {
            if (skillID === CONSTANTS.skill.Magic) {
                itemID = CONSTANTS.item.Normal_Shortbow;
            } else {
                // melee or ranged
                itemID = CONSTANTS.item.Staff_of_Air;
            }
        } else {
            if (skillID === CONSTANTS.skill.Ranged) {
                itemID = CONSTANTS.item.Iron_Throwing_Knife;
            } else if (skillID === CONSTANTS.skill.Magic) {
                itemID = CONSTANTS.item.Staff_of_Air;
            } else {
                // melee
                itemID = -1;
            }
        }
        if (player.equipment.slots.Weapon.item.id !== itemID) {
            if (itemID === -1) {
                player.unequipItem(0, 'Weapon');
            } else {
                player.equipItem(itemID, 0);
            }
        }
        // loop
        setTimeout(() => defensePure.lastHitOnly(skillID, maxLevel), 1000);
    }
    snippet.end();
    
    //////////////////
    //MasteryBars.js//
    //////////////////
    snippet.name = 'MasteryBars.js';
    snippet.start();
    // Add Mastery Bars
    setInterval(() => {
        for (const id in SKILLS) {
            if (SKILLS[id].hasMastery) {
                if ($(`#skill-nav-mastery-${id} .progress-bar`)[0]) {
                    $(`#skill-nav-mastery-${id} .progress-bar`)[0].style.width =
                        (MASTERY[id].pool / getMasteryPoolTotalXP(id)) * 100 + '%';
                    if (MASTERY[id].pool < getMasteryPoolTotalXP(id)) {
                        $(`#skill-nav-mastery-${id}`)[0].style.setProperty('background', 'rgb(76,80,84)', 'important');
                        $(`#skill-nav-mastery-${id} .progress-bar`)[0].className = 'progress-bar bg-warning';
                    } else {
                        $(`#skill-nav-mastery-${id}`)[0].style.setProperty('background', 'rgb(48,199,141)', 'success');
                        $(`#skill-nav-mastery-${id} .progress-bar`)[0].className = 'progress-bar bg-success';
                    }
                    const tip = $(`#skill-nav-mastery-${id}`)[0]._tippy;
                    tip.setContent((Math.min(1, MASTERY[id].pool / getMasteryPoolTotalXP(id)) * 100).toFixed(2) + '%');
                } else {
                    const skillItem = $(`#skill-nav-name-${id}`)[0].parentNode;
                    skillItem.style.flexWrap = 'wrap';
                    skillItem.style.setProperty('padding-top', '.25rem', 'important');
                    const progress = document.createElement('div');
                    const progressBar = document.createElement('div');
                    progress.id = `skill-nav-mastery-${id}`;
                    progress.className = 'progress active pointer-enabled';
                    progress.style.height = '6px';
                    progress.style.width = '100%';
                    progress.style.margin = '.25rem 0rem';
                    if (MASTERY[id].pool < getMasteryPoolTotalXP(id)) {
                        progress.style.setProperty('background', 'rgb(76,80,84)', 'important');
                        progressBar.className = 'progress-bar bg-warning';
                    } else {
                        progress.style.setProperty('background', 'rgb(48,199,141)', 'success');
                        progressBar.className = 'progress-bar bg-success';
                    }
                    progressBar.style.width = (MASTERY[id].pool / getMasteryPoolTotalXP(id)) * 100 + '%';
                    progress.appendChild(progressBar);
                    skillItem.appendChild(progress);
                    tippy($(`#skill-nav-mastery-${id}`)[0], {
                        placement: 'right',
                        content: ((MASTERY[id].pool / getMasteryPoolTotalXP(id)) * 100).toFixed(2) + '%',
                    });
                }
            }
        }
    }, 5000);
    snippet.end();
    
    ///////////////////
    //MasteryBuyer.js//
    ///////////////////
    snippet.name = 'MasteryBuyer.js';
    snippet.start();
    // methods to buy base mastery levels
    window.masteryBuyer = {
        poolXpPerItem: 500000,
    };
    
    masteryBuyer.availXp = (skillID, minPercent = 95) => {
        let minPool = MASTERY[skillID].xp.length * masteryBuyer.poolXpPerItem * minPercent / 100;
        return MASTERY[skillID].pool - minPool;
    }
    
    masteryBuyer.currentBase = (skillID) => {
        return Math.min(...MASTERY[skillID].xp.map((_, masteryID) => getMasteryLevel(skillID, masteryID)));
    }
    
    masteryBuyer.maxAffordableBase = (skillID, minPercent = 95) => {
        let xp = masteryBuyer.availXp(skillID, minPercent);
        // make bins with mastery levels
        let bins = [];
        for (let i = 0; i < 100; i++) {
            bins[i] = [];
        }
        MASTERY[skillID].xp.forEach((_, masteryID) => {
            let level = getMasteryLevel(skillID, masteryID);
            bins[level].push(masteryID);
        });
        // level one at a time
        let maxBase = 0;
        bins.forEach((x, i) => {
            if (i >= 99) {
                return;
            }
            if (x.length === 0) {
                return;
            }
            let xpRequired = (exp.level_to_xp(i + 1) - exp.level_to_xp(i)) * x.length;
            xp -= xpRequired;
            if (xp >= 0) {
                maxBase = i + 1;
                x.forEach(y => bins[i + 1].push(y));
            }
        });
        maxBase = maxBase > 99 ? 99 : maxBase;
        return maxBase;
    }
    
    masteryBuyer.increaseBase = (skillID, minPercent = 95, levelCap = 99) => {
        // buy until goal
        let goal = masteryBuyer.maxAffordableBase(skillID, minPercent);
        if (goal === 0) {
            goal = masteryBuyer.currentBase(skillID);
        }
        if (goal > levelCap) {
            goal = levelCap;
        }
        MASTERY[skillID].xp.forEach((_, masteryID) => {
            let level = getMasteryLevel(skillID, masteryID);
            if (level >= goal) {
                return;
            }
            masteryPoolLevelUp = goal - level;
            levelUpMasteryWithPool(skillID, masteryID);
        });
        // spend remainder on goal + 1
        const xpRequired = exp.level_to_xp(goal + 1) - exp.level_to_xp(goal);
        let count = Math.floor(masteryBuyer.availXp(skillID, minPercent) / xpRequired);
        masteryPoolLevelUp = 1;
        MASTERY[skillID].xp.forEach((_, masteryID) => {
            if (count === 0) {
                return;
            }
            let level = getMasteryLevel(skillID, masteryID);
            if (level > goal || level >= levelCap) {
                return;
            }
            count--;
            levelUpMasteryWithPool(skillID, masteryID);
        });
        // update total mastery
        updateTotalMastery(skillID);
    }
    
    masteryBuyer.overview = (minPercent = 95) => {
        Object.getOwnPropertyNames(SKILLS).forEach(skillID => {
            const skill = SKILLS[skillID];
            if (!skill.hasMastery) {
                return;
            }
            const maxBase = masteryBuyer.maxAffordableBase(skillID, minPercent);
            if (maxBase === 0) {
                return;
            }
            const currentBase = masteryBuyer.currentBase(skillID);
            console.log(`${skill.name}: ${currentBase} -> ${maxBase}`);
        });
    }
    
    masteryBuyer.remaining = (skillID, target = 99) => {
        let xp = 0;
        let xpTarget = exp.level_to_xp(target);
        MASTERY[skillID].xp.forEach(masteryXp => {
            xp += Math.max(0, xpTarget - masteryXp);
        });
        xp = Math.round(xp)
        console.log(formatNumber(xp))
        return xp
    }
    snippet.end();
    
    ///////////////////////
    //PrintSynergyList.js//
    ///////////////////////
    snippet.name = 'PrintSynergyList.js';
    snippet.start();
    // functions to print synergies per category (cb vs non-cb)
    printSynergy = (x, y) => console.log('- [ ]',
        x.summoningID,
        parseInt(y),
        items[x.itemID].name,
        items[summoningItems[y].itemID].name,
        SUMMONING.Synergies[x.summoningID][y].description,
        SUMMONING.Synergies[x.summoningID][y].modifiers
    );
    
    printCombatSynergyList = () => {
        // get combat synergies
        summoningItems.filter(x => items[x.itemID].summoningMaxHit).map(x => {
            for (y in SUMMONING.Synergies[x.summoningID]) {
                printSynergy(x, y);
            }
        });
    }
    
    printNonCombatSynergyList = () => {
        // get non-combat synergies
        summoningItems.filter(x => !items[x.itemID].summoningMaxHit).map(x => {
            for (y in SUMMONING.Synergies[x.summoningID]) {
                printSynergy(x, y);
            }
        });
    }
    snippet.end();
    
    /////////////////////
    //QuickEquipCape.js//
    /////////////////////
    snippet.name = 'QuickEquipCape.js';
    snippet.start();
    // Quick Equip Max/Comp Cape
    quickEquipSkillcape = (skill) => {
        const capes = [
            CONSTANTS.item.Cape_of_Completion,
            CONSTANTS.item.Max_Skillcape,
            skillcapeItems[skill],
        ];
        for (let i = 0; i < capes.length; i++) {
            const capeId = capes[i];
            if (player.equipment.checkForItemID(capeId)) {
                notifyPlayer(skill, `${items[capeId].name} is already equipped.`, "info");
                return;
            }
            const bankId = getBankId(capeId);
            if (bankId === -1) {
                continue;
            }
            if (!player.equipItem(capeId, player.selectedEquipmentSet)) {
                continue;
            }
            notifyPlayer(skill, `${items[capeId].name} Equipped.`, "success");
            if (skill === 0) {
                updateWCRates();
            }
            return;
        }
        notifyPlayer(skill, "There's no " + setToUppercase(Skills[skill]) + " Skillcape in your bank *shrug*", "danger");
    }
    snippet.end();
    
    /////////////////////
    //RemoveElements.js//
    /////////////////////
    snippet.name = 'RemoveElements.js';
    snippet.start();
    // remove various elements
    // combat
    document.getElementById('offline-combat-alert').remove();
    
    // summoning marks
    // green
    document.getElementById('summoning-category-0').children[0].children[0].children[2].remove();
    // orange and red
    document.getElementById('summoning-category-0').children[0].children[0].children[1].remove();
    
    // summoning tablets
    document.getElementById('summoning-category-1').children[0].children[0].children[0].remove()
    
    // alt. magic
    document.getElementById('magic-container').children[0].children[1].remove();
    
    // cloud saving
    document.getElementById('header-cloud-save-time').remove();
    document.getElementById('header-cloud-save-btn-connected').remove();
    
    // minibar-max-cape
    document.getElementById('minibar-max-cape').remove();
    snippet.end();
    
    ///////////////////
    //RerollSlayer.js//
    ///////////////////
    snippet.name = 'RerollSlayer.js';
    snippet.start();
    //reroll slayer task until desired task is met
    window.rerollSlayerTask = (monsterIDs, tier, extend = true) => {
        if (window.stopRerolling) {
            return;
        }
        const task = combatManager.slayerTask;
        const taskID = task.monster.id;
        const taskName = MONSTERS[taskID].name;
        if (!combatManager.slayerTask.taskTimer.active) {
            // only do something if slayer task timer is not running
            if (!combatManager.slayerTask.active || !monsterIDs.includes(taskID)) {
                // roll task if we don't have one, or if it has the wrong monster
                console.log(`rerolling ${taskName} for tier ${tier} task ${monsterIDs.map(monsterID => MONSTERS[monsterID].name).join(', ')}`);
                combatManager.slayerTask.selectTask(tier, true, true, false);
            } else if (extend && !task.extended) {
                // extend task if it is the right monster
                console.log(`extending ${taskName}`);
                combatManager.slayerTask.extendTask();
            }
        }
        setTimeout(() => rerollSlayerTask(monsterIDs, tier, extend), 1000);
    }
    snippet.end();
    
    /////////////////
    //ShardsUsed.js//
    /////////////////
    snippet.name = 'ShardsUsed.js';
    snippet.start();
    // compute total shards used
    shardsUsed = () => {
        // compute amount of gp spent on summoning shards that have been used (for summoning or agility obstacles)
        items.map((x, i) => [x, i])
            .filter(x => x[0].type === 'Shard' && x[0].category === 'Summoning')
            .map(x => x[1])
            .map(x => (itemStats[x].stats[0] - getBankQty(x) - itemStats[x].stats[1]) * items[x].buysFor)
            .reduce((a, b) => a + b, 0);
    }
    snippet.end();
    
    ///////////////////
    //SpawnAhrenia.js//
    ///////////////////
    snippet.name = 'SpawnAhrenia.js';
    snippet.start();
    // spawn Ahrenia
    window.spawnAhrenia = (phaseToSpawn = 1) => {
        // run
        combatManager.runCombat();
        // set respawn to 0
        if (!petUnlocked[0]) {
            unlockPet(0);
        }
        PETS[0].modifiers.decreasedMonsterRespawnTimer = 0;
        player.computeAllStats();
        PETS[0].modifiers.decreasedMonsterRespawnTimer = 3000 - TICK_INTERVAL - player.modifiers.decreasedMonsterRespawnTimer + player.modifiers.increasedMonsterRespawnTimer;
        player.computeAllStats();
        // unlock itm
        dungeonCompleteCount[CONSTANTS.dungeon.Fire_God_Dungeon] = Math.max(
            dungeonCompleteCount[CONSTANTS.dungeon.Fire_God_Dungeon],
            1,
        );
        skillLevel[CONSTANTS.skill.Slayer] = Math.max(
            skillLevel[CONSTANTS.skill.Slayer],
            90,
        );
        // skip to desired phase
        combatManager.selectDungeon(15);
        combatManager.dungeonProgress = 19 + phaseToSpawn;
        combatManager.loadNextEnemy();
    }
    snippet.end();
    
    ////////////////////
    //UnlimitedPool.js//
    ////////////////////
    snippet.name = 'UnlimitedPool.js';
    snippet.start();
    // don't cap pool xp
    eval(addMasteryXPToPool.toString()
        .replace('MASTERY[skill].pool>getMasteryPoolTotalXP(skill)', 'false')
        .replace(/^function (\w+)/, "window.$1 = function")
    );
    
    // don't cap token claiming
    eval(claimToken.toString()
        .replace('qty>=tokensToFillPool', 'false')
        .replace(/^function (\w+)/, "window.$1 = function")
    );
    snippet.end();
    
    // footer start
    }
    
    // inject the script
    (function () {
        function injectScript(main) {
            const scriptElement = document.createElement('script');
            scriptElement.textContent = `try {(${main})();} catch (e) {console.log(e);}`;
            document.body.appendChild(scriptElement).parentNode.removeChild(scriptElement);
        }
    
        function loadScript() {
            if (typeof isLoaded !== typeof undefined && isLoaded) {
                // Only load script after game has opened
                clearInterval(scriptLoader);
                injectScript(script);
            }
        }
    
        const scriptLoader = setInterval(loadScript, 200);
    })();