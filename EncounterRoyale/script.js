/*
ToDo:
-Fix bridge collision
-Improve AI
    -Add spell support
-Add options menu
-Add more units and buildings
    -E-Spirit
    -Tesla
    -Log
    -Bowler
-Better mobile support
-Improve Pathfinding
*/

//1 range ≈ 24

const c = document.getElementById('c');
const ctx = c.getContext('2d');

const elixirBar = document.getElementById('elixirBar');
const elixirNum = document.getElementById('elixirNum');

const gameoverScreen = document.getElementById('gameoverScreen');
const gameoverMessage = document.getElementById('gameoverMessage');
const restartButton = document.getElementById('restartButton');

const cardBar = document.getElementById('cardBar');

const chosenCards = document.getElementById('chosenCards');
const cardChoices = document.getElementById('cardChoices');

let game = {
    maxElixir: 10,
    elixirRate: 2800,
    laneLeftX: c.width * 0.25,
    laneRightX: c.width * 0.75,
    river: c.height / 2,
    riverWidth: 50,
    bridgeWidth: 100,
    deployMaxY: 10,
    princessY: 170,
    kingY: 80,
    team: 'player',
    enemyElixirMult: 1.5,
    enemyStartElixir: 5,
    playerElixirMult: 1,
    playerStartElixir: 5,
    randomiseEnemyUnits: true
};

let debug = {
    drawViewRange: false,
    drawRange: false,
    drawDash: false
};

const aoeStats = {
    lumberjackRage: {
        name: 'Rage',
        radius: 100,
        damage: 179,
        lifetime: 5500,
        shrink: false,
        rageBoost: 1.3
    },
    valkyrieAOE: {
        radius: 60,
        damage: 266,
        target: 'ground'
    },
    iceSpiritAOE: {
        radius: 60,
        damage: 110,
        freezeDuration: 1200
    },
    fireSpiritAOE: {
        radius: 70,
        damage: 207
    },
    iceGolemDeathAOE: {
        radius: 60,
        damage: 84,
        slowDuration: 2000,
        slowAmount: 0.7
    },
    witchAOE: {
        radius: 45,
        damage: 335
    },
    golemDeathAOE: {
        radius: 60,
        damage: 225
    },
    wallBreakerAOE: {
        radius: 45,
        damage: 391
    },
    megaKnightAttackAOE: {
        radius: 40,
        damage: 268,
        target: 'ground',
        id: 'attack'
    },
    megaKightJumpAOE: {
        radius: 60,
        damage: 537,
        target: 'ground'
    },
    megaKnightSpawnAOE: {
        radius: 66,
        damage: 430,
        lifetime: 500,
        target: 'ground'
    },
    balloonBombAOE: {
        radius: 60,
        damage: 240
    },
    golemiteDeathAOE: {
        radius: 60,
        damage: 99
    }
};

const projectileStats = {
    princessTowerArrow: {
        damage: 109
    },
    kingTowerBullet: {
        damage: 109
    },
    archerArrow: {
        damage: 112
    },
    fireSpirit: {
        size: 15,
        aoeStats: aoeStats.fireSpiritAOE,
        colour: '#ff9100ff',
        distance: 90
    },
    iceSpirit: {
        size: 15,
        aoeStats: aoeStats.iceSpiritAOE,
        colour: '#00fafeff',
        distance: 90
    },
    dartGoblinDart: {
        damage: 156,
        speed: 13
    },
    cannonBullet: {
        damage: 212
    },
    minionBullet: {
        damage: 107,
        speed: 16,
        size: 3
    },
    megaMinionBullet: {
        damage: 312,
        speed: 16
    },
    witchBullet: {
        aoeStats: aoeStats.witchAOE,
        colour: '#7700aaff',
        size: 8
    },
    royalGiantBullet: {
        damage: 307,
        size: 10
    },
    mArcherArrow: {
        damage: 133,
        pierce: 9999,
        distance: 250,
        colour: '#00eaffff',
        targetPriority: 'all',
        size: 7
    },
    bowlerBall: {
        damage: 289,
        size: 25,
        pierce: 9999,
        distance: 150,
        speed: 2,
        colour: '#919191ff',
        targetPriority: 'ground',
        lifetime: 2000,
        knockback: 3
    }
};

const otherUnits = {
    golemite: {
        name: 'Golem',
        symbol: '🗿',
        hp: 1039,
        damage: 84,
        deathAOEStats: aoeStats.golemiteDeathAOE,
        attackSpeed: 2500,
        range: 30,
        viewRange: 150,
        size: 25,
        speed: 0.5,
        targetPriority: 'buildings',
        type: 'unit'
    },
    lavaPup: {
        name: 'Lava Pup',
        symbol: '🐦‍🔥',
        hp: 217,
        damage: 81,
        attackSpeed: 1300,
        range: 45,
        viewRange: 150,
        size: 15,
        speed: 1,
        targetPriority: 'all',
        type: 'flying'
    },
    skeleton: {
        name: 'Skeleton',
        symbol: '💀',
        hp: 81,
        damage: 81,
        attackSpeed: 1100,
        range: 20,
        viewRange: 150,
        size: 15,
        speed: 1.4,
        targetPriority: 'ground',
        type: 'unit'
    },
    balloonBomb: {
        name: 'Balloon Bomb',
        symbol: '💣',
        hp: 3000,
        deathAOEStats: aoeStats.balloonBombAOE,
        attackSpeed: 2000,
        range: 20,
        viewRange: 150,
        size: 15,
        speed: 0,
        targetPriority: 'ground',
        type: 'bomb',
        hpLostPerSecond: 400
    },
    diddy: {
        name: 'Diddy',
        symbol: '🐸',
        hp: 1080,
        damage: 337,
        attackSpeed: 1100,
        range: 30,
        viewRange: 150,
        size: 25,
        speed: 1.4,
        targetPriority: 'ground',
        type: 'unit'
    },
    lumberjackRage: {
        name: 'Rage',
        symbol: '🟣',
        type: 'spell',
        radius: 100,
        damage: 179,
        lifetime: 5500,
        shrink: false,
        rageBoost: 1.3
    }
};

