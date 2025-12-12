/*
ToDo:
-Improve AI
    -Add spell support
    -Make more responsive
-Add more units, buildings and spells
    -Tornado
-Add proper icons
-Add better visuals and particle effects
-Add next card display
-Add deploy time
-Add first attack time
*/

//1 range ≈ 24
//x = cos(anle) y = sin(angle)

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
    deployMaxY: 0,
    deployMaxY2: -175,
    princessY: 170,
    kingY: 80,
    team: 'player',
    enemyElixirMult: 1.5,
    enemyStartElixir: 5,
    playerElixirMult: 1,
    playerStartElixir: 5,
    randomiseEnemyUnits: true,
    randomisePlayerUnits: false
};

let debug = {
    drawViewRange: false,
    drawRange: false,
    drawDash: false,
    pickSameCards: false
};

const aoeStats = {
    lumberjackRage: {
        name: 'Rage',
        radius: 100,
        damage: 179,
        lifetime: 5500,
        shrink: false,
        rageBoost: 1.3,
        ctDamage: 54
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
    },
    skeletonDragonAOE: {
        radius: 45,
        damage: 161
    },
    bombTowerBombAOE: {
        radius: 72,
        damage: 222
    },
    bombTowerAOE: {
        radius: 36,
        damage: 222
    },
    royalGhostAOE: {
        radius: 26,
        damage: 261,
        target: 'ground'
    },
    princessAOE: {
        radius: 50,
        damage: 168
    },
    babyDragonAOE: {
        radius: 36,
        damage: 161
    },
    darkPrinceAOE: {
        radius: 26,
        damage: 266,
        target: 'ground'
    },
    darkPrinceChargeAOE: {
        radius: 26,
        damage: 532,
        target: 'ground'
    },
    bomberAOE: {
        radius: 36,
        damage: 225
    },
    eWizardSpawnAOE: {
        radius: 72,
        damage: 192,
        stunDuration: 500
    },
    battleHealerSpawnAOE: {
        radius: 60,
        damage: 0,
        heal: 202
    },
    battleHealerAOE: {
        radius: 96,
        damage: 0,
        heal: 102
    },
    wizardAOE: {
        radius: 36,
        damage: 281
    },
    mortarAOE: {
        radius: 48,
        damage: 266,
        target: 'ground'
    },
    skeletonBarrelDeathAOE: {
        radius: 48,
        damage: 145
    },
    eGiantAOE: {
        radius: 72,
        damage: 192,
        stunDuration: 500,
        ctDamage: 128
    },
    healSpiritAOE: {
        radius: 36,
        damage: 110
    },
    healSpiritHealAOE: {
        radius: 60,
        damage: 0,
        heal: 401
    },
    iceWizardAOE: {
        radius: 36,
        damage: 89,
        slowDuration: 2500,
        slowAmount: 0.7
    },
    iceWizardSpawnAOE: {
        radius: 72,
        damage: 84,
        slowDuration: 1000,
        slowAmount: 0.7
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
        distance: 90,
        aoeOnDeath: true
    },
    iceSpirit: {
        size: 15,
        aoeStats: aoeStats.iceSpiritAOE,
        colour: '#00fafeff',
        distance: 90,
        aoeOnDeath: true
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
    },
    musketeerBullet: {
        damage: 217,
        speed: 16
    },
    skeletonDragonFireBall: {
        aoeStats: aoeStats.skeletonDragonAOE,
        colour: '#ff8400ff',
        size: 8,
        speed: 9,
        aoeOnDeath: true
    },
    spearGoblinSpear: {
        damage: 81
    },
    eSpiritLightning: {
        damage: 99,
        type: 'lightning',
        stunDuration: 500,
        chainAmount: 9,
        range: 100
    },
    eDragonLightning: {
        damage: 192,
        type: 'lightning',
        stunDuration: 500,
        chainAmount: 3,
        range: 70
    },
    xBowBullet: {
        damage: 43,
        speed: 16,
        size: 4,
        distance: 300
    },
    bombTowerBullet: {
        aoeStats: aoeStats.bombTowerAOE,
        size: 10
    },
    princessArrows: {
        aoeStats: aoeStats.princessAOE,
        distance: 250
    },
    babyDragonFire: {
        colour: '#ff8800da',
        aoeStats: aoeStats.babyDragonAOE,
        size: 10
    },
    bomberBomb: {
        aoeStats: aoeStats.babyDragonAOE,
        speed: 8,
        size: 10,
        aoeOnDeath: true
    },
    eWizardLightning: {
        damage: 230,
        type: 'lightning',
        stunDuration: 500,
        chainAmount: 1,
        range: 1
    },
    motherWitchBullet: {
        damage: 133,
        speed: 12,
        pigCurseDuration: 5000,
        colour: '#bf00ffff'
    },
    wizardFireball: {
        aoeStats: aoeStats.wizardAOE,
        colour: '#ff8800da',
        size: 10
    },
    mortarRock: {
        aoeStats: aoeStats.mortarAOE,
        colour: '#a0a0a0',
        size: 13,
        speed: 6,
        lifetime: 9999,
        distance: 300,
        aoeOnDeath: true
    },
    teslaLightning: {
        damage: 220,
        type: 'lightning',
        chainAmount: 1,
        range: 1
    },
    healSpirit: {
        size: 15,
        aoeStats: aoeStats.healSpiritAOE,
        aoeStats2: aoeStats.healSpiritHealAOE,
        colour: '#ffdd00e2',
        distance: 90,
        aoeOnDeath: true
    },
    iceWizardBullet: {
        aoeStats: aoeStats.iceWizardAOE,
        colour: '#00fbffa6',
        size: 8,
        speed: 14
    },
    firecrackerBullet: {
        damage: 64,
        size: 10,
        distance: 144,
        colour: '#ff00f2ff',
        speed: 11,
        splitNumber: 5,
        splitSpread: Math.PI / 4,
        splitStats: {damage: 64, size: 8, distance: 120, colour: '#7e4100ff', pierce: 9999, targetPriority: 'all'}
    },
    eGiantZap: {
        damage: 192,
        stunDuration: 500,
        type: 'lightning',
        ctDamage: 128,
        chainAmount: 1,
        range: 1
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
    },
    bombTowerBomb: {
        name: 'Bomb Tower Bomb',
        symbol: '💣',
        hp: 3000,
        deathAOEStats: aoeStats.bombTowerBombAOE,
        attackSpeed: 2000,
        range: 20,
        viewRange: 150,
        size: 15,
        speed: 0,
        targetPriority: 'ground',
        type: 'bomb',
        hpLostPerSecond: 400
    },
    barbarian: {
        name: 'Barbarian',
        symbol: '😡',
        hp: 670,
        damage: 192,
        attackSpeed: 1300,
        range: 25,
        viewRange: 150,
        size: 20,
        speed: 1,
        targetPriority: 'ground',
        type: 'unit'
    },
    cursedPig: {
        name: 'Cursed Pig',
        symbol: '🐷',
        hp: 629,
        damage: 53,
        attackSpeed: 1200,
        range: 25,
        viewRange: 150,
        size: 20,
        speed: 1.7,
        targetPriority: 'buildings',
        type: 'unit'
    },
    bushGoblin: {
        name: 'Bush Goblin',
        symbol: '🌲',
        hp: 304,
        damage: 256,
        attackSpeed: 1400,
        range: 20,
        viewRange: 150,
        size: 15,
        speed: 1.4,
        targetPriority: 'ground',
        type: 'unit'
    },
    goblin: {
        name: 'Goblin',
        symbol: '🤢',
        hp: 202,
        damage: 120,
        attackSpeed: 1100,
        range: 20,
        viewRange: 150,
        size: 18,
        speed: 1.7,
        targetPriority: 'ground',
        type: 'spell'
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
        speed: 1,
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
        count: 2,
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
        viewRange: 175,
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
        count: 3,
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
        count: 15,
        targetPriority: 'ground',
        type: 'unit'
    },
    fireball: {
        name: 'Fireball',
        symbol: '☄️',
        cost: 4,
        type: 'spell',
        radius: 60,
        damage: 688,
        ctDamage: 207
    },
    arrows: {
        name: 'Arrows',
        symbol: '🎯',
        cost: 3,
        type: 'spell',
        radius: 120,
        damage: 366,
        lifetime: 500,
        ctDamage: 93
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
        rageBoost: 1.3,
        ctDamage: 54
    },
    zap: {
        name: 'Zap',
        symbol: '🌩️',
        cost: 2,
        type: 'spell',
        radius: 60,
        damage: 192,
        lifetime: 500,
        stunDuration: 500,
        ctDamage: 58
    },
    rocket: {
        name: 'Rocket',
        symbol: '🚀',
        cost: 6,
        type: 'spell',
        radius: 48,
        damage: 1484,
        ctDamage: 371
    },
    snowball: {
        name: 'Giant Snowball',
        symbol: '❅',
        cost: 2,
        type: 'spell',
        radius: 60,
        damage: 179,
        slowDuration: 3000,
        slowAmount: 0.7,
        ctDamage: 54,
        knockback: 4
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
        speed: 1,
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
        type: 'spell',
        damage: 0,
        distance: 9999,
        size: 20,
        speed: 4,
        colour: '#b16800ff',
        lifetime: 9999,
        deathSpawnStats: otherUnits.goblin,
        deathSpawnNum: 3 
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
        viewRange: 175,
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
        count: 3,
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
        count: 6,
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
        viewRange: 175,
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
        count: 2,
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
        viewRange: 175,
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
        symbol: '🧊',
        cost: 4,
        type: 'spell',
        radius: 80,
        damage: 115,
        lifetime: 4000,
        freezeDuration: 4000,
        shrink: false,
        canHitHidden: true
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
        viewRange: 175,
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
        count: 5,
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
        symbol: '💠',
        cost: 4,
        hp: 529,
        projectileStats: projectileStats.mArcherArrow,
        attackSpeed: 1100,
        range: 156,
        viewRange: 160,
        size: 20,
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
    },
    guards: {
        name: 'Guards',
        symbol: '☠️',
        cost: 3,
        hp: 81,
        sheildHP: 256,
        damage: 117,
        attackSpeed: 1000,
        range: 25,
        viewRange: 150,
        size: 15,
        speed: 1.4,
        count: 3,
        targetPriority: 'ground',
        type: 'unit'
    },
    recruits: {
        name: 'Royal Recruits',
        symbol: '🪣',
        cost: 7,
        hp: 547,
        sheildHP: 240,
        damage: 133,
        attackSpeed: 1300,
        range: 35,
        viewRange: 150,
        size: 22,
        speed: 1.4,
        count: 6,
        targetPriority: 'ground',
        type: 'unit'
    },
    barbarians: {
        name: 'Barbarians',
        symbol: '😡',
        cost: 5,
        hp: 670,
        damage: 192,
        attackSpeed: 1300,
        range: 25,
        viewRange: 150,
        size: 20,
        speed: 1,
        count: 5,
        targetPriority: 'ground',
        type: 'unit'
    },
    log: {
        name: 'Log',
        symbol: '🪵',
        cost: 2,
        type: 'unit',
        pierce: 9999,
        width: 100,
        height: 30,
        damage: 266,
        distance: 300,
        knockback: 4,
        targetPriority: 'ground',
        speed: 1.5,
        colour: '#b16800',
        lifetime: 9999,
        ctDamage: 40
    },
    musketeer: {
        name: 'Musketeer',
        symbol: '🔫',
        cost: 4,
        hp: 721,
        projectileStats: projectileStats.musketeerBullet,
        attackSpeed: 1000,
        range: 140,
        viewRange: 150,
        size: 22,
        speed: 1.0,
        targetPriority: 'all',
        type: 'unit'
    },
    eBarbarians: {
        name: 'Elite Barbarians',
        symbol: '🗡️',
        cost: 6,
        hp: 1341,
        damage: 384,
        attackSpeed: 1400,
        range: 25,
        viewRange: 150,
        size: 20,
        speed: 1.4,
        count: 2,
        targetPriority: 'ground',
        type: 'unit'
    },
    skeletonDragons: {
        name: 'Skeleton Dragons',
        symbol: '🦎',
        cost: 4,
        hp: 560,
        projectileStats: projectileStats.skeletonDragonFireBall,
        attackSpeed: 1900,
        range: 84,
        viewRange: 150,
        size: 20,
        speed: 1.7,
        count: 2,
        targetPriority: 'all',
        type: 'flying'
    },
    spearGoblins: {
        name: 'Spear Goblins',
        symbol: '👺',
        cost: 2,
        hp: 133,
        projectileStats: projectileStats.spearGoblinSpear,
        attackSpeed: 1700,
        range: 120,
        viewRange: 150,
        size: 18,
        speed: 1.7,
        count: 3,
        targetPriority: 'all',
        type: 'unit'
    },
    goblins: {
        name: 'Goblins',
        symbol: '🤢',
        cost: 2,
        hp: 202,
        damage: 120,
        attackSpeed: 1100,
        range: 23,
        viewRange: 150,
        size: 18,
        speed: 1.7,
        count: 4,
        targetPriority: 'ground',
        type: 'unit'
    },
    eSpirit: {
        name: 'Electro Spirit',
        symbol: '⚡️',
        cost: 1,
        hp: 230,
        projectileStats: projectileStats.eSpiritLightning,
        attackSpeed: 2000,
        range: 60,
        viewRange: 150,
        size: 15,
        speed: 1.7,
        targetPriority: 'all',
        type: 'unit',
        dieOnAttack: true
    },
    eDragon: {
        name: 'Electro Dragon',
        symbol: '🎸',
        cost: 5,
        hp: 949,
        projectileStats: projectileStats.eDragonLightning,
        attackSpeed: 2100,
        range: 84,
        viewRange: 150,
        size: 25,
        speed: 1,
        targetPriority: 'all',
        type: 'flying'
    },
    iDragon: {
        name: 'Inferno Dragon',
        symbol: '🐲',
        cost: 4,
        hp: 1295,
        beamDamage: [35, 120, 422],
        damageStageTime: 2000,
        attackSpeed: 400,
        range: 84,
        viewRange: 150,
        size: 25,
        speed: 1,
        targetPriority: 'all',
        type: 'flying'
    },
    xBow: {
        name: 'X-Bow',
        symbol: '💘',
        cost: 6,
        hp: 1600,
        projectileStats: projectileStats.xBowBullet,
        attackSpeed: 300,
        range: 276,
        viewRange: 276,
        size: 25,
        speed: 0,
        targetPriority: 'all',
        type: 'building',
        hpLostPerSecond: 27.4
    },
    infernoTower: {
        name: 'Inferno Tower',
        symbol: '💥',
        cost: 5,
        hp: 1748,
        beamDamage: [43, 158, 847],
        damageStageTime: 2000,
        attackSpeed: 400,
        range: 144,
        viewRange: 150,
        size: 25,
        speed: 0,
        targetPriority: 'all',
        type: 'building'
    },
    bombTower: {
        name: 'Bomb Tower',
        symbol: '🧯',
        cost: 4,
        hp: 1356,
        projectileStats: projectileStats.bombTowerBullet,
        deathSpawnNum: 1,
        deathSpawnStats: otherUnits.bombTowerBomb,
        attackSpeed: 1800,
        range: 144,
        viewRange: 150,
        size: 25,
        speed: 0,
        targetPriority: 'all',
        type: 'building'
    },
    royalGhost: {
        name: 'Royal Ghost',
        symbol: '👻',
        cost: 3,
        hp: 1210,
        aoeStats: aoeStats.royalGhostAOE,
        attackSpeed: 1800,
        range: 30,
        viewRange: 150,
        size: 25,
        speed: 1.4,
        targetPriority: 'ground',
        type: 'unit',
        invisTime: 1800,
        spawnInvis: true
    },
    princess: {
        name: 'Princess',
        symbol: '🎉',
        cost: 3,
        hp: 261,
        projectileStats: projectileStats.princessArrows,
        attackSpeed: 3000,
        range: 216,
        viewRange: 216,
        size: 20,
        speed: 1.0,
        targetPriority: 'all',
        type: 'unit'
    },
    babyDragon: {
        name: 'Baby Dragon',
        symbol: '🐉',
        cost: 4,
        hp: 1152,
        projectileStats: projectileStats.babyDragonFire,
        attackSpeed: 1500,
        range: 84,
        viewRange: 150,
        size: 20,
        speed: 1.4,
        targetPriority: 'all',
        type: 'flying'
    },
    darkPrince: {
        name: 'Dark Prince',
        symbol: '🪻',
        cost: 4,
        hp: 1200,
        sheildHP: 240,
        aoeStats: aoeStats.darkPrinceAOE,
        chargeAOEStats: aoeStats.darkPrinceAOE,
        chargeSpeed: 1.7,
        chargeTriggerDistance: 60,
        attackSpeed: 1300,
        range: 40,
        viewRange: 150,
        size: 25,
        speed: 1.0,
        targetPriority: 'ground',
        type: 'unit'
    },
    beserker: {
        name: 'Beserker',
        symbol: '👧',
        cost: 2,
        hp: 896,
        damage: 102,
        attackSpeed: 600,
        range: 25,
        viewRange: 150,
        size: 20,
        speed: 1.4,
        targetPriority: 'ground',
        type: 'unit'
    },
    miner: {
        name: 'Miner',
        symbol: '🪏',
        cost: 3,
        hp: 1210,
        damage: 194,
        attackSpeed: 1300,
        range: 40,
        viewRange: 150,
        size: 22,
        speed: 1.4,
        targetPriority: 'ground',
        type: 'spell'
    },
    battleRam: {
        name: 'Battle Ram',
        symbol: '🐏',
        cost: 4,
        hp: 967,
        damage: 286,
        deathSpawnNum: 2,
        deathSpawnStats: otherUnits.barbarian,
        chargeDamage: 573,
        chargeSpeed: 1.7,
        chargeTriggerDistance: 60,
        attackSpeed: 9999,
        range: 30,
        viewRange: 150,
        size: 25,
        speed: 1,
        targetPriority: 'buildings',
        type: 'unit',
        dieOnAttack: true
    },
    bomber: {
        name: 'Bomber',
        symbol: '💣',
        cost: 2,
        hp: 304,
        projectileStats: projectileStats.bomberBomb,
        attackSpeed: 1800,
        range: 108,
        viewRange: 150,
        size: 20,
        speed: 1,
        targetPriority: 'ground',
        type: 'unit'
    },
    royalHogs: {
        name: 'Royal Hogs',
        symbol: '🐷',
        cost: 5,
        hp: 837,
        damage: 74,
        attackSpeed: 1200,
        range: 25,
        viewRange: 150,
        size: 20,
        speed: 1.7,
        count: 4,
        targetPriority: 'buildings',
        type: 'unit'
    },
    eWizard: {
        name: 'Electro Wizard',
        symbol: '🔌',
        cost: 4,
        hp: 714,
        projectileStats: projectileStats.eWizardLightning,
        attackSpeed: 1800,
        range: 120,
        viewRange: 150,
        size: 20,
        speed: 1.4,
        targetPriority: 'all',
        type: 'unit',
        spawnAOEStats: aoeStats.eWizardSpawnAOE
    },
    goblinGang: {
        name: 'Goblin Gang',
        cost: 3,
        symbol: '🤢👺'
    },
    barbarianBarrel: {
        name: 'Barbarian Barrel',
        symbol: '🛢️',
        cost: 2,
        type: 'unit',
        pierce: 9999,
        width: 70,
        height: 40,
        damage: 240,
        distance: 150,
        targetPriority: 'ground',
        speed: 2,
        colour: '#b16800ff',
        lifetime: 99999,
        deathSpawnStats: otherUnits.barbarian
    },
    motherWitch: {
        name: 'Mother Witch',
        symbol: '🧙‍♀️',
        cost: 4,
        hp: 529,
        projectileStats: projectileStats.motherWitchBullet,
        attackSpeed: 900,
        range: 132,
        viewRange: 150,
        size: 20,
        speed: 1.0,
        targetPriority: 'all',
        type: 'unit'
    },
    battleHealer: {
        name: 'Battle Healer',
        symbol: '❤️‍🩹',
        cost: 4,
        hp: 1717,
        damage: 148,
        attackAOE: aoeStats.battleHealerAOE,
        attackSpeed: 1500,
        range: 38,
        viewRange: 150,
        size: 25,
        speed: 1,
        targetPriority: 'ground',
        type: 'unit',
        spawnAOEStats: aoeStats.battleHealerSpawnAOE
    },
    wizard: {
        name: 'Wizard',
        symbol: '🪄',
        cost: 5,
        hp: 755,
        projectileStats: projectileStats.wizardFireball,
        attackSpeed: 1400,
        range: 132,
        viewRange: 150,
        size: 20,
        speed: 1,
        targetPriority: 'all',
        type: 'unit'
    },
    mortar: {
        name: 'Mortar',
        symbol: '🪨',
        cost: 4,
        hp: 1369,
        projectileStats: projectileStats.mortarRock,
        attackSpeed: 5000,
        range: {min: 84, max: 276},
        viewRange: {min: 84, max: 276},
        size: 25,
        speed: 0,
        targetPriority: 'ground',
        type: 'building',
        hpLostPerSecond: 45.6
    },
    tesla: {
        name: 'Tesla',
        symbol: '🧂',
        cost: 4,
        hp: 1152,
        projectileStats: projectileStats.teslaLightning,
        attackSpeed: 1100,
        range: 132,
        viewRange: 132,
        size: 25,
        speed: 0,
        targetPriority: 'all',
        type: 'building',
        hpLostPerSecond: 38.4,
        canHide: true
    },
    skeletonBarrel: {
        name: 'Skeleton Barrel',
        symbol: '🛢️',
        cost: 3,
        hp: 532,
        damage: 312,
        deathAOEStats: aoeStats.golemDeathAOE,
        deathSpawnNum: 7,
        deathSpawnStats: otherUnits.skeleton,
        attackSpeed: 2500,
        range: 26,
        viewRange: 175,
        size: 22,
        speed: 1.4,
        targetPriority: 'buildings',
        type: 'flying',
        dieOnAttack: true
    },
    eGiant: {
        name: 'Electro Giant', 
        symbol: '💪🏿',
        cost: 7, 
        hp: 3855, 
        damage: 163,
        reflectedStats: projectileStats.eGiantZap,
        reflectionRadius: 72,
        attackSpeed: 2100, 
        range: 35, 
        viewRange: 175,
        size: 30,
        speed: 0.7, 
        targetPriority: 'buildings', 
        type: 'unit'
    },
    healSpirit: {
        name: 'Heal Spirit',
        symbol: '✚',
        cost: 1,
        hp: 230,
        projectileStats: projectileStats.healSpirit,
        attackSpeed: 2000,
        range: 60,
        viewRange: 150,
        size: 15,
        speed: 1.7,
        targetPriority: 'all',
        type: 'unit',
        dieOnAttack: true
    },
    iceWizard: {
        name: 'Ice Wizard',
        symbol: '🥶',
        cost: 3,
        hp: 688,
        projectileStats: projectileStats.iceWizardBullet,
        attackSpeed: 1700,
        range: 132,
        viewRange: 150,
        size: 20,
        speed: 1,
        targetPriority: 'all',
        type: 'unit',
        spawnAOEStats: aoeStats.iceWizardSpawnAOE
    },
    firecracker: {
        name: 'Firecracker',
        symbol: '🎉',
        cost: 3,
        hp: 304,
        projectileStats: projectileStats.firecrackerBullet,
        attackSpeed: 3000,
        range: 144,
        viewRange: 150,
        size: 20,
        speed: 1.4,
        targetPriority: 'all',
        type: 'unit',
        recoil: 4
    },
    suspiciousBush: {
        name: 'Suspicious Bush',
        symbol: '🌳',
        cost: 2,
        hp: 81,
        damage: 0,
        deathSpawnNum: 2,
        deathSpawnStats: otherUnits.bushGoblin,
        attackSpeed: 2000,
        range: 30,
        viewRange: 150,
        size: 22,
        speed: 1,
        targetPriority: 'buildings',
        type: 'unit',
        invisTime: 1,
        spawnInvis: true,
        dieOnAttack: true
    },
    tombstone: {
        name: 'Tombstone',
        symbol: '🪦',
        cost: 3,
        hp: 529,
        damage: 0,
        supportSpawnNum: 2,
        supportSpawnSpeed: 3500,
        supportStats: otherUnits.skeleton,
        deathSpawnNum: 4,
        deathSpawnStats: otherUnits.skeleton,
        range: 132,
        viewRange: 150,
        size: 25,
        speed: 0,
        targetPriority: 'ground',
        type: 'building',
        hpLostPerSecond: 17.6
    }
};