const units = {
    knight: {
        name: 'Knight',
        symbol: '⚔️',
        cost: 3,
        hp: 1766,
        damage: 202,
        attackSpeed: 1200,
        range: 30,
        viewRange: 150,
        size: 25,
        speed: 1.0,
        targetPriority: 'ground',
        type: 'unit'
    },
    archers: {
        name: 'Archers',
        symbol: '🏹',
        cost: 3,
        hp: 304,
        projectileStats: projectileStats.archerArrow,
        attackSpeed: 900,
        range: 120,
        viewRange: 150,
        size: 20,
        speed: 1.0,
        targetPriority: 'all',
        type: 'unit'
    },
    giant: {
        name: 'Giant', 
        symbol: '💪',
        cost: 5, 
        hp: 4090, 
        damage: 253, 
        attackSpeed: 1500, 
        range: 35, 
        viewRange: 150,
        size: 30,
        speed: 0.7, 
        targetPriority: 'buildings', 
        type: 'unit'
    },
    skeletons: {
        name: 'Skeletons',
        symbol: '💀',
        cost: 1,
        hp: 81,
        damage: 81,
        attackSpeed: 1100,
        range: 20,
        viewRange: 150,
        size: 15,
        speed: 1.4,
        targetPriority: 'ground',
        type: 'unit'
    },
    skarmy: {
        name: 'Skeleton Army',
        symbol: '💀',
        cost: 3,
        hp: 81,
        damage: 81,
        attackSpeed: 1100,
        range: 20,
        viewRange: 150,
        size: 15,
        speed: 1.4,
        targetPriority: 'ground',
        type: 'unit'
    },
    fireball: {
        name: 'Fireball',
        symbol: '🔥',
        cost: 4,
        type: 'spell',
        radius: 70,
        damage: 688,
        lifetime: 250
    },
    arrows: {
        name: 'Arrows',
        symbol: '🎯',
        cost: 3,
        type: 'spell',
        radius: 120,
        damage: 366,
        lifetime: 500
    },
    rage: {
        name: 'Rage',
        symbol: '🟣',
        cost: 2,
        type: 'spell',
        radius: 100,
        damage: 179,
        lifetime: 4500,
        shrink: false,
        rageBoost: 1.3
    },
    valkyrie: {
        name: 'Valkyrie',
        symbol: '🛡️',
        cost: 4,
        hp: 1907,
        attackSpeed: 1500,
        range: 30,
        viewRange: 150,
        size: 25,
        speed: 0.9,
        targetPriority: 'ground',
        type: 'unit',
        aoeStats: aoeStats.valkyrieAOE
    },
    hogRider: {
        name: 'Hog Rider',
        symbol: '🐗',
        cost: 4,
        hp: 1697,
        damage: 317,
        attackSpeed: 1600,
        range: 30,
        viewRange: 150,
        size: 25,
        speed: 1.3,
        targetPriority: 'buildings',
        type: 'unit'
    },
    miniPekka: {
        name: 'Mini Pekka',
        symbol: '🤖',
        cost: 4,
        hp: 1433,
        damage: 755,
        attackSpeed: 1600,
        range: 30,
        viewRange: 150,
        size: 25,
        speed: 0.8,
        targetPriority: 'ground',
        type: 'unit'
    },
    iceGolem: {
        name: 'Ice Golem',
        symbol: '⛄',
        cost: 2,
        hp: 1198,
        damage: 84,
        deathAOEStats: aoeStats.iceGolemDeathAOE,
        slowDuration: 2000,
        slowAmount: 0.7,
        attackSpeed: 2500,
        range: 30,
        viewRange: 150,
        size: 25,
        speed: 0.8,
        targetPriority: 'buildings',
        type: 'unit'
    },
    goblinBarrel: {
        name: 'Goblin Barrel',
        symbol: '🤢',
        cost: 3,
        hp: 202,
        damage: 120,
        attackSpeed: 1100,
        range: 20,
        viewRange: 150,
        size: 15,
        speed: 1.7,
        targetPriority: 'ground',
        type: 'spell'
    },
    fireSpirit: {
        name: 'Fire Spirit',
        symbol: '🔥',
        cost: 1,
        hp: 230,
        projectileStats: projectileStats.fireSpirit,
        attackSpeed: 2000,
        range: 60,
        viewRange: 150,
        size: 15,
        speed: 1.7,
        targetPriority: 'all',
        type: 'unit',
        dieOnAttack: true
    },
    pekka: {
        name: 'Pekka',
        symbol: '🦾',
        cost: 7,
        hp: 3760,
        damage: 816,
        attackSpeed: 1800,
        range: 35,
        viewRange: 150,
        size: 30,
        speed: 0.8,
        targetPriority: 'ground',
        type: 'unit'
    },
    dartGoblin: {
        name: 'Dart Goblin',
        symbol: '👹',
        cost: 3,
        hp: 261,
        projectileStats: projectileStats.dartGoblinDart,
        attackSpeed: 800,
        range: 156,
        viewRange: 160,
        size: 20,
        speed: 1.7,
        targetPriority: 'all',
        type: 'unit'
    },
    cannon: {
        name: 'Cannon',
        symbol: '💣',
        cost: 3,
        hp: 824,
        projectileStats: projectileStats.cannonBullet,
        attackSpeed: 1000,
        range: 132,
        viewRange: 150,
        size: 25,
        speed: 0,
        targetPriority: 'ground',
        type: 'building',
        hpLostPerSecond: 27.4
    },
    minions: {
        name: 'Minions',
        symbol: '😈',
        cost: 3,
        hp: 230,
        projectileStats: projectileStats.minionBullet,
        attackSpeed: 1100,
        range: 60,
        viewRange: 150,
        size: 15,
        speed: 1.5,
        targetPriority: 'all',
        type: 'flying'
    },
    minionHorde: {
        name: 'Minion Horde',
        symbol: '😈',
        cost: 5,
        hp: 230,
        projectileStats: projectileStats.minionBullet,
        attackSpeed: 1100,
        range: 60,
        viewRange: 150,
        size: 15,
        speed: 1.5,
        targetPriority: 'all',
        type: 'flying'
    },
    megaMinion: {
        name: 'Mega Minion',
        symbol: '👿',
        cost: 3,
        hp: 837,
        projectileStats: projectileStats.megaMinionBullet,
        attackSpeed: 1100,
        range: 60,
        viewRange: 150,
        size: 20,
        speed: 1,
        targetPriority: 'all',
        type: 'flying'
    },
    golem: {
        name: 'Golem',
        symbol: '🗿',
        cost: 8,
        hp: 5120,
        damage: 312,
        deathAOEStats: aoeStats.golemDeathAOE,
        deathSpawnNum: 2,
        deathSpawnStats: otherUnits.golemite,
        attackSpeed: 2500,
        range: 40,
        viewRange: 150,
        size: 35,
        speed: 0.5,
        targetPriority: 'buildings',
        type: 'unit'
    },
    wallBreakers: {
        name: 'Wall Breakers',
        symbol: '🧨',
        cost: 2,
        hp: 330,
        damage: 391,
        attackSpeed: 2500,
        range: 20,
        viewRange: 150,
        size: 15,
        speed: 2,
        targetPriority: 'buildings',
        type: 'unit',
        aoeStats: aoeStats.wallBreakerAOE
    },
    lavaHound: {
        name: 'Lava Hound',
        symbol: '🐦‍🔥',
        cost: 7,
        hp: 3581,
        damage: 53,
        deathSpawnNum: 6,
        deathSpawnStats: otherUnits.lavaPup,
        attackSpeed: 1300,
        range: 75,
        viewRange: 150,
        size: 30,
        speed: 0.7,
        targetPriority: 'buildings',
        type: 'flying'
    },
    iceSpirit: {
        name: 'Ice Spirit',
        symbol: '❄️',
        cost: 1,
        hp: 230,
        projectileStats: projectileStats.iceSpirit,
        attackSpeed: 2000,
        range: 60,
        viewRange: 150,
        size: 15,
        speed: 1.7,
        targetPriority: 'all',
        type: 'unit',
        dieOnAttack: true
    },
    freeze: {
        name: 'Freeze',
        symbol: '❄️',
        cost: 4,
        type: 'spell',
        radius: 80,
        damage: 115,
        lifetime: 4000,
        freezeDuration: 4000,
        shrink: false
    },
    witch: {
        name: 'Witch',
        symbol: '🧛‍♀️',
        cost: 5,
        hp: 839,
        projectileStats: projectileStats.witchBullet,
        supportSpawnNum: 4,
        supportSpawnSpeed: 7000,
        supportStats: otherUnits.skeleton,
        attackSpeed: 1100,
        range: 132,
        viewRange: 150,
        size: 20,
        speed: 1,
        targetPriority: 'all',
        type: 'unit'
    },
    royalGiant: {
        name: 'Royal Giant', 
        symbol: '💣',
        cost: 6, 
        hp: 3164,
        projectileStats: projectileStats.royalGiantBullet,
        attackSpeed: 1700, 
        range: 120, 
        viewRange: 150,
        size: 30,
        speed: 0.7, 
        targetPriority: 'buildings', 
        type: 'unit'
    },
    bandit: {
        name: 'Bandit',
        symbol: '💰',
        cost: 3,
        hp: 906, 
        damage: 194,
        dashDamage: 389,
        dashRange: {min: 84, max: 144},
        dashSpeed: 10,
        dashPauseTime: 800,
        attackSpeed: 1000, 
        range: 30,
        viewRange: 150,
        size: 25,
        speed: 1.0, 
        targetPriority: 'ground',
        type: 'unit'
    },
    megaKnight: {
        name: 'Mega Knight',
        symbol: '⚙️',
        cost: 7,
        hp: 3993, 
        dashRange: {min: 84, max: 120},
        dashSpeed: 4,
        dashAOEStats: aoeStats.megaKightJumpAOE,
        dashPauseTime: 900,
        attackSpeed: 1200, 
        range: 40,
        viewRange: 150,
        size: 30,
        speed: 1.0, 
        targetPriority: 'ground',
        type: 'unit',
        aoeStats: aoeStats.megaKnightAttackAOE,
        spawnAOEStats: aoeStats.megaKnightSpawnAOE
    },
    bats: {
        name: 'Bats',
        symbol: '🦇',
        cost: 2,
        hp: 81,
        damage: 81,
        attackSpeed: 1300,
        range: 25,
        viewRange: 150,
        size: 15,
        speed: 1.7,
        targetPriority: 'all',
        type: 'flying'
    },
    balloon: {
        name: 'Balloon',
        symbol: '🎈',
        cost: 5,
        hp: 1679,
        damage: 640,
        deathSpawnNum: 1,
        deathSpawnStats: otherUnits.balloonBomb,
        attackSpeed: 2000,
        range: 30,
        viewRange: 150,
        size: 25,
        speed: 1,
        targetPriority: 'buildings',
        type: 'flying'
    },
    diddyCage: {
        name: 'Diddy Cage',
        symbol: '🎁',
        cost: 4,
        hp: 780,
        damage: 0,
        deathSpawnNum: 1,
        deathSpawnStats: otherUnits.diddy,
        attackSpeed: 4000,
        range: 35,
        viewRange: 150,
        size: 30,
        speed: 0,
        targetPriority: 'all',
        type: 'building',
        hpLostPerSecond: 39
    },
    lumberjack: {
        name: 'Lumberjack',
        symbol: '🪓',
        cost: 4,
        hp: 1282,
        damage: 256,
        deathAOEStats: aoeStats.lumberjackRage,
        attackSpeed: 800,
        range: 30,
        viewRange: 150,
        size: 25,
        speed: 1.7,
        targetPriority: 'ground',
        type: 'unit'
    },
    prince: {
        name: 'Prince',
        symbol: '💈',
        cost: 5,
        hp: 1920,
        damage: 391,
        chargeDamage: 783,
        chargeSpeed: 1.7,
        chargeCooldown: 1000,
        chargeTriggerDistance: 60,
        attackSpeed: 1400,
        range: 40,
        viewRange: 150,
        size: 25,
        speed: 1.0,
        targetPriority: 'ground',
        type: 'unit'
    },
    mArcher: {
        name: 'Magic Archer',
        symbol: '🏹',
        cost: 4,
        hp: 529,
        projectileStats: projectileStats.mArcherArrow,
        attackSpeed: 1100,
        range: 190,
        viewRange: 190,
        size: 25,
        speed: 1.0,
        targetPriority: 'all',
        type: 'unit'
    },
    bowler: {
        name: 'Bowler',
        symbol: '🎳',
        cost: 5,
        hp: 2081,
        projectileStats: projectileStats.bowlerBall,
        attackSpeed: 2500,
        range: 96,
        viewRange: 150,
        size: 30,
        speed: 0.7,
        targetPriority: 'ground',
        type: 'unit'
    }
};

const playerUnits = {
    unit1: units.knight,
    unit2: units.archers,
    unit3: units.giant,
    unit4: units.skeletons,
    unit5: units.iceGolem,
    unit6: units.valkyrie,
    unit7: units.hogRider,
    unit8: units.miniPekka
};

/*const enemyUnits = {
    unit1: units.knight,
    unit2: units.archers,
    unit3: units.megaKnight,
    unit4: units.skeletons,
    unit5: units.skarmy,
    unit6: units.witch,
    unit7: units.bandit,
    unit8: units.minions
};*/

const enemyUnits = {
    unit1: units.knight,
    unit2: units.knight,
    unit3: units.knight,
    unit4: units.knight,
    unit5: units.knight,
    unit6: units.knight,
    unit7: units.knight,
    unit8: units.knight
};

const towers = {
    princess: {
        name: 'princess',
        symbol: '👸',
        hp: 3052,
        projectileStats: projectileStats.princessTowerArrow,
        attackSpeed: 800,
        range: 200,
        size: 30,
        type: 'building'
    },
    king: {
        name: 'king',
        symbol: '👑',
        hp: 4824,
        projectileStats: projectileStats.kingTowerBullet,
        attackSpeed: 1000,
        range: 185,
        size: 40,
        type: 'building'
    }
};

let mouse = {x: 0, y: 0, down: false, selection: -1};

let entities = [];
let aoes = [];
let projectiles = [];

let playerElixir = 5;
let enemyElixir = 5;

let playerHand = []; //What the player can use
let playerCycles = []; //What the player can use next

let enemyHand = [];
let enemyCycles = [];

let elixirIntervalID = null;
let runAIIntervalID = null;

let playerKingActivated = false;
let enemyKingActivated = false;

let gameFinished = false;