const playerUnits = {
    unit1: null,
    unit2: null,
    unit3: null,
    unit4: null,
    unit5: null,
    unit6: null,
    unit7: null,
    unit8: null
};

const randomPlayerUnits = {
    unit1: true,
    unit2: true,
    unit3: true,
    unit4: true,
    unit5: true,
    unit6: true,
    unit7: true,
    unit8: true
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
    unit1: units.goblinBarrel,
    unit2: units.goblinBarrel,
    unit3: units.goblinBarrel,
    unit4: units.goblinBarrel,
    unit5: units.goblinBarrel,
    unit6: units.goblinBarrel,
    unit7: units.goblinBarrel,
    unit8: units.goblinBarrel
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
let timerIntervalID = null;

let playerKingActivated = false;
let playerTowerDead = {left: false, right: false, king: false};

let enemyKingActivated = false;
let enemyTowerDead = {left: false, right: false, king: false};

let gameFinished = false;

let timePassed = 0;
let timeLeft = 120;
let overtimeLeft = 180;
let elixirMult = 1;

let crowns = Number(localStorage.crowns) || 0;

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
        if (p.dead) {
            let y = p.stats.height ? p.y + p.stats.height : p.y;
            if (p.stats.deathSpawnStats) {
                if (p.stats.deathSpawnNum == 3) {
                    entities.push(new UnitEntity(p.x + 10, y, p.team, p.stats.deathSpawnStats));
                    entities.push(new UnitEntity(p.x, y + 10, p.team, p.stats.deathSpawnStats));
                    entities.push(new UnitEntity(p.x - 10, y, p.team, p.stats.deathSpawnStats));
                } else {
                    entities.push(new UnitEntity(p.x, y, p.team, p.stats.deathSpawnStats));
                }
            }
            if (p.stats.splitStats) p.split();
            projectiles.splice(i, 1);
        }
        else p.update();
    }

    for (let i = 0; i < entities.length; i++) {
        let e = entities[i];
        
        if (e.dead) {
            if (e.stats) {
                if (e.stats.name == 'king') {
                    if (e.team == 'player') playerTowerDead = {left: true, right: true, king: true};
                    else enemyTowerDead = {left: true, right: true, king: true};
                    gameover(e.team);
                }

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
                        (e.x < c.width / 2) ? playerTowerDead.left = true : playerTowerDead.right = true;
                    } else {
                        enemyKingActivated = true;
                        (e.x < c.width / 2) ? enemyTowerDead.left = true : enemyTowerDead.right = true;
                    }
                }
            }

            if (e.pigCurseTime > 0) {
                let team = (e.team == 'player') ? 'enemy' : 'player';
                entities.push(new UnitEntity(e.x, e.y, team, otherUnits.cursedPig));
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
        let stats = playerUnits[playerHand[mouse.selection]];

        let x = mouse.x;
        let y = mouse.y;

        if (stats.type != 'spell') {
            let newPos = findMax(x, y);
            if (newPos.x) x = newPos.x;
            if (newPos.y) y = newPos.y;
        }

        ctx.lineWidth = 1;
        ctx.fillStyle = '#a5a5a574';

        if (stats.range) {
            if (stats.range.max) {
                ctx.beginPath();
                ctx.arc(x, y, stats.range.max, 0, 2 * Math.PI);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(x, y, stats.range, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
        
        if (stats.width) {
            ctx.beginPath();
            ctx.fillRect(x - stats.width / 2, y - stats.distance, stats.width, stats.distance + stats.height / 2);
            ctx.fill();
        }

        if (stats.type == 'spell' && !stats.hp && !stats.width) {
            ctx.beginPath();
            ctx.arc(x, y, stats.radius, 0, 2 * Math.PI);
            ctx.fill();
        }

        if (stats.spawnAOEStats) {
            ctx.beginPath();
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.arc(x, y, stats.spawnAOEStats.radius, 0, 2 * Math.PI);
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.fillStyle = '#000000';
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }

    runGameTime();

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
        this.sheildHP = stats.sheildHP || 0;
        this.dead = false;
        this.freezeTime = 0;
        this.slowTime = 0;
        this.slowAmount = 1;
        this.rageBoost = 1;
        this.stunTime = 0;
        this.supportSpawnCooldown = this.stats.supportSpawnSpeed / 4;
        this.charging = false;
        this.isAttacking = false;
        this.attackTime = 0;
        this.nonAttackTime = 0;
        this.invisible = false;
        this.hidden = false;
        this.pigCurseTime = 0;

        if (stats.spawnInvis) this.invisible = true;
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

        if (this.stats.reflectionRadius) {
            ctx.beginPath();
            ctx.fillStyle = (this.team == 'player') ? '#00e1ff3c' : '#b900003c';
            ctx.arc(this.x, this.y, this.stats.reflectionRadius, 0, 2 * Math.PI);
            ctx.fill();
        }

        //Circle
        let opacity = this.invisible ? '30' : 'a1';
        ctx.fillStyle = (this.team == 'player') ? ('#3845ff' + opacity) : ('#ff4343' + opacity);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.stats.size, 0, 2 * Math.PI);
        ctx.fill();

        //Symbol
        ctx.fillStyle = this.invisible ? '#ffffff63' : '#ffffff';
        ctx.font = `${this.stats.size + 5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.stats.symbol, this.x, this.y);

        

        //Draw crown tower hp
        if (this.stats.name == 'king' || this.stats.name == 'princess') {
            //Heathbar outer
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x - this.stats.size, this.y + this.stats.size + 3, this.stats.size * 2, 15);

            //Healthbar inner
            ctx.fillStyle = '#009607ff';
            ctx.fillRect(this.x - this.stats.size + 2, this.y + this.stats.size + 5, (this.stats.size * (this.hp / this.stats.hp) * 2)- 4, 11);

            //Health Number
            ctx.fillStyle = (this.team == 'player') ? '#3845ff' : '#fa1d1dff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(Math.round(this.hp).toString(), this.x - this.stats.size + 2, this.y + this.stats.size + 4);
        } else {
            //Heathbar outer
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x - this.stats.size, this.y + this.stats.size + 3, this.stats.size * 2, 10);

            //Healthbar inner
            ctx.fillStyle = '#009607ff';
            ctx.fillRect(this.x - this.stats.size + 2, this.y + this.stats.size + 5, (this.stats.size * (this.hp / this.stats.hp) * 2)- 4, 6);
        }

        //Draw shield
        if (this.sheildHP > 1) {
            ctx.fillStyle = '#b1a500ff';
            ctx.fillRect(this.x - this.stats.size + 2, this.y + this.stats.size + 5, (this.stats.size * (this.sheildHP / this.stats.sheildHP) * 2)- 4, 6);
        }
        
        //Draw if frozen
        if (this.freezeTime > 1) {
            ctx.beginPath();
            ctx.fillStyle = '#3fdfff93';
            ctx.arc(this.x, this.y, this.stats.size, 0, 2*Math.PI);
            ctx.fill();
        } else if (this.slowTime > 1) {
            ctx.beginPath();
            ctx.fillStyle = '#3fdfff35';
            ctx.arc(this.x, this.y, this.stats.size, 0, 2*Math.PI);
            ctx.fill();
        } 
        //Draw if rage boosted
        else if (this.rageBoost > 1) {
            ctx.beginPath();
            ctx.fillStyle = '#e600ff93';
            ctx.arc(this.x, this.y, this.stats.size, 0, 2*Math.PI);
            ctx.fill();
        }

        //Draw if charging
        if (this.charging) {
            ctx.beginPath();
            ctx.fillStyle = '#fbff0055';
            ctx.arc(this.x, this.y, this.stats.size, 0, 2 * Math.PI);
            ctx.fill();
        }

        //Draw pig curse
        if (this.pigCurseTime > 1) {
            ctx.beginPath();
            ctx.fillStyle = '#fb00ff55';
            ctx.arc(this.x, this.y, this.stats.size, 0, 2 * Math.PI);
            ctx.fill();
        }

        if (this.hidden) {
            ctx.beginPath();
            ctx.fillStyle = '#b16800';
            ctx.arc(this.x, this.y, this.stats.size, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.strokeStyle = '#623900ff';
            ctx.moveTo(this.x, this.y - this.stats.size);
            ctx.lineTo(this.x, this.y + this.stats.size);
            ctx.stroke();
        }

        //Draw beam
        if (this.stats.beamDamage && this.isAttacking) {
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#ffa200ff';
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.target.x, this.target.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ff0000ff';
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.target.x, this.target.y);
            ctx.stroke();
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
            ctx.strokeStyle = 'blue';
            ctx.arc(this.x, this.y, this.stats.dashRange.min, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.stats.dashRange.max, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    takeDamage(amount, e = null) {
        if (this.sheildHP > 0) {
            this.sheildHP -= amount;
            if (Number.isNaN(this.sheildHP)) console.error('Damage is NaN. Unit: ', e);
            return;
        }

        if (this.hp <= amount) {
            this.dead = true;
        } else {
            this.hp -= amount;
            if (Number.isNaN(this.hp)) console.error('Damage is NaN. Unit: ', e);
        }

        if (this.stats.reflectedStats && e) {
            let dist = M.dist(this, e);
            if (dist - e.stats.size < this.stats.reflectionRadius) {
                projectiles.push(new ChainLighning(e.x, e.y, this.x, this.y, this.stats.reflectedStats, this.team, e, this));
            }
        }
    }

    heal(amount) {
        if (this.stats.name == 'princess' || this.stats.name == 'king') return;
        if (amount + this.hp < this.stats.hp) {
            this.hp += amount;
        } else {
            this.hp = this.stats.hp;
        }
    }

    attack(target) {
        if (target && this.attackCooldown < 1) {
            if (this.stats.beamDamage) {
                if (this.attackTime < this.stats.damageStageTime) {
                    target.takeDamage(this.stats.beamDamage[0], this);
                } else if (this.attackTime < this.stats.damageStageTime) {
                    target.takeDamage(this.stats.beamDamage[1], this);
                } else {
                    target.takeDamage(this.stats.beamDamage[2], this);
                }
                
            } else {
                if (this.charging) {
                    target.takeDamage(this.stats.chargeDamage, this);
                } else {
                    target.takeDamage(this.stats.damage, this);
                }
            }

            if (this.stats.attackAOE) {
                aoes.push(new AOE(this.x, this.y, this.stats.attackAOE, this.team));
            }

            this.attackTime += this.stats.attackSpeed;
            this.attackCooldown = this.stats.attackSpeed;
        }
    }

    aoeAttack(x, y, stats) {
        if (this.attackCooldown < 1) {
            if (this.stats.name == 'Wall Breakers') {
                aoes.push(new AOE(this.target.x, this.target.y, stats, this.team));
                this.dead = true;
            } else if ((this.stats.name == 'Mega Knight' && stats.id == 'attack') || this.stats.name == 'Royal Ghost' || this.stats.name == 'Dark Prince') {
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
            if (this.stats.projectileStats.type == 'lightning') {
                projectiles.push(new ChainLighning(this.target.x, this.target.y, this.x, this.y, this.stats.projectileStats, this.team, 'all', this));
            } else {
                if (this.stats.projectileStats.targetPriority == 'all' || this.stats.projectileStats.targetPriority == 'ground') {
                    projectiles.push(new Projectile(this.x, this.y, this.stats.projectileStats, dir, this.team, 'all', this));
                } else {
                    projectiles.push(new Projectile(this.x, this.y, this.stats.projectileStats, dir, this.team, this.target, this));
                }
            }

            if (this.stats.recoil && this.knockbackVel) {
                this.knockbackVel.x -= dir.x * this.stats.recoil;
                this.knockbackVel.y -= dir.y * this.stats.recoil;
            }

            this.attackCooldown = this.stats.attackSpeed;
        }
    }

    spawnSupport() {
        if (this.supportSpawnCooldown < 1) {
            if (this.stats.supportSpawnNum == 4) {
                entities.push(new UnitEntity(this.x + 50, this.y, this.team, this.stats.supportStats));
                entities.push(new UnitEntity(this.x - 50, this.y, this.team, this.stats.supportStats));
                entities.push(new UnitEntity(this.x, this.y + 50, this.team, this.stats.supportStats));
                entities.push(new UnitEntity(this.x, this.y - 50, this.team, this.stats.supportStats));
            } else if (this.stats.supportSpawnNum == 2) {
                entities.push(new UnitEntity(this.x, this.y, this.team, this.stats.supportStats));
                entities.push(new UnitEntity(this.x, this.y, this.team, this.stats.supportStats));
            }

            this.supportSpawnCooldown = this.stats.supportSpawnSpeed;
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
}

class UnitEntity extends Entity {
    constructor(x, y, team, stats) {
        super(x, y, team, stats);
        this.target = null;
        this.dashTime = 0;
        this.dashPauseTime = 0;
        this.distance = 0;
        this.knockbackVel = {x: 0, y: 0};

        if (this.stats.spawnAOEStats) this.aoeAttack(this.x, this.y, this.stats.spawnAOEStats);
        if (this.stats.spawnInvis) this.nonAttackTime = this.stats.invisTime;
    }

    update() {
        if (Number.isNaN(this.hp)) {
            this.dead = true;
            return;
        }

        if (this.target && this.target.invisible) this.target = null;

        if (!this.target || this.target.dead) {
            this.attackTime = 0;
            this.attacking = false;
        }

        if (this.stunTime > 0) {
            this.stunTime -= 1000 / 60;
            if (this.dashTime) this.dashTime = 0;
            this.charging = false;
            this.distance = 0;
            this.attackTime = 0;
            this.isAttacking = false;
            return;
        }

        if (this.slowTime > 0) this.slowTime -= 1000 / 60;
        else this.slowAmount = 1;
        if (this.freezeTime > 0) {
            this.freezeTime -= 1000 / 60;
            if (this.dashTime) this.dashTime = 0;
            this.distance = 0;
            this.charging = false;
            this.attackTime = 0;
            this.isAttacking = false;
            return;
        }

        if (!this.isAttacking) this.nonAttackTime += 1000 / 60;
        if (this.stats.invisTime && this.nonAttackTime > this.stats.invisTime) this.invisible = true;
        else this.invisible = false;

        if (this.attackCooldown > 0) this.attackCooldown -= 1000 / 60 * this.slowAmount * this.rageBoost;
        if (this.supportSpawnCooldown > 0 && this.stats.supportSpawnSpeed) this.supportSpawnCooldown -= 1000 / 60 * this.slowAmount * this.rageBoost;
        if (this.pigCurseTime > 0) this.pigCurseTime -= 1000 / 60;

        if (this.stats.hpLostPerSecond) {
            this.takeDamage(this.stats.hpLostPerSecond / (1000 / 60) / 4);
        }

        if (this.stats.type == 'bomb') return;

        //Apply knockback
        if (this.knockbackVel && (this.knockbackVel.x != 0 || this.knockbackVel.y != 0)) {
            this.x += this.knockbackVel.x;
            this.y += this.knockbackVel.y;
            this.knockbackVel.x *= 0.9;
            this.knockbackVel.y *= 0.9;

            this.charging = false;
            this.distance = 0;
        }

        this.checkDash();
        this.checkCharge();
        this.checkRageBoost();
        this.spawnSupport();
        this.findTarget();

        if (!this.target) return;

        let minRange = this.stats.range.min || 0;
        let maxRange = this.stats.range.max || this.stats.range;

        let dist = M.dist(this.x, this.y, this.target.x, this.target.y);
        let hasDash = this.stats.dashDamage || this.stats.dashAOEStats;
        let canDash = hasDash 
                    && dist > this.stats.dashRange.min + this.target.stats.size 
                    && dist < this.stats.dashRange.max + this.target.stats.size 
                    && this.target 
                    && this.target.stats.type != 'waypoint';
        let distCheck = false;
        if (minRange > 0) distCheck = (dist - this.target.stats.size < maxRange && dist - this.target.stats.size > minRange);
        else distCheck = dist - this.target.stats.size < maxRange;

        if (canDash) {
            if (this.dashTime < 100) {
                this.dashTime = 1000 + this.stats.dashPauseTime;
                this.dashPauseTime = this.stats.dashPauseTime;
            }
        } else if (distCheck && this.target.stats.size > 0) {
            if (this.stats.aoeStats) {
                if (this.charging) this.aoeAttack(this.x, this.y, this.stats.chargeAOEStats);
                else this.aoeAttack(this.x, this.y, this.stats.aoeStats);
            } else if (this.stats.projectileStats) {
                this.shoot(this.target);
            } else if (this.stats.beamDamage) {
                this.attack(this.target);
            } else {
                this.attack(this.target);
            }
            if (this.stats.dieOnAttack) {
                this.dead = true;
                return;
            }
            this.isAttacking = true;
            this.charging = false;
            this.distance = 0;
            this.nonAttackTime = 0;
        } else {
            this.isAttacking = false;
            this.attackTime = 0;
            if (this.dashTime <= 1 && !this.charging) this.moveTowards(this.target);
        }

        if (this.stats.type != 'building' && this.stats.type != 'bomb') this.collide();
        this.wallCol();
    }

    findTarget() {
        if (this.target && !this.target.dead && this.isAttacking && this.target.stats.type != 'waypoint') return;

        let minDist = Infinity;
        let closestEnemy = null;
        for (let i = 0; i < entities.length; i++) {
            let e = entities[i];
            if (e.team == this.team || e.stats.type == 'bomb' || e.invisible || e.hidden) continue;

            let dist = M.dist(this.x, this.y, e.x, e.y) - e.stats.size;

            let minRange = this.stats.viewRange.min || 0;
            let maxRange = this.stats.viewRange.max || this.stats.viewRange;
            let check = false;
            if (minRange > 0) check = (dist < minDist && dist < maxRange && dist > minRange);
            else check = (dist < minDist && dist < maxRange);
            
            if (check) {
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
            this.hidden = false;
            this.target = closestEnemy;
        } else {
            if (this.stats.canHide) this.hidden = true;
            let princessLeft = null;
            let princessRight = null;
            let king = null;

            for (let i = 0; i < entities.length; i++) {
                let e = entities[i];
                if (e.team == this.team) continue;

                if (e.stats.name == 'princess') {
                    if (e.x < c.width / 2) princessLeft = e;
                    else princessRight = e;
                }

                if (e.stats.name == 'king') king = e;
            }

            let onLeft = this.x < c.width / 2;
            let princess = onLeft ? princessLeft : princessRight;

            let bridgeX = onLeft ? game.laneLeftX : game.laneRightX;
            let bridgeY = (this.team == 'player') ? game.river - game.riverWidth / 2 : game.river + game.riverWidth / 2;

            let onOwnSide = (this.team == 'player') ? this.y > game.river : this.y < game.river;

            if (onOwnSide && this.stats.type != 'flying') {
                if (!(M.dist(this.x, this.y, bridgeX, game.river) < this.stats.speed + 1)) {
                    this.target = {x: bridgeX, y: bridgeY, stats:{size: 0, type: 'waypoint'}};
                    return;
                }
            }

            if (princess) {
                this.target = princess;
                return;
            }

            this.target = king;
            return;
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
                if (this.y + this.stats.size > riverTop && this.y < riverTop) {
                    this.y = riverTop - this.stats.size;
                }
                if (this.y - this.stats.size < riverBottom && this.y > riverBottom) {
                    this.y = riverBottom + this.stats.size;
                }
                if (!(this.y + this.stats.size < riverTop) && !(this.y - this.stats.size > riverBottom)) {
                    this.y = this.y > game.river ? riverBottom + this.stats.size : riverTop - this.stats.size;
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
                    this.target.takeDamage(this.stats.dashDamage, this);
                }
                this.dashTime = 0;
                this.attackCooldown = this.stats.attackSpeed;
                return;
            } else {
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

    applyKnockback(dir, amount) {
        if (this.stats.type != 'building') {
            this.knockbackVel.x += dir.x * amount;
            this.knockbackVel.y += dir.y * amount;
        }
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

        if (this.target && this.target.invisible) this.target = null;

        if (this.stunTime > 0) {
            this.stunTime -= 1000 / 60;
            return;
        }

        if (this.slowTime > 0) this.slowTime -= 1000 / 60;
        else this.slowAmount = 1;
        if (this.freezeTime > 0) {
            this.freezeTime -= 1000 / 60;
            return;
        } 

        if (this.attackCooldown > 0) {
            this.attackCooldown -= 1000 / 60 * this.slowAmount * this.rageBoost;
        }

        if (this.target && M.dist(this, this.target) + this.target.stats.size > this.stats.range) {
            this.isAttacking = false;
        }

        this.checkRageBoost();
        this.findTarget();

        if (this.target) {
            this.isAttacking = true;
            if (this.team == 'player') {
                if (playerKingActivated || this.stats.name != 'king') this.shoot(this.target);
            } else {
                if (enemyKingActivated || this.stats.name != 'king') this.shoot(this.target);
            }
        }
    }

    findTarget() {
        if (this.target && !this.target.dead && this.isAttacking) return;

        let minDist = Infinity;
        let closestEnemy = null;
        for (let i = 0; i < entities.length; i++) {
            let e = entities[i];
            if (e.team == this.team || e.stats.type == 'bomb' || e.invisible || e.hidden) continue;

            let dist = M.dist(this.x, this.y, e.x, e.y);

            if (dist < minDist && dist < this.stats.range + e.stats.size) {
                minDist = dist;
                closestEnemy = e;
            }
        }

        this.target = closestEnemy;
    }

    takeDamage(amount, e = null) {
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
    constructor(x, y, stats, team, owner = null) {
        this.x = x;
        this.y = y;
        this.stats = stats;
        this.radius = this.stats.radius;
        this.lifetime = stats.lifetime || 250;
        this.originalRadius = this.stats.radius;
        this.team = team;
        this.dead = false;
        this.target = stats.target || 'all';
        this.owner = owner;

        if (!this.stats.lifetime) this.stats.lifetime = 250;

        this.aoeDamage();
    }

    draw() {
        ctx.beginPath();
        if (this.stats.rageBoost > 1) ctx.fillStyle = '#ff32f85d';
        else if (this.stats.freezeDuration > 1) ctx.fillStyle = '#00c8ffc5';
        else if (this.stats.heal) ctx.fillStyle = '#30b40071';
        else ctx.fillStyle = this.team === 'player' ? '#00046f79' : '#ff840059';
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI); 
        ctx.fill();
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
            if (e.stats.type == 'bomb') continue;
            if (e.hidden && !this.stats.canHitHidden) continue;

            if (this.stats.target == 'ground' && e.stats.type == 'flying') continue;

            let minDist = this.radius + e.stats.size;

            if (M.dist(this, e) < minDist) {
                if (e.team != this.team) {
                    if (this.stats.freezeDuration) e.freezeTime += this.stats.freezeDuration;

                    if (this.stats.slowDuration) {
                        e.slowTime += this.stats.slowDuration;
                        e.slowAmount = this.stats.slowAmount;
                    }

                    if (this.stats.stunDuration) e.stunTime += this.stats.stunDuration;

                    if (this.stats.ctDamage && (e.stats.name == 'king' || e.stats.name == 'princess')) e.takeDamage(this.stats.ctDamage, this.owner);
                    else e.takeDamage(this.stats.damage, this.owner);
                    if (this.stats.stunDuration) e.stunTime = this.stats.stunDuration;

                    if (this.stats.knockback && e.knockbackVel) {
                        let dir = M.normalise(e.x - this.x, e.y - this.y);
                        e.applyKnockback(dir, this.stats.knockback);
                    }
                } else {
                    if (this.stats.heal) e.heal(this.stats.heal);
                }
            }
        }
    }
}

class Projectile {
    constructor(x, y, stats, direction, team, target = 'all', owner = null) {
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
        this.owner = owner;

        if (!this.stats.size) this.stats.size = 5;
        if (!this.stats.speed) this.stats.speed = 10;
        if (!this.stats.distance) this.stats.distance = 200;
    }

    draw() {
        if (this.stats.width) {
            ctx.beginPath();
            if (this.stats.colour) ctx.fillStyle = this.stats.colour;
            else ctx.fillStyle = '#000';
            let x = -this.stats.width / 2 + this.x;
            let y = this.stats.height / 2 + this.y;
            ctx.fillRect(x, y, this.stats.width, this.stats.height);
        } else {
            ctx.beginPath();
            if (this.stats.colour) ctx.fillStyle = this.stats.colour;
            else ctx.fillStyle = '#000';
            ctx.arc(this.x, this.y, this.stats.size, 0, 2*Math.PI);
            ctx.fill();
        }
    }

    update() {
        if (this.lifetime > 0) {
            this.lifetime -= 1000 / 60;
        } else {
            this.dead = true;
            if (this.stats.aoeOnDeath) aoes.push(new AOE(this.x, this.y, this.stats.aoeStats, this.team, this.owner));
            return;
        }
        if (this.distance > this.stats.distance) {
            this.dead = true;
            if (this.stats.aoeOnDeath) aoes.push(new AOE(this.x, this.y, this.stats.aoeStats, this.team, this.owner));
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
                if (u.hidden && !this.stats.canHitHidden) continue;
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

                if (this.stats.width) {
                    let x = -this.stats.width / 2 + this.x;
                    let y = this.stats.height / 2 + this.y;

                    let closestX = Math.max(x, Math.min(u.x, x + this.stats.width));
                    let closestY = Math.max(y, Math.min(u.y, y + this.stats.height));

                    //let dist = M.dist(u.x - closestX, u.y - closestY);
                    let dx = u.x - closestX;
                    let dy = u.y - closestY;

                    if (Math.sqrt(dx * dx + dy * dy)  <= u.stats.size) {
                        this.damage(u);
                    }
                } else {
                    let minDist = u.stats.size + this.stats.size;
                    let dist = M.dist(this, u);
                    if (dist < minDist) {
                        this.damage(u);
                    }
                }
            }
        } else {
            let minDist = this.target.stats ? this.target.stats.size + this.stats.size : 10;
            let dist = M.dist(this, this.target);
            if (dist < minDist) {
                if (this.stats.aoeStats) {
                    aoes.push(new AOE(this.x, this.y, this.stats.aoeStats, this.team, this.owner));
                    if (this.stats.aoeStats2) aoes.push(new AOE(this.x, this.y, this.stats.aoeStats2, this.team, this.owner));
                } else {
                    if (this.target.stats) this.damage(this.target);
                }
                this.dead = true;
            }
        }
    }

    damage(u) {
        if (this.stats.pigCurseDuration && u.stats.name != 'princess' && u.stats.name != 'king') {
            u.pigCurseTime = this.stats.pigCurseDuration;
        }

        if (this.pierce > 0) {
            this.pierce -= 1;
            if (this.stats.ctDamage && (u.stats.name == 'king' || u.stats.name == 'princess')) u.takeDamage(this.stats.ctDamage, this.owner);
            else u.takeDamage(this.stats.damage, this.owner);
            this.hitTargets.push(u);
        } else {
            if (this.stats.aoeStats) {
                aoes.push(new AOE(this.x, this.y, this.stats.aoeStats, this.team));
            } else {
                if (this.stats.ctDamage && (u.stats.name == 'king' || u.stats.name == 'princess')) u.takeDamage(this.stats.ctDamage, this.owner);
                else u.takeDamage(this.stats.damage, this.owner);
            }
            this.dead = true;
        }
        if (this.stats.knockback && u.knockbackVel) {
            u.applyKnockback(this.direction, this.stats.knockback);
        }
    }

    split() {
        if (!this.stats.splitStats) return;

        let angleBetween = this.stats.splitSpread / (this.stats.splitNumber - 1);
        let currentAngle = Math.atan2(this.direction.y, this.direction.x);

        for (let i = -this.stats.splitNumber / 2; i < this.stats.splitNumber / 2; i++) {
            let newAngle = angleBetween * (i + 0.5);
            let angle = currentAngle + newAngle;
            let dir = {x: Math.cos(angle), y: Math.sin(angle)};

            projectiles.push(new Projectile(this.x, this.y, this.stats.splitStats, dir, this.team, 'all', this.owner));
        }
    }
}

class ChainLighning {
    constructor(x, y, ox, oy, stats, team, target = 'all', owner) {
        this.x = x;
        this.y = y;
        this.ox = ox;
        this.oy = oy;
        this.stats = stats;
        this.coolDown = 0;
        this.chainsLeft = stats.chainAmount;
        this.dead = false;
        this.team = team;
        this.target = target;
        this.attacked = [];
        this.owner = owner;
    }

    draw() {
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#00e1ff';
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.ox, this.oy);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.ox, this.oy);
        ctx.stroke();
    }

    update() {
        if (this.coolDown > 0) {
            this.coolDown -= 1000 / 60;
            return;
        }

        let minDist = Infinity;
        let closestEnemy = null;
        for (let i = 0; i < entities.length; i++) {
            let e = entities[i];
            if (e.team == this.team) continue;
            if (e.stats.type == 'bomb') continue;
            if (this.attacked.includes(e)) continue;

            let dist = M.dist(this.x, this.y, e.x, e.y);

            if (dist < minDist && dist < this.stats.range) {
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
            if (this.chainsLeft != this.stats.chainAmount) {
                this.ox = this.x;
                this.oy = this.y;
            }
            this.x = closestEnemy.x;
            this.y = closestEnemy.y;
            this.attacked.push(closestEnemy);
            closestEnemy.stunTime = this.stats.stunDuration;
            if (this.stats.ctDamage && (closestEnemy.stats.name == 'king' || closestEnemy.stats.name == 'princess')) closestEnemy.takeDamage(this.stats.ctDamage, this.owner);
            else closestEnemy.takeDamage(this.stats.damage, this.owner);
            this.coolDown = 150;
            if (this.chainsLeft > 1) this.chainsLeft--;
            else this.dead = true;
        } else {
            this.dead = true;
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
    let stats = enemyUnits[enemyHand[i]];

    if (stats.name == 'Goblin Barrel') {
        spawnPoints = [{x: game.laneLeftX, y: c.height - game.princessY}, {x: game.laneRightX, y: c.height - game.princessY}];
    } 

    let spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];

    spawnUnit(spawnPoint.x, spawnPoint.y, i, 'enemy', enemyHand, enemyCycles);
}

function updateElixir() {
    if (playerElixir + game.playerElixirMult * elixirMult < game.maxElixir) playerElixir += game.playerElixirMult * elixirMult;
    else if (game.playerElixirMult < 10) playerElixir = game.maxElixir;
    if (enemyElixir + game.enemyElixirMult * elixirMult < game.maxElixir) enemyElixir += game.enemyElixirMult * elixirMult;
    else enemyElixir = game.maxElixir;

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

        if (stats.type != 'spell' || stats.width) {
            let newPos = findMax(x, y);
            if (newPos.x) x = newPos.x;
            if (newPos.y) y = newPos.y;
        }
    } else {
        stats = enemyUnits[enemyHand[index]];

        if (enemyElixir < stats.cost) return;
        enemyElixir -= stats.cost;

        enemyCycles.push(enemyHand[index]);
        enemyHand[index] = enemyCycles[0];
        enemyCycles.splice(0, 1);
    }

    updateElixirUI();
    if (stats.count == 2) {
        entities.push(new UnitEntity(x - 10, y, team, stats));
        entities.push(new UnitEntity(x + 10, y, team, stats));
    } else if (stats.count == 3) {
        entities.push(new UnitEntity(x + 10, y, team, stats));
        entities.push(new UnitEntity(x, y + 10, team, stats));
        entities.push(new UnitEntity(x - 10, y, team, stats));
    } else if (stats.count == 15) {
        for (let i = 0; i < 15; i++) {
            entities.push(new UnitEntity(x + i, y, team, stats));
        }
    } else if (stats.name == 'Royal Recruits') {
        for (let i = 0; i < 6; i++) {
            entities.push(new UnitEntity(x - c.width / 2 + (c.width / 6 * i) + c.width / 12, y, team, stats));
        }
    } else if (stats.count == 6) {
        for (let i = 0; i < 6; i++) {
            entities.push(new UnitEntity(x + i, y, team, stats));
        }
    } else if (stats.count == 5) {
        entities.push(new UnitEntity(x + 30, y, team, stats));
        entities.push(new UnitEntity(x - 30, y, team, stats));
        entities.push(new UnitEntity(x, y + 30, team, stats));
        entities.push(new UnitEntity(x - 20, y - 20, team, stats));
        entities.push(new UnitEntity(x + 20, y - 20, team, stats));
    } else if (stats.count == 4) {
        entities.push(new UnitEntity(x + 10, y + 10, team, stats));
        entities.push(new UnitEntity(x - 10, y + 10, team, stats));
        entities.push(new UnitEntity(x + 10, y - 10, team, stats));
        entities.push(new UnitEntity(x - 10, y - 10, team, stats));
    } else if (stats.type == 'spell' && !stats.hp && !stats.distance) {
        aoes.push(new AOE(x, y, stats, team));
    } else if (stats.name == 'Log' || stats.name == 'Barbarian Barrel') {
        let dir = (team == 'player') ? {x: 0, y: -1} : {x: 0, y: 1};
        projectiles.push(new Projectile(x, y, stats, dir, team));
    } else if (stats.name == 'Goblin Gang') {
        let dir = (this.team == 'player') ? -10 : 10;
        entities.push(new UnitEntity(x + 30, y - dir, team, units.goblins));
        entities.push(new UnitEntity(x, y - dir * 2.5, team, units.goblins));
        entities.push(new UnitEntity(x - 30, y - dir, team, units.goblins));
        entities.push(new UnitEntity(x + 30, y + dir, team, units.spearGoblins));
        entities.push(new UnitEntity(x, y + dir * 2.5, team, units.spearGoblins));
        entities.push(new UnitEntity(x - 30, y + dir, team, units.spearGoblins));
    } else if (stats.name == 'Goblin Barrel') {
        let startX = c.width / 2;
        let startY = (team == 'player') ? c.height - game.kingY : game.kingY;
        let dir = {x: x - startX, y: y - startY};

        dir = M.normalise(dir);
        projectiles.push(new Projectile(startX, startY, stats, dir, team, {x: x, y: y}));
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
    projectiles = [];
    aoes = [];

    mouse.selection = -1;
    timePassed = 0;
    timeLeft = 120;
    overtimeLeft = 180;

    clearInterval(elixirIntervalID);
    clearInterval(runAIIntervalID);
    clearInterval(timerIntervalID);

    getCrowns();
}

function reset() {
    gameFinished = false;

    gameoverScreen.style.visibility = 'hidden';
    gameoverScreen.style.opacity = '0';

    playerElixir = game.playerStartElixir;
    enemyElixir = game.enemyStartElixir;
    playerKingActivated = false;
    playerTowerDead = {left: false, right: false, king: false};
    enemyKingActivated = false;
    enemyTowerDead = {left: false, right: false, king: false};

    elixirMult = 1;

    updateElixirUI();

    if (game.randomiseEnemyUnits) randomiseEnemyUnits();
    randomisePlayerUnits();

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

    /*console.log('Enemy Units:');
    for (let i = 0; i < enemyUnitsArr.length; i++) {
        console.log(enemyUnits[enemyUnitsArr[i]].name);
    }*/

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
    timerIntervalID = setInterval(stepTimer, 100);
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

function randomisePlayerUnits() {
    let unitsArr = Object.keys(units);
    
    for (let i = 0; i < 8; i++) {
        let u = playerUnits['unit' + (i+1)];
        if (!u) continue;

        let exit = false;
        for (let j = 0; j < unitsArr; j++) {
            if (units[unitsArr[j]] == u) {
                unitsArr.splice(j, 1);
                continue;
            }
        }
        if (exit) continue;
    }

    for (let i = 0; i < 8; i++) {
        let u = playerUnits['unit' + (i+1)];
        let isRandom = !u || randomPlayerUnits['unit' + (i+1)];
        if (isRandom) {
            let index = Math.floor(Math.random() * unitsArr.length);
            let u = units[unitsArr[index]];

            playerUnits['unit' + (i+1)] = u;

            unitsArr.splice(index, 1);
        }
    }
}

function drawHandUI() {
    cardBar.innerHTML = '';

    for (let i = 0; i < playerHand.length; i++) {
        let cardStats = playerUnits[playerHand[i]];
        let cardElem = document.createElement('div');

        if (!cardStats) continue;

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

    /*const nextCard = document.getElementById('nextCard');

    let nextCardStats = playerUnits[playerCycles[0]];

    if (nextCardStats) {
        nextCard.innerHTML = `
            <h2>${nextCardStats.symbol}</h2>
            <div style="font-weight: 700;">${nextCardStats.name}</div>
            <div style="font-weight: 700;">Cost: <span style="color: #df00df;">${nextCardStats.cost}</span></div>
        `;
    }*/
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

    //Draw no deploy area
    if (mouse.selection != -1 && playerUnits[playerHand[mouse.selection]].type != 'spell') {
        ctx.fillStyle = '#d700005c';
        ctx.strokeStyle = '#7f0000ff';
        ctx.lineWidth = 4;

        if (enemyTowerDead.left && enemyTowerDead.right) {
            ctx.fillRect(0, 0, c.width, game.river + (game.riverWidth / 2) + game.deployMaxY2);
            ctx.strokeRect(0, 0, c.width, game.river + (game.riverWidth / 2) + game.deployMaxY2);
        }
        
        if (enemyTowerDead.left && !enemyTowerDead.right) {
            ctx.fillRect(0, 0, c.width, game.river + (game.riverWidth / 2) + game.deployMaxY2);
            ctx.fillRect(c.width / 2, game.river + (game.riverWidth / 2) + game.deployMaxY2, c.width / 2, (game.river + (game.riverWidth / 2) + game.deployMaxY) - (game.river + (game.riverWidth / 2) + game.deployMaxY2));
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(c.width, 0);
            ctx.lineTo(c.width, game.river + (game.riverWidth / 2) + game.deployMaxY);
            ctx.lineTo(c.width / 2, game.river + (game.riverWidth / 2) + game.deployMaxY);
            ctx.lineTo(c.width / 2, game.river + (game.riverWidth / 2) + game.deployMaxY2);
            ctx.lineTo(0, game.river + (game.riverWidth / 2) + game.deployMaxY2);
            ctx.lineTo(0, 0);
            ctx.stroke();
        }

        if (!enemyTowerDead.left && enemyTowerDead.right) {
            ctx.fillRect(0, 0, c.width, game.river + (game.riverWidth / 2) + game.deployMaxY2);
            ctx.fillRect(0, game.river + (game.riverWidth / 2) + game.deployMaxY2, c.width / 2, (game.river + (game.riverWidth / 2) + game.deployMaxY) - (game.river + (game.riverWidth / 2) + game.deployMaxY2));
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(c.width, 0);
            ctx.lineTo(c.width, game.river + (game.riverWidth / 2) + game.deployMaxY2);
            ctx.lineTo(c.width / 2, game.river + (game.riverWidth / 2) + game.deployMaxY2);
            ctx.lineTo(c.width / 2, game.river + (game.riverWidth / 2));
            ctx.lineTo(0, game.river + (game.riverWidth / 2) + game.deployMaxY);
            ctx.lineTo(0, 0);
            ctx.stroke();
        }

        if (!enemyTowerDead.left && !enemyTowerDead.right) {
            ctx.fillRect(0, 0, c.width, game.river + (game.riverWidth / 2) + game.deployMaxY);
            ctx.strokeRect(0, 0, c.width, game.river + (game.riverWidth / 2) + game.deployMaxY);
        }
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

function cardChoiceClick(cardElem, stats, inDeck, index, handIndex = null) {
    if (inDeck) {
        cardChoices.children[index].style.opacity = 1;
        cardElem.removeEventListener('click', () => cardChoiceClick(child, stats, true, index));
        cardElem.classList.remove('occupied');
        cardElem.innerHTML = '';
        playerUnits['unit' + (handIndex + 1)] = null;
        randomPlayerUnits['unit' + (handIndex + 1)] = true;
    } else {
        if (cardElem.style.opacity == 0.2 && !debug.pickSameCards) return;
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

            child.addEventListener('click', () => cardChoiceClick(child, stats, true, index, i));

            playerUnits['unit' + (i + 1)] = stats;
            randomPlayerUnits['unit' + (i + 1)] = false;
            break;
        }
    }
}

function stepTimer() {
    let amount = 0.1;
    timePassed += amount;
    if (timeLeft > 0) timeLeft -= amount;
    else overtimeLeft -= amount;
}

function findMax(x, y) {
    let nx = null;
    let ny = null;

    //Both Dead
    if (enemyTowerDead.left && enemyTowerDead.right) {
        if (y < game.river + (game.riverWidth / 2) + game.deployMaxY2) ny = game.river + (game.riverWidth / 2) + game.deployMaxY2;
    }

    //Both Alive
    if (!enemyTowerDead.left && !enemyTowerDead.right) {
        if (y < game.river + (game.riverWidth / 2) + game.deployMaxY) ny = game.river + (game.riverWidth / 2) + game.deployMaxY;
    }

    //Left Dead
    if (enemyTowerDead.left && !enemyTowerDead.right) {
        
        if (x <= c.width / 2) {
            //On dead side
            if (y < game.river + (game.riverWidth / 2) + game.deployMaxY2) ny = game.river + (game.riverWidth / 2) + game.deployMaxY2;
        } else {
            let dx = 0;
            let dy = 0;

            dx = x - c.width / 2;
            dy = game.river + (game.riverWidth / 2) + game.deployMaxY - y;

            if (y < game.river + (game.riverWidth / 2) + game.deployMaxY2) {
                nx = c.width / 2;
                ny = game.river + (game.riverWidth / 2) + game.deployMaxY2;
            } else {
                if (dx < dy) {
                    nx = c.width / 2;
                } else {
                    if (y < game.river + (game.riverWidth / 2) + game.deployMaxY) ny = game.river + (game.riverWidth / 2) + game.deployMaxY;
                }
            }
        }
    }

    //Right Dead
    if (!enemyTowerDead.left && enemyTowerDead.right) {
        if (x >= c.width / 2) {
            //On dead side
            if (y < game.river + (game.riverWidth / 2) + game.deployMaxY2) ny = game.river + (game.riverWidth / 2) + game.deployMaxY2;
        } else {
            let dx = 0;
            let dy = 0;

            dx = c.width / 2 - x;
            dy = game.river + (game.riverWidth / 2) + game.deployMaxY - y;

            if (y < game.river + (game.riverWidth / 2) + game.deployMaxY2) {
                nx = c.width / 2;
                ny = game.river + (game.riverWidth / 2) + game.deployMaxY2;
            } else {
                if (dx < dy) {
                    nx = c.width / 2;
                } else {
                    if (y < game.river + (game.riverWidth / 2) + game.deployMaxY) ny = game.river + (game.riverWidth / 2) + game.deployMaxY;
                }
            }
        }
    }

    return {x: nx, y: ny};
}

function runGameTime() {
    let playerTowersDestroyed = 0;
    let enemyTowersDestroyed = 0;

    if (enemyTowerDead.left) playerTowersDestroyed++;
    if (enemyTowerDead.right) playerTowersDestroyed++;

    if (playerTowerDead.left) enemyTowersDestroyed++;
    if (playerTowerDead.right) enemyTowersDestroyed++;

    let displayTime = timeLeft;
    if (timeLeft <= 60) {
        elixirMult = 2;
    }
    if (timeLeft <= 0) {
        displayTime = overtimeLeft;
        if (playerTowersDestroyed > enemyTowersDestroyed) gameover('enemy');
        if (enemyTowersDestroyed > playerTowersDestroyed) gameover('player');
    }
    if (overtimeLeft <= 60) {
        elixirMult = 3;
    }

    let minutes = displayTime / 60;
    let seconds = displayTime - Math.floor(minutes) * 60;

    ctx.fillStyle = (timeLeft <=0) ? '#ff2f00ff' : '#000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    if (Math.round(seconds) == 60 && minutes > 1) ctx.fillText(`2m 0s`, 10, 10);
    else if (Math.floor(minutes) > 0) ctx.fillText(`${Math.floor(minutes)}m ${Math.round(seconds)}s`, 10, 10);
    else ctx.fillText(`${Math.round(seconds)}s`, 10, 10);

    ctx.textAlign = 'right';
    ctx.fillText(`${elixirMult}x`, c.width - 10, 10);
}

function getCrowns() {
    if (game.playerElixirMult > 1 || debug.pickSameCards || game.enemyElixirMult < 1) return;
    const totalCrownDisplay = document.getElementById('totalCrownDisplay');
    const newCrownDisplay = document.getElementById('newCrownDisplay');
    totalCrownDisplay.innerHTML = `${localStorage.crowns || 0} 👑`;
    let crownAmount = 3;

    if (playerTowerDead.left) crownAmount--;
    if (playerTowerDead.right) crownAmount--;
    if (playerTowerDead.king) crownAmount--;
    
    if (enemyTowerDead.left) crownAmount++;
    if (enemyTowerDead.right) crownAmount++;
    if (enemyTowerDead.king) crownAmount++;

    crowns += crownAmount;
    localStorage.crowns = crowns;

    totalCrownDisplay.innerHTML = `${localStorage.crowns || 0} 👑`;
    newCrownDisplay.innerHTML = `+${crownAmount}👑`;
    newCrownDisplay.style.display = 'block';
}