function start() {
    document.addEventListener('mousemove', (e) => {
        let rect = c.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;

        if (c.style.width == `${window.innerWidth - 10}px`) {
            mouse.x += window.innerHeight - 10;
            mouse.y += window.innerWidth - 120;
        }
    });

    c.addEventListener('mousedown', (e) => {
        mouse.down = true;
        
        spawnUnit(mouse.x, mouse.y, mouse.selection, game.team, playerElixir);

        mouse.selection = -1;

        drawHandUI();
    });

    c.addEventListener('mouseup', (e) => {
        mouse.down = false;
    });

    c.addEventListener('touchstart', (e) => {
        e.preventDefault();
        let rect = c.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
        mouse.down = true;

        let cWidth = c.style.width.replace('px', '');
        let cHeight = c.style.height.replace('px', '');

        if (Number(cWidth) < 800) {
            mouse.x *= 500 / cWidth;
            mouse.y *= 800 / cHeight;
        }

        spawnUnit(mouse.x, mouse.y, mouse.selection, game.team, playerElixir);

        mouse.selection = -1;
        
        drawHandUI();
    });

    c.addEventListener('touchend', function() {
        mouse.down = false;
    });

    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case '1':
                cardClick(cardBar.children[0], playerUnits[playerHand[0]], 0);
                break;
            case '2':
                cardClick(cardBar.children[1], playerUnits[playerHand[1]], 1);
                break;
            case '3':
                cardClick(cardBar.children[2], playerUnits[playerHand[2]], 2);
                break;
            case '4':
                cardClick(cardBar.children[3], playerUnits[playerHand[3]], 3);
                break;
        }
    });

    populateChoices();
}

function update() {
    ctx.clearRect(0, 0, c.width, c.height);

    drawMap();

    for (let i = 0; i < projectiles.length; i++) {
        let p = projectiles[i];

        p.draw();
        if (p.dead) projectiles.splice(i, 1);
        else p.update();
    }

    for (let i = 0; i < entities.length; i++) {
        let e = entities[i];
        
        if (e.dead) {
            if (e.stats) {
                if (e.stats.name == 'king') gameover(e.team);

                if (e.stats.deathAOEStats) {
                    aoes.push(new AOE(e.x, e.y, e.stats.deathAOEStats, e.team));
                }
                if (e.stats.deathSpawnNum) {
                    for (let j = 0; j < e.stats.deathSpawnNum; j++) {
                        entities.push(new UnitEntity(e.x + j, e.y, e.team, e.stats.deathSpawnStats));
                    }
                }

                if (e.stats.name == 'princess') {
                    if (e.team == 'player') {
                        playerKingActivated = true;
                        console.log('Player king tower acitvated');
                    } else {
                        enemyKingActivated = true;
                        console.log('Enemy king tower acitvated');
                    }
                }
            }

            entities.splice(i, 1);
            continue;
        }

        if(e.stats.type != 'flying') e.draw();
        e.update();
    }

    for (let i = 0; i < entities.length; i++) {
        let e = entities[i];
        if (e.stats.type == 'flying') e.draw();
    }

    for (let i = 0; i < aoes.length; i++) {
        let p = aoes[i];

        p.update();

        if (p.dead) {
            aoes.splice(i, 1);
            continue;
        }

        p.draw();
    }

    if (mouse.selection != -1) {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.arc(mouse.x, mouse.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
    }

    window.requestAnimationFrame(update);
}

class Entity {
    constructor(x, y, team, stats) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.stats = stats;
        this.attackCooldown = 0;
        this.hp = stats.hp;
        this.dead = false;
        this.freezeTime = 0;
        this.slowTime = 0;
        this.slowAmount = 1;
        this.rageBoost = 1;
        this.supportSpawnCooldown = this.stats.supportSpawnSpeed / 3;
        this.charging = false;

        if (!stats) this.dead = true;
    }

    draw() {
        //Draw shadow
        if (this.stats.type == 'flying') {
            ctx.beginPath();
            ctx.fillStyle = '#00000079';
            ctx.arc(this.x + 10, this.y + 10, this.stats.size, 0, 2*Math.PI);
            ctx.fill();
        }

        //Circle
        ctx.fillStyle = this.team == 'player' ? '#3845ffa1' : '#ff4343a1';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.stats.size, 0, 2*Math.PI);
        ctx.fill();

        //Symbol
        ctx.fillStyle = '#ffffff';
        ctx.font = `${this.stats.size + 5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.stats.symbol, this.x, this.y);

        //Heathbar outer
        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x - this.stats.size, this.y + this.stats.size + 3, this.stats.size * 2, 10);

        //Healthbar inner
        ctx.fillStyle = '#009607ff';
        ctx.fillRect(this.x - this.stats.size + 2, this.y + this.stats.size + 5, (this.stats.size * (this.hp / this.stats.hp) * 2)- 4, 6);

        
        

        //Draw if frozen
        if (this.freezeTime > 1) {
            ctx.beginPath();
            ctx.fillStyle = '#3fdfff93'
            ctx.arc(this.x, this.y, this.stats.size, 0, 2*Math.PI);
            ctx.fill();
        } else if (this.slowTime > 1) {
            ctx.beginPath();
            ctx.fillStyle = '#3fdfff35'
            ctx.arc(this.x, this.y, this.stats.size, 0, 2*Math.PI);
            ctx.fill();
        } 
        //Draw if rage boosted
        else if (this.rageBoost > 1) {
            ctx.beginPath();
            ctx.fillStyle = '#e600ff93'
            ctx.arc(this.x, this.y, this.stats.size, 0, 2*Math.PI);
            ctx.fill();
        }

        //Draw if charging
        if (this.charging) {
            ctx.beginPath();
            ctx.fillStyle = '#fbff0055';
            ctx.arc(this.x, this.y, this.stats.size, 0, 2*Math.PI);
            ctx.fill();
        }


        //---Debug---

        //View range
        if (debug.drawViewRange) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'black';
            ctx.arc(this.x, this.y, this.stats.viewRange, 0, 2 * Math.PI);
            ctx.stroke();
        }

        //Range
        if (debug.drawRange) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.arc(this.x, this.y, this.stats.range, 0, 2 * Math.PI);
            ctx.stroke();
        }

        //Dash range
        if (this.stats.dashRange && debug.drawDash) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.arc(this.x, this.y, this.stats.dashRange.min, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.stats.dashRange.max, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    takeDamage(amount) {
        if (this.hp <= amount) {
            this.dead = true;
        } else {
            this.hp -= amount;
            if (Number.isNaN(this.hp)) console.log(amount);
        }
    }

    attack(target) {
        if (target && this.attackCooldown < 1) {
            if (this.charging) {
                target.takeDamage(this.stats.chargeDamage);
            } else {
                target.takeDamage(this.stats.damage);
            }

            this.attackCooldown = this.stats.attackSpeed;
        }
    }

    aoeAttack(x, y, stats) {
        if (this.attackCooldown < 1) {
            if (this.stats.name == 'Wall Breakers') {
                aoes.push(new AOE(this.target.x, this.target.y, stats, this.team));
                this.dead = true;
            } else if (this.stats.name == 'Witch' || (this.stats.name == 'Mega Knight' && stats.id == 'attack')) {
                aoes.push(new AOE(this.target.x, this.target.y, stats, this.team));
                this.attackCooldown = this.stats.attackSpeed;
            } else {
                aoes.push(new AOE(x, y, stats, this.team));
                this.attackCooldown = this.stats.attackSpeed;
            }
        }
    }

    shoot(target) {
        let dir = M.normalise(target.x - this.x, target.y - this.y);

        if (this.attackCooldown < 1) {
            if (this.stats.projectileStats.targetPriority == 'all' || this.stats.projectileStats.targetPriority == 'ground') {
                projectiles.push(new Projectile(this.x, this.y, this.stats.projectileStats, dir, this.team));
            } else {
                projectiles.push(new Projectile(this.x, this.y, this.stats.projectileStats, dir, this.team, this.target));
            }
            this.attackCooldown = this.stats.attackSpeed;
        }
    }

    spawnSupport() {
        if (this.supportSpawnCooldown < 1) {
            if (this.stats.name == 'Witch') {
                entities.push(new UnitEntity(this.x + 50, this.y, this.team, this.stats.supportStats));
                entities.push(new UnitEntity(this.x - 50, this.y, this.team, this.stats.supportStats));
                entities.push(new UnitEntity(this.x, this.y + 50, this.team, this.stats.supportStats));
                entities.push(new UnitEntity(this.x, this.y - 50, this.team, this.stats.supportStats));
                this.supportSpawnCooldown = this.stats.supportSpawnSpeed;
            }
        }
    }
}

class UnitEntity extends Entity {
    constructor(x, y, team, stats) {
        super(x, y, team, stats);
        this.target = null;
        this.dashTime = 0;
        this.dashPauseTime = 0;
        this.distance = 0;
        this.oldTarget = null;
        this.knockbackVel = {x: 0, y: 0};

        if (this.stats.spawnAOEStats) this.aoeAttack(this.x, this.y, this.stats.spawnAOEStats);
    }

    update() {
        if (Number.isNaN(this.hp)) {
            this.dead = true;
            return;
        }

        if (this.attackCooldown > 0) this.attackCooldown -= 1000 / 60 * this.slowAmount * this.rageBoost;
        if (this.supportSpawnCooldown > 0 && this.stats.supportSpawnSpeed) this.supportSpawnCooldown -= 1000 / 60 * this.slowAmount * this.rageBoost;

        if (this.slowTime > 0) this.slowTime -= 1000 / 60;
        else this.slowAmount = 1;
        if (this.freezeTime > 0) {
            this.freezeTime -= 1000 / 60;
            if (this.dashTime) this.dashTime = 0;
            this.distance = 0;
            this.charging = false;
            return;
        }

        if (this.stats.hpLostPerSecond) {
            this.takeDamage(this.stats.hpLostPerSecond / (1000 / 60) / 4);
        }

        //Apply knockback
        if (this.knockbackVel && (this.knockbackVel.x != 0 || this.knockbackVel.y != 0)) {
            this.x += this.knockbackVel.x;
            this.y += this.knockbackVel.y;
            this.knockbackVel.x *= 0.9;
            this.knockbackVel.y *= 0.9;
        }

        this.checkDash();
        this.checkCharge();
        this.checkRageBoost();
        this.spawnSupport();
        this.findTarget();

        if (!this.target) return;
        this.oldTarget = this.target;

        let dist = M.dist(this.x, this.y, this.target.x, this.target.y);
        let hasDash = this.stats.dashDamage || this.stats.dashAOEStats;

        if (hasDash && dist > this.stats.dashRange.min  + this.target.stats.size && dist < this.stats.dashRange.max + this.target.stats.size && this.target && this.target.stats.type) {
            if (this.dashTime < 100) {
                this.dashTime = 1000 + this.stats.dashPauseTime;
                this.dashPauseTime = this.stats.dashPauseTime;
            }
        } else if (dist - this.target.stats.size < this.stats.range && this.target.stats.size > 0) {
            if (this.stats.aoeStats) {
                this.aoeAttack(this.x, this.y, this.stats.aoeStats);
            } else if (this.stats.projectileStats) {
                this.shoot(this.target);
                if (this.stats.dieOnAttack) {
                    this.dead = true;
                    return;
                }
            } else {
                this.attack(this.target);
            }
            this.charging = false;
            this.distance = 0;
        } else {
            if (this.dashTime <= 1 && !this.charging) this.moveTowards(this.target);
        }

        if (this.stats.type != 'building' && this.stats.type != 'bomb') this.collide();
        this.wallCol();
    }

    findTarget() {
        let minDist = Infinity;
        let closestEnemy = null;
        for (let i = 0; i < entities.length; i++) {
            let e = entities[i];
            if (e.team == this.team) continue;
            if (e.stats.type == 'bomb') continue;

            let dist = M.dist(this.x, this.y, e.x, e.y);

            if (e.stats.name == 'princess') dist += 40;

            if (dist < minDist && dist < this.stats.viewRange) {
                if (this.stats.targetPriority == 'buildings') {
                    if (e.stats.type == 'building') {
                        minDist = dist;
                        closestEnemy = e;
                    } else {
                        continue;
                    }
                } else if (this.stats.targetPriority == 'ground') {
                    if (e.stats.type != 'flying') {
                        minDist = dist;
                        closestEnemy = e;
                    } else {
                        continue;
                    }
                } else {
                    minDist = dist;
                    closestEnemy = e;
                }
            }
        }

        if (closestEnemy) {
            this.target = closestEnemy;
        } else {
            for (let i = 0; i < entities.length; i++) {
                let e = entities[i];
                let name = e.stats.name;
                if ((name != 'princess' && name != 'king') || (e.team == this.team)) continue;
                
                if (name == 'princess') {
                    if ((this.x < c.width / 2 + 1 && e.x < c.width / 2 + 1) || (this.x > c.width / 2 && e.x > c.width / 2)) {
                        this.target = e;
                        continue;
                    }
                }

                if (name == 'king') {
                    let placeholderStats = {size: -100};
                    if (this.team == 'player') {
                        if (this.y > game.river + 30) {
                            if ((this.x < c.width / 2 + 1 && e.x < c.width / 2 + 1) && this.stats.type != 'flying') this.target = {x: game.laneLeftX, y: game.river, stats: placeholderStats};
                            else this.target = {x: game.laneRightX, y: game.river, stats: placeholderStats};
                        } else {
                            this.target = e;
                        }
                    } else {
                        if (this.y < game.river - 30) {
                            if ((this.x < c.width / 2 + 1 && e.x < c.width / 2 + 1)) this.target = {x: game.laneLeftX, y: game.river, stats: placeholderStats};
                            else this.target = {x: game.laneRightX, y: game.river, stats: placeholderStats};
                        } else {
                            this.target = e;
                        }
                    }
                    continue;
                }
            }
        }
    }

    moveTowards(target, speed = this.stats.speed) {
        if (!target) return;
        let dist = M.dist(this.x, this.y, this.target.x, this.target.y);
        if (dist < speed) return;

        let dx = target.x - this.x;
        let dy = target.y - this.y;

        let xAmount = (dx / dist) * speed * this.slowAmount * this.rageBoost;
        let yAmount = (dy / dist) * speed * this.slowAmount * this.rageBoost;
        
        this.x += xAmount;
        this.y += yAmount;
        this.distance += Math.sqrt(xAmount * xAmount + yAmount * yAmount);
    }

    collide() {
        for (let i = 0; i < entities.length; i++) {
            let obj = entities[i];

            if (obj == this) continue;
            if (obj.stats.type == 'bomb') continue;

            if (this.stats.type === 'flying' && obj.stats.type !== 'flying') continue;
            if (this.stats.type !== 'flying' && obj.stats.type === 'flying') continue;

            let minDist = this.stats.size + obj.stats.size;
            let dx = this.x - obj.x;
            let dy = this.y - obj.y;
            let d2 = (dx * dx) + (dy * dy);

            if (d2 < minDist * minDist && d2 != 0) {
                let o = minDist - Math.sqrt(d2);
                let c = 0.5;

                let sepX = (dx / Math.sqrt(d2)) * o * c;
                let sepY = (dy / Math.sqrt(d2)) * o * c;

                /*if (obj.stats.type == 'building') {
                    this.x += sepX;
                    this.y += sepY;
                } else {
                    this.x += sepX / 2;
                    this.y += sepY / 2;
                    obj.x -= sepX / 2;
                    obj.y -= sepY / 2;
                }*/

                this.x += sepX;
                this.y += sepY;
            }
        }
    }

    wallCol() {
        //Side collision
        if (this.x - this.stats.size < 0) {
            this.x = this.stats.size;
        }
        if (this.x + this.stats.size > c.width) {
            this.x = c.width - this.stats.size;
        }

        //Top bottom collision
        if (this.y - this.stats.size < 0) {
            this.y = this.stats.y;
        }
        if (this.y + this.stats.size > c.height) {
            this.y = c.height - this.stats.size;
        }

        //River collision
        if (this.stats.type != 'flying') {
            let riverTop = game.river - game.riverWidth / 2;
            let riverBottom = game.river + game.riverWidth / 2;

            let onLeftBridge =
                this.x > game.laneLeftX - game.bridgeWidth / 2 &&
                this.x < game.laneLeftX + game.bridgeWidth / 2;

            let onRightBridge =
                this.x > game.laneRightX - game.bridgeWidth / 2 &&
                this.x < game.laneRightX + game.bridgeWidth / 2;

            if (!onLeftBridge && !onRightBridge) {
                if (this.y > riverTop - this.stats.size && this.y < riverTop) {
                    this.y = riverTop - this.stats.size;
                }
                if (this.y < riverBottom + this.stats.size && this.y > riverBottom) {
                    this.y = riverBottom + this.stats.size;
                }
            }
        }   
    }

    checkDash() {
        if (this.dashPauseTime > 0) {
            this.dashPauseTime -= 1000 / 60 * this.slowAmount * this.rageBoost;
            return;
        }
        
        if (this.dashTime > 0) {
            if (!this.target || this.target.dead) {
                this.dashTime = 0;
                return;
            }

            if (M.dist(this.x, this.y, this.target.x, this.target.y) < this.stats.range + this.target.stats.size) {
                if (this.stats.dashAOEStats) {
                    aoes.push(new AOE(this.x, this.y, this.stats.dashAOEStats, this.team));
                } else {
                    this.target.takeDamage(this.stats.dashDamage);
                }
                this.dashTime = 0;
                this.attackCooldown = this.stats.attackSpeed;
                return;
            } else {
                if (this.target != this.oldTarget) this.dashTime = 0;
                this.moveTowards(this.target, this.stats.dashSpeed);
            }
            this.dashTime -= 1000 / 60;
        }
    }

    checkCharge() {
        if (!this.stats.chargeSpeed) return;
        
        if (this.distance > this.stats.chargeTriggerDistance) {
            this.charging = true;
            this.moveTowards(this.target, this.stats.chargeSpeed);
        }
    }

    checkRageBoost() {
        let isBoosted = false;
        for (let i = 0; i < aoes.length; i++) {
            let p = aoes[i];

            if (!p.stats.rageBoost || p.team != this.team) continue;

            if (M.dist(this, p) < this.stats.size + p.stats.radius) {
                isBoosted = true;
                this.rageBoost = p.stats.rageBoost;
            }
        }
        if (!isBoosted) this.rageBoost = 1;
    }

    applyKnockback(dir, amount) {
        this.knockbackVel.x += dir.x * amount;
        this.knockbackVel.y += dir.y * amount;
    }
}

class TowerEntity extends Entity {
    constructor(x, y, team, stats) {
        super(x, y, team, stats);
    }

    update() {
        if (Number.isNaN(this.hp)) {
            this.dead = true;
            return;
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown -= 1000 / 60;
        }

        if (this.slowTime > 0) this.slowTime -= 1000 / 60;
        if (this.freezeTime > 0) {
            this.freezeTime -= 1000 / 60;
            return;
        } 

        this.findTarget();

        if (this.target) {
            if (this.team == 'player') {
                if (playerKingActivated || this.stats.name != 'king') this.shoot(this.target);
            } else {
                if (enemyKingActivated || this.stats.name != 'king') this.shoot(this.target);
            }
        }
    }

    findTarget() {
        let minDist = Infinity;
        let closestEnemy = null;
        for (let i = 0; i < entities.length; i++) {
            let e = entities[i];
            if (e.team == this.team || e.stats.type == 'bomb') continue;

            let dist = M.dist(this.x, this.y, e.x, e.y);

            if (dist < minDist && dist < this.stats.range + e.stats.size) {
                minDist = dist;
                closestEnemy = e;
            }
        }

        this.target = closestEnemy;
    }

    takeDamage(amount) {
        if (this.team == 'player') {
            if (!playerKingActivated && this.stats.name == 'king') playerKingActivated = true;
        } else {
            if (!enemyKingActivated && this.stats.name == 'king') enemyKingActivated = true;
        }
        if (this.hp <= amount) {
            this.dead = true;
        } else {
            this.hp -= amount;
        }
    }
}

class AOE {
    constructor(x, y, stats, team) {
        this.x = x;
        this.y = y;
        this.stats = stats;
        this.radius = this.stats.radius;
        this.lifetime = stats.lifetime || 250;
        this.originalRadius = this.stats.radius;
        this.team = team;
        this.dead = false;
        this.target = stats.target || 'all';

        if (!this.stats.lifetime) this.stats.lifetime = 250;

        this.aoeDamage();
    }

    draw() {
        if (this.stats.rageBoost > 1) {
            ctx.beginPath();
            ctx.fillStyle = '#ff32f85d';
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.fillStyle = this.team === 'player' ? '#00046f79' : '#ff840059';
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI); 
            ctx.fill();
        }
    }

    update() {
        if (this.lifetime > 0) {
            this.lifetime -= 1000 / 60;

            if (this.stats.shrink == true || this.stats.shrink == null) {
                this.radius = Math.max(10, this.stats.radius * (this.lifetime / this.stats.lifetime));
            }
        } else {
            this.dead = true;
        }
    }

    aoeDamage() {
        for (let i = 0; i < entities.length; i++) {
            let e = entities[i];
            if (e.team === this.team || e.stats.type === 'bomb') continue;

            if (this.stats.target === 'ground' && e.stats.type === 'flying') continue;

            let minDist = this.radius + e.stats.size;

            if (M.dist(this, e) < minDist) {
                if (this.stats.freezeDuration)
                    e.freezeTime += this.stats.freezeDuration;

                if (this.stats.slowDuration) {
                    e.slowTime += this.stats.slowDuration;
                    e.slowAmount = this.stats.slowAmount;
                }

                e.takeDamage(this.stats.damage);
            }
        }
    }
}

class Projectile {
    constructor(x, y, stats, direction, team, target = 'all') {
        this.x = x;
        this.y = y;
        this.stats = stats;
        this.direction = direction;
        this.team = team;
        this.lifetime = this.stats.lifetime || 500;
        this.dead = false;
        this.distance = 0;
        this.target = target;
        this.pierce = this.stats.pierce || 0;
        this.hitTargets = [];

        if (!this.stats.size) this.stats.size = 5;
        if (!this.stats.speed) this.stats.speed = 10;
        if (!this.stats.distance) this.stats.distance = 200;
    }

    draw() {
        ctx.beginPath();
        if (this.stats.colour) ctx.fillStyle = this.stats.colour;
        else ctx.fillStyle = '#000';
        ctx.arc(this.x, this.y, this.stats.size, 0, 2*Math.PI);
        ctx.fill();
    }

    update() {
        if (this.lifetime > 0) {
            this.lifetime -= 1000 / 60;
        } else this.dead = true;
        if (this.distance > this.stats.distance) {
            this.dead = true;
            return;
        }

        let xAmount = this.direction.x * this.stats.speed;
        let yAmount = this.direction.y * this.stats.speed;

        this.x += xAmount;
        this.y += yAmount;
        this.distance += Math.sqrt(xAmount * xAmount + yAmount * yAmount);

        this.collide();
    }

    collide() {
        if (this.target == 'all') {
            for (let i = 0; i < entities.length; i++) {
                let u = entities[i];

                if (u.team == this.team || u.stats.type == 'bomb') continue;
                if (this.stats.targetPriority == 'ground' && u.stats.type == 'flying') continue;
                if (this.stats.target == 'buildings' && (u.stats.type == 'unit' || u.stats.type == 'flying')) continue;

                let isHit = false;
                for (let j = 0; j < this.hitTargets.length; j++) {
                    if (this.hitTargets[j] == u) {
                        isHit = true;
                        continue;
                    }
                }
                if (isHit) continue;

                let minDist = u.stats.size + this.stats.size;
                let dist = M.dist(this, u);
                if (dist < minDist) {
                    if (this.pierce > 0) {
                        this.pierce -= 1;
                        u.takeDamage(this.stats.damage);
                        this.hitTargets.push(u);
                    } else {
                        if (this.stats.aoeStats) {
                            aoes.push(new AOE(this.x, this.y, this.stats.aoeStats, this.team));
                        } else {
                            u.takeDamage(this.stats.damage);
                        }
                        this.dead = true;
                    }
                    if (this.stats.knockback && u.knockbackVel) {
                        u.applyKnockback(this.direction, this.stats.knockback);
                    }
                }
            }
        } else {
            let minDist = this.target.stats.size + this.stats.size;
            let dist = M.dist(this, this.target);
            if (dist < minDist) {
                if (this.stats.aoeStats) {
                    aoes.push(new AOE(this.x, this.y, this.stats.aoeStats, this.team));
                } else {
                    this.target.takeDamage(this.stats.damage);
                }
                this.dead = true;
            }
        }
        
    }
}

class M {
    static dist(x1, y1, x2, y2) {
        if (x2 && y2) {
            let dx = x1 - x2;
            let dy = y1 - y2;

            return Math.sqrt(dx * dx + dy * dy);
        } else {
            let dx = x1.x - y1.x;
            let dy = x1.y - y1.y;

            return Math.sqrt(dx * dx + dy * dy);
        }
    }

    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    static normalise(x, y) {
        if (y) {
            let mag = Math.sqrt(x * x + y * y);

            return {x: x * (1 / mag), y: y * (1 / mag)};
        } else {
            let mag = Math.sqrt(x.x * x.x + x.y * x.y);
        
            return {x: x.x * (1 / mag), y: x.y * (1 / mag)};
        }
    }
}

function runAI() {
    if (Math.random() < 0.5) return;
    let spawnPoints = [{x: c.width / 2, y: 300}, {x: game.laneLeftX, y: game.princessY + 50}, {x: game.laneRightX, y: game.princessY + 50}];
    let i = Math.floor(Math.random() * enemyHand.length);

    let spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];

    spawnUnit(spawnPoint.x, spawnPoint.y, i, 'enemy', enemyHand, enemyCycles);
}

function updateElixir() {
    if (playerElixir < game.maxElixir) playerElixir += game.playerElixirMult;
    if (enemyElixir < game.maxElixir) enemyElixir += game.enemyElixirMult;

    updateElixirUI();
}

function updateElixirUI() {
    elixirBar.style.width = `${playerElixir / game.maxElixir * 100}%`;
    elixirNum.innerHTML = playerElixir;

    drawHandUI();
}

function spawnUnit(x, y, index, team) {
    if (index == -1) return;

    let stats = null;

    if (team === 'player') {
        stats = playerUnits[playerHand[index]];

        if (playerElixir < stats.cost) return;
        playerElixir -= stats.cost;

        playerCycles.push(playerHand[index]);
        playerHand[index] = playerCycles[0];
        playerCycles.splice(0, 1);

        if (y < game.river + game.riverWidth + game.deployMaxY && stats.type != 'spell') y = game.river + game.riverWidth + game.deployMaxY;
    } else {
        stats = enemyUnits[enemyHand[index]];

        if (enemyElixir < stats.cost) return;
        enemyElixir -= stats.cost;

        enemyCycles.push(enemyHand[index]);
        enemyHand[index] = enemyCycles[0];
        enemyCycles.splice(0, 1);
    }


    updateElixirUI();
    if (stats.name == 'Archers' || stats.name == 'Wall Breakers') {
        entities.push(new UnitEntity(x - 10, y, team, stats));
        entities.push(new UnitEntity(x + 10, y, team, stats));
    } else if (stats.name == 'Skeletons' || stats.name == 'Minions' || stats.name == 'Goblin Barrel') {
        entities.push(new UnitEntity(x + 10, y, team, stats));
        entities.push(new UnitEntity(x, y + 10, team, stats));
        entities.push(new UnitEntity(x - 10, y, team, stats));
    } else if (stats.name == 'Skeleton Army') {
        for (let i = 0; i < 15; i++) {
            entities.push(new UnitEntity(x + i, y + i, team, stats));
        }
    } else if (stats.name == 'Minion Horde') {
        for (let i = 0; i < 6; i++) {
            entities.push(new UnitEntity(x + i, y + i, team, stats));
        }
    } else if (stats.name == 'Bats') {
        for (let i = 0; i < 5; i++) {
            entities.push(new UnitEntity(x + i, y + i, team, stats));
        }
    } else if (stats.name == 'Fireball' || stats.name == 'Arrows' || stats.name == 'Freeze' || stats.name == 'Rage') {
        aoes.push(new AOE(x, y, stats, team));
    } else {
        entities.push(new UnitEntity(x, y, team, stats));
    }
}

function gameover(loser) {
    gameFinished = true;

    if (loser != 'player') {
        gameoverMessage.innerHTML = 'Player Wins!';
    } else {
        gameoverMessage.innerHTML = 'AI Wins!';
    }

    restartButton.innerHTML = 'Play Again'

    gameoverScreen.style.visibility = 'visible';
    gameoverScreen.style.opacity = '1';

    entities = [];
    aoes = [];

    mouse.selection = -1;

    clearInterval(elixirIntervalID);
    clearInterval(runAIIntervalID);
}

function reset() {
    gameFinished = false;

    gameoverScreen.style.visibility = 'hidden';
    gameoverScreen.style.opacity = '0';

    playerElixir = game.playerStartElixir;
    enemyElixir = game.enemyStartElixir;
    updateElixirUI();

    if (game.randomiseEnemyUnits) randomiseEnemyUnits();

    let playerUnitsArr = Object.keys(playerUnits);
    let enemyUnitsArr = Object.keys(enemyUnits);

    let playerDeck = [...playerUnitsArr];
    M.shuffle(playerDeck);
    playerHand = playerDeck.slice(0, 4);
    playerCycles = playerDeck.slice(4);

    let enemyDeck = [...enemyUnitsArr];
    M.shuffle(enemyDeck);
    enemyHand = enemyDeck.slice(0, 4);
    enemyCycles = enemyDeck.slice(4);

    drawHandUI();

    //Enemy towers
    entities.push(new TowerEntity(c.width / 2, game.kingY, 'enemy', towers.king));
    entities.push(new TowerEntity(game.laneLeftX, game.princessY, 'enemy', towers.princess));
    entities.push(new TowerEntity(game.laneRightX, game.princessY, 'enemy', towers.princess));
    
    //Player towers
    entities.push(new TowerEntity(c.width / 2, c.height - game.kingY, 'player', towers.king));
    entities.push(new TowerEntity(game.laneLeftX, c.height - game.princessY, 'player', towers.princess));
    entities.push(new TowerEntity(game.laneRightX, c.height - game.princessY, 'player', towers.princess));

    elixirIntervalID = setInterval(updateElixir, game.elixirRate);
    runAIIntervalID = setInterval(runAI, 1000);
}

function randomiseEnemyUnits() {
    let unitsArr = Object.keys(units);

    for (let i = 0; i < 8; i++) {
        let index = Math.floor(Math.random() * unitsArr.length);
        let u = units[unitsArr[index]];

        enemyUnits['unit' + (i+1)] = u;

        unitsArr.splice(index, 1);
    }
}

function drawHandUI() {
    cardBar.innerHTML = '';

    for (let i = 0; i < playerHand.length; i++) {
        let cardStats = playerUnits[playerHand[i]];
        let cardElem = document.createElement('div');

        cardElem.classList.add('card');

        cardElem.innerHTML = `
            <h2>${cardStats.symbol}</h2>
            <div style="font-weight: 700;">${cardStats.name}</div>
            <div style="font-weight: 700;">Cost: <span style="color: #df00df;">${cardStats.cost}</span></div>
        `;

        if (i === mouse.selection) {
            cardElem.classList.add('selected');
        }

        if (cardStats.cost > playerElixir) {
            cardElem.classList.add('disabled');
        }

        cardElem.addEventListener('click', () => cardClick(cardElem, cardStats, i));
        cardBar.appendChild(cardElem);
    }
}

function cardClick(cardElem, cardStats, index) {
    if (playerElixir < cardStats.cost) return;

    if (mouse.selection === index) {
        mouse.selection = -1;
        cardElem.classList.remove('selected');
    } else {
        let oldSelected = cardBar.querySelector('.card.selected');
        if (oldSelected) {
            oldSelected.classList.remove('selected');
        }

        mouse.selection= index;
        cardElem.classList.add('selected');
    }
}

function drawMap() {
    //Lanes
    ctx.fillStyle = '#1b753aff';
    ctx.fillRect(game.laneLeftX - (game.bridgeWidth / 2), game.princessY, game.bridgeWidth, c.height - game.princessY - game.princessY);
    ctx.fillRect(game.laneRightX - (game.bridgeWidth / 2), game.princessY, game.bridgeWidth, c.height - game.princessY - game.princessY);

    //river
    ctx.fillStyle = '#54d0f3ff';
    ctx.fillRect(0, game.river - (game.riverWidth / 2), c.width, game.riverWidth);

    //bridges
    ctx.fillStyle = '#834d00ff';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000000ff';
    ctx.fillRect(game.laneLeftX - (game.bridgeWidth / 2), game.river - (game.riverWidth / 2), game.bridgeWidth, game.riverWidth);
    ctx.strokeRect(game.laneLeftX - (game.bridgeWidth / 2), game.river - (game.riverWidth / 2), game.bridgeWidth, game.riverWidth);

    ctx.fillRect(game.laneRightX - (game.bridgeWidth / 2), game.river - (game.riverWidth / 2), game.bridgeWidth, game.riverWidth);
    ctx.strokeRect(game.laneRightX - (game.bridgeWidth / 2), game.river - (game.riverWidth / 2), game.bridgeWidth, game.riverWidth);

    //Draw no place area
    if (mouse.selection != -1 && playerUnits[playerHand[mouse.selection]].type != 'spell') {
        ctx.fillStyle = '#d700005c';
        ctx.strokeStyle = '#7f0000ff';
        lineWidth = 4;
        ctx.fillRect(0, 0, c.width, game.river + game.riverWidth + game.deployMaxY);
        ctx.strokeRect(0, 0, c.width, game.river + game.riverWidth + game.deployMaxY);
    }
}

function populateChoices() {
    let unitsArr = Object.keys(units);

    for (let i = 0; i < unitsArr.length; i++) {
        let cardStats = units[unitsArr[i]];
        let cardElem = document.createElement('div');

        cardElem.classList.add('card');

        cardElem.innerHTML = `
            <h2>${cardStats.symbol}</h2>
            <div style="font-weight: 700;">${cardStats.name}</div>
            <div style="font-weight: 700;">Cost: <span style="color: #df00df;">${cardStats.cost}</span></div>
        `;

        cardElem.addEventListener('click', () => cardChoiceClick(cardElem, cardStats, false, i));
        cardChoices.appendChild(cardElem);
    }
}

function cardChoiceClick(cardElem, stats, inDeck, index) {
    if (inDeck) {
        cardChoices.children[index].style.opacity = 1;
        cardElem.removeEventListener('click', () => cardChoiceClick(child, stats, true, index));
        cardElem.classList.remove('occupied');
        cardElem.innerHTML = '';
    } else {
        if (cardElem.style.opacity == 0.2) return;
        let children = chosenCards.children;
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child.classList.contains('occupied')) continue;

            child.innerHTML = `
                <h2>${stats.symbol}</h2>
                <div style="font-weight: 700;">${stats.name}</div>
                <div style="font-weight: 700;">Cost: <span style="color: #df00df;">${stats.cost}</span></div>
            `;
            child.classList.add('occupied');

            cardElem.style.opacity = 0.2;

            child.addEventListener('click', () => cardChoiceClick(child, stats, true, index));

            playerUnits['unit' + (i + 1)] = stats;
            break;
        }
        
    }
}