/*
ToDo:
-Improve AI
    -Add spell support
    -Make more responsive
-Add more units, buildings and spells
    -Fisherman
    -Goblin Machine
-Add proper icons
-Add better visuals and particle effects
*/

//1 range ≈ 24
//x = cos(anle) y = sin(angle)

const c = document.getElementById('c');
const ctx = c.getContext('2d');

const elixirBar = document.getElementById('elixirBar');
const elixirBarGrey = document.getElementById('elixirBarGrey');
const elixirNum = document.getElementById('elixirNum');

const gameoverScreen = document.getElementById('gameoverScreen');
const gameoverMessage = document.getElementById('gameoverMessage');
const restartButton = document.getElementById('restartButton');

const cardBar = document.getElementById('cardBar');

const chosenCards = document.getElementById('chosenCards');
const cardChoices = document.getElementById('cardChoices');

const game = {
    maxElixir: 10,
    elixirRate: 28,
    gridSize: 24,
    laneLeftX: 108,
    laneRightX: c.width - 108,
    river: c.height / 2,
    riverWidth: 48,
    bridgeWidth: 48,
    deployMaxY: 0,
    deployMaxY2: -144,
    princessY: 156,
    kingY: 72,
    team1: 'host',
    team2: 'peer',
    p2ElixirMult: 1.5,
    p2StartElixir: 7,
    p1ElixirMult: 1,
    p1StartElixir: 7,
    randomiseEnemyUnits: true
};

const debug = {
    drawViewRange: false,
    drawRange: false,
    drawDash: false,
    pickSameCards: false,
    showFPS: false
};

const p1Units = {
    unit1: null,
    unit2: null,
    unit3: null,
    unit4: null,
    unit5: null,
    unit6: null,
    unit7: null,
    unit8: null
};

const randomP1Units = {
    unit1: true,
    unit2: true,
    unit3: true,
    unit4: true,
    unit5: true,
    unit6: true,
    unit7: true,
    unit8: true
};

const p2Units = {
    unit1: null,
    unit2: null,
    unit3: null,
    unit4: null,
    unit5: null,
    unit6: null,
    unit7: null,
    unit8: null
};

let mouse = {x: 0, y: 0, down: false, selection: -1};

let entities = [];
let aoes = [];
let projectiles = [];
let particles = [];

let p1Elixir = 5;
let p2Elixir = 5;

let p1Hand = [];
let p1Cycles = [];

let p2Hand = [];
let p2Cycles = [];

let elixirIntervalID = null;
let runAIIntervalID = null;
let timerIntervalID = null;

let p1KingActivated = false;
let p1TowerDead = {left: false, right: false, king: false};

let p2KingActivated = false;
let p2TowerDead = {left: false, right: false, king: false};

let gameFinished = false;

let timePassed = 0;
let timeLeft = 120;
let overtimeLeft = 180;
let elixirMult = 1;

let isReady = false;
let peerIsReady = false;

let crowns = Number(localStorage.crowns) || 0;

let gridCanvas = null;

let fps = 0;
let times = [];

function start() {
    document.addEventListener('mousemove', (e) => {
        let rect = c.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;

        if (c.style.width == `${window.innerWidth - 10}px`) {
            mouse.x += window.innerHeight - 10;
            mouse.y += window.innerWidth - 240;
        }
    });

    c.addEventListener('mousedown', (e) => {
        mouse.down = true;
        
        spawnUnit(mouse.x, mouse.y, mouse.selection, game.team1, p1Elixir);

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
            mouse.x *= 500 / Number(cWidth);
            mouse.y *= 800 / Number(cHeight);
        }

        spawnUnit(mouse.x, mouse.y, mouse.selection, game.team1, p1Elixir);

        mouse.selection = -1;
        
        drawHandUI();
    });

    c.addEventListener('touchend', function() {
        mouse.down = false;
    });

    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case '1':
                cardClick(cardBar.children[0], 0);
                break;
            case '2':
                cardClick(cardBar.children[1], 1);
                break;
            case '3':
                cardClick(cardBar.children[2], 2);
                break;
            case '4':
                cardClick(cardBar.children[3], 3);
                break;
        }
    });

    populateChoices();
}

function update() {
    ctx.clearRect(0, 0, c.width, c.height);

    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);

    fps = times.length;

    drawMap();

    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        if (!p.stats.isTimer) p.draw();
    }

    for (let i = 0; i < projectiles.length; i++) {
        let p = projectiles[i];
        p.draw();
    }

    for (let i = 0; i < entities.length; i++) {
        let e = entities[i];
        if(!e.isFlying) e.draw();
    }

    for (let i = 0; i < entities.length; i++) {
        let e = entities[i];
        if (e.isFlying) e.draw();
    }

    for (let i = 0; i < aoes.length; i++) {
        let p = aoes[i];
        p.draw();
    }

    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        if (p.stats.isTimer) p.draw();
    }

    if (mouse.selection != -1) {
        let stats = p1Units[p1Hand[mouse.selection]];
        if (stats.name == 'Mirror') stats = p1Units[p1Cycles[p1Cycles.length - 1]];

        let x = mouse.x;
        let y = mouse.y;

        if (stats.type != 'spell' && stats.deployType != 'spell') {
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

    if (isHost) {
        hostUpdate();
    }

    runGameTime();

    if (debug.showFPS) {
        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${fps}fps`, 10, 35);
    }

    window.requestAnimationFrame(update);
}

function hostUpdate() {
    for (let i = 0; i < projectiles.length; i++) {
        let p = projectiles[i];
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

    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        if (p.dead) {
            particles.splice(i, 1);
        } else {
            p.update();
        }
    }

    for (let i = 0; i < entities.length; i++) {
        let e = entities[i];
        if (e.dead) {
            if (e.stats.name == 'king') {
                if (e.team == game.team1) p1TowerDead = {left: true, right: true, king: true};
                else p2TowerDead = {left: true, right: true, king: true};
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

            if (e.stats.deathEnemyElixir) {
                if (e.team == game.team1) {
                    addElixir(game.team2, e.stats.deathEnemyElixir);
                } else {
                    addElixir(game.team1, e.stats.deathEnemyElixir);
                }
            }

            if (e.stats.deathElixir) {
                addElixir(e.team, e.stats.deathElixir);
            }

            if (e.stats.name == 'princess') {
                if (e.team == game.team1) {
                    p1KingActivated = true;
                    (e.x < c.width / 2) ? p1TowerDead.left = true : p1TowerDead.right = true;
                    if (isConnected && conn.open) conn.send({type: 'TOWER_INFO', team: game.team1, towerDead: p1TowerDead});
                } else {
                    p2KingActivated = true;
                    (e.x < c.width / 2) ? p2TowerDead.left = true : p2TowerDead.right = true;
                    if (isConnected && conn.open) conn.send({type: 'TOWER_INFO', team: game.team2, towerDead: p2TowerDead});
                }
            }

            let hasSpawned = false;
            for (let i = 0; i < aoes.length; i++) {
                let aoe = aoes[i];

                if (hasSpawned) continue;
                if (!aoe.stats.goblinCurse) continue;
                if (aoe.team == e.team) continue;

                let minDist = aoe.stats.radius + e.stats.size;

                if (M.dist(aoe, e) < minDist) {
                    hasSpawned = true;
                    entities.push(new UnitEntity(e.x, e.y, aoe.team, otherUnits.goblin));
                }
            }

            if (e.pigCurseTime > 0) {
                let team = (e.team == game.team1) ? game.team2 : game.team1;
                entities.push(new UnitEntity(e.x, e.y, team, otherUnits.cursedPig));
            }

            if (e.backUnits) {
                for (let j = 0; j < e.backUnits.length; j++) {
                    e.backUnits[j].dead = true;
                }
            }

            if (e.enchantedUnits) {
                for (let j = 0; j < e.enchantedUnits.length; j++) {
                    e.enchantedUnits[j].enchantTime = 5000;
                }
            }

            entities.splice(i, 1);
            continue;
        } else {
            e.update();
        }
    }

    for (let i = 0; i < aoes.length; i++) {
        let p = aoes[i];

        p.update();

        if (p.dead) {
            aoes.splice(i, 1);
            continue;
        }
    }

    if (isConnected && conn.open) {
        conn.send({type: 'SYNC', entities: entities.map(d => d.serialise()), aoes: aoes.map(d => d.serialise()), projectiles: projectiles.map(d => d.serialise()), particles: particles.map(d => d.serialise()), time: {t: timeLeft, ot: overtimeLeft}});
    }
}

class Entity {
    constructor(x, y, team, stats) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.stats = stats;
        this.type = stats.type;
        this.attackCooldown = 0;
        this.initAttackCooldown = stats.initHitSpeed;
        this.hp = stats.hp;
        this.sheildHP = stats.sheildHP || 0;
        this.dead = false;
        this.freezeTime = 0;
        this.slowTime = 0;
        this.slowAmount = 1;
        this.rageTime = 0;
        this.speedMult = 1;
        this.moveSpeedMult = 1;
        this.stunTime = 0;
        this.supportSpawnCooldown = stats.initSupportSpawnSpeed || stats.supportSpawnSpeed;
        this.charging = false;
        this.isAttacking = false;
        this.attackTime = 0;
        this.nonAttackTime = 0;
        this.invisible = false;
        this.hidden = false;
        this.pigCurseTime = 0;
        this.deployTimeLeft = stats.deployTime || 0;
        this.isFlying = stats.type == 'flying';
        this.vineTime = 0;
        this.elixirCooldown = stats.elixirSpeed;
        this.target = null;
        this.snareTime = 0;
        this.enchantTime = 0;
        this.attackCount = 0;

        if (stats.spawnInvis) this.invisible = true;
        if (!stats) this.dead = true;
        if (stats.chargeAttack) this.attackCooldown = stats.attackSpeed;
    }

    draw() {
        let y = isHost ? this.y : c.height - this.y;

        //Draw shadow
        if (this.isFlying) {
            ctx.beginPath();
            ctx.fillStyle = '#00000079';
            ctx.arc(this.x + 10, y + 10, this.stats.size, 0, 2*Math.PI);
            ctx.fill();
        }

        //Draw e giant radius
        if (this.stats.reflectionRadius) {
            ctx.beginPath();
            ctx.fillStyle = (this.team == game.team1) ? '#00e1ff3c' : '#b900003c';
            ctx.arc(this.x, y, this.stats.reflectionRadius, 0, 2 * Math.PI);
            ctx.fill();
        }

        //Draw if enchanted
        if (this.enchantTime > 1) {
            ctx.beginPath();
            ctx.strokeStyle = '#ffb224cb';
            ctx.lineWidth = 12;
            ctx.arc(this.x, y, this.stats.size, 0, 2 * Math.PI);
            ctx.stroke();
        }

        //Circle
        let opacity = this.invisible ? '30' : 'a1';
        ctx.fillStyle = (this.team == game.team1) ? ('#3845ff' + opacity) : ('#ff4343' + opacity);
        ctx.beginPath();
        ctx.arc(this.x, y, this.stats.size, 0, 2 * Math.PI);
        ctx.fill();

        //Symbol
        ctx.fillStyle = this.invisible ? '#ffffff63' : '#ffffff';
        ctx.font = `${this.stats.size + 5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.stats.symbol, this.x, y);

        
        if (!this.stats.isClone && this.type != 'waypoint') {
            //Draw crown tower hp
            if (this.stats.name == 'king' || this.stats.name == 'princess') {
                //Heathbar outer
                ctx.fillStyle = '#000000';
                ctx.fillRect(this.x - this.stats.size, y + this.stats.size + 3, this.stats.size * 2, 15);

                //Healthbar inner
                ctx.fillStyle = '#009607ff';
                ctx.fillRect(this.x - this.stats.size + 2, y + this.stats.size + 5, (this.stats.size * (this.hp / this.stats.hp) * 2)- 4, 11);

                //Health Number
                ctx.fillStyle = (this.team == game.team1) ? '#3845ff' : '#fa1d1dff';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText(Math.round(this.hp).toString(), this.x - this.stats.size + 2, y + this.stats.size + 4);
            } else {
                //Heathbar outer
                ctx.fillStyle = '#000000';
                ctx.fillRect(this.x - this.stats.size, y + this.stats.size + 3, this.stats.size * 2, 10);

                //Healthbar inner
                ctx.fillStyle = '#009607ff';
                ctx.fillRect(this.x - this.stats.size + 2, y + this.stats.size + 5, (this.stats.size * (this.hp / this.stats.hp) * 2)- 4, 6);
            }

            //Draw shield
            if (this.sheildHP > 1) {
                ctx.fillStyle = '#b1a500ff';
                ctx.fillRect(this.x - this.stats.size + 2, y + this.stats.size + 5, (this.stats.size * (this.sheildHP / this.stats.sheildHP) * 2)- 4, 6);
            }

            //Draw activation
            if (this.stats.activationHP) {
                let x = (this.x - this.stats.size) + this.stats.size * 2 * this.stats.activationHP;
                ctx.strokeStyle = '#d88600ff';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(x, y + this.stats.size - 1);
                ctx.lineTo(x, y + this.stats.size + 14);
                ctx.stroke();
            }
        } else if (this.stats.isClone) {
            ctx.beginPath();
            ctx.fillStyle = '#00fbff5c';
            ctx.arc(this.x, y, this.stats.size, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        if (this.stats.chargeAttack) {
            if (this.attackCooldown < 1000) ctx.fillStyle = '#00f7ff9b';
            else if (this.attackCooldown < 2000) ctx.fillStyle = '#00f7ff6d';
            else if (this.attackCooldown < 3000) ctx.fillStyle = '#00f7ff3d';
            else if (this.attackCooldown < 4000) ctx.fillStyle = '#00f7ff1b';
            else ctx.fillStyle = '#ffffff01';
            ctx.beginPath();
            ctx.arc(this.x, y, this.stats.size, 0, 2*Math.PI);
            ctx.fill();
        }
        
        //Draw if frozen
        if (this.freezeTime > 1) {
            ctx.beginPath();
            ctx.fillStyle = '#3fdfff93';
            ctx.arc(this.x, y, this.stats.size, 0, 2*Math.PI);
            ctx.fill();
        } else if (this.slowTime > 1) {
            ctx.beginPath();
            ctx.fillStyle = '#3fdfff35';
            ctx.arc(this.x, y, this.stats.size, 0, 2*Math.PI);
            ctx.fill();
        } 
        //Draw if rage boosted
        else if (this.rageTime > 1) {
            ctx.beginPath();
            ctx.fillStyle = '#e600ff93';
            ctx.arc(this.x, y, this.stats.size, 0, 2*Math.PI);
            ctx.fill();
        }

        //Draw if charging
        if (this.charging) {
            ctx.beginPath();
            ctx.fillStyle = '#fbff0055';
            ctx.arc(this.x, y, this.stats.size, 0, 2 * Math.PI);
            ctx.fill();
        }

        //Draw pig curse
        if (this.pigCurseTime > 1) {
            ctx.beginPath();
            ctx.fillStyle = '#fb00ff55';
            ctx.arc(this.x, y, this.stats.size, 0, 2 * Math.PI);
            ctx.fill();
        }

        if (this.hidden) {
            ctx.beginPath();
            ctx.fillStyle = '#b16800';
            ctx.arc(this.x, y, this.stats.size, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.strokeStyle = '#623900ff';
            ctx.moveTo(this.x, y - this.stats.size);
            ctx.lineTo(this.x, y + this.stats.size);
            ctx.stroke();
        }

        //Draw beam
        if (this.stats.beamDamage && this.isAttacking) {
            ctx.beginPath();
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#ffa200ff';
            ctx.moveTo(this.x, y);
            if (isHost) ctx.lineTo(this.target.x, this.target.y);
            else ctx.lineTo(this.target.x, c.height - this.target.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ff0000ff';
            ctx.moveTo(this.x, y);
            if (isHost) ctx.lineTo(this.target.x, this.target.y);
            else ctx.lineTo(this.target.x, c.height - this.target.y);
            ctx.stroke();
        }

        if (this.vineTime > 1) {
            let p1 = {x: Math.cos(Math.PI / 4) * this.stats.size, y: Math.sin(Math.PI / 4) * this.stats.size};
            let p2 = {x: Math.cos(Math.PI * 2.4) * this.stats.size, y: Math.sin(Math.PI * 2.4) * this.stats.size};
            let p3 = {x: Math.cos(Math.PI * 3/4) * this.stats.size, y: Math.sin(Math.PI * 3/4) * this.stats.size};
            ctx.strokeStyle = '#7d2a00ff';
            ctx.lineWidth = 4;
            
            ctx.beginPath();
            ctx.moveTo(this.x + p1.x, y + p1.y);
            ctx.lineTo(this.x - p1.x, y - p1.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(this.x + p2.x, y + p2.y);
            ctx.lineTo(this.x - p2.x, y - p2.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(this.x + p3.x, y + p3.y);
            ctx.lineTo(this.x - p3.x, y - p3.y);
            ctx.stroke();
        }


        //---Debug---

        //View range
        if (debug.drawViewRange) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'black';
            ctx.arc(this.x, y, this.stats.viewRange, 0, 2 * Math.PI);
            ctx.stroke();
        }

        //Range
        if (debug.drawRange) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.arc(this.x, y, this.stats.range, 0, 2 * Math.PI);
            ctx.stroke();
        }

        //Dash range
        if (this.stats.dashRange && debug.drawDash) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'blue';
            ctx.arc(this.x, y, this.stats.dashRange.min, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.x, y, this.stats.dashRange.max, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    takeDamage(amount, e = null) {
        if (this.type == 'waypoint') return;

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

    attack() {
        let bonusDamage = 0;

        if (this.enchantTime > 0 && this.attackCount % 3 == 0) {
            bonusDamage += 220;
        }

        if (this.stats.aoeStats) {
            if (this.charging) this.aoeAttack(this.x, this.y, this.stats.chargeAOEStats, bonusDamage);
            else this.aoeAttack(this.x, this.y, this.stats.aoeStats, bonusDamage);
        } else if (this.stats.projectileStats) {
            this.shoot(this.target, bonusDamage);
        } else {
            this.meleeAttack(this.target, bonusDamage);
        }
        if (this.stats.dieOnAttack) {
            this.dead = true;
            return;
        }

        this.attackCount++;
    }

    meleeAttack(target, bonusDamage = 0) {
        let hasDamage = this.stats.damage || this.stats.beamDamage || this.stats.chargeDamage;
        if (target && this.attackCooldown < 1 && hasDamage) {
            if (this.stats.beamDamage) {
                if (this.attackTime < this.stats.damageStageTime) {
                    target.takeDamage(this.stats.beamDamage[0] + bonusDamage, this);
                } else if (this.attackTime < this.stats.damageStageTime) {
                    target.takeDamage(this.stats.beamDamage[1] + bonusDamage, this);
                } else {
                    target.takeDamage(this.stats.beamDamage[2] + bonusDamage, this);
                }
                
            } else {
                if (this.charging) {
                    target.takeDamage(this.stats.chargeDamage + bonusDamage, this);
                } else {
                    target.takeDamage(this.stats.damage + bonusDamage, this);
                }
            }

            if (this.stats.attackAOE) {
                aoes.push(new AOE(this.x, this.y, this.stats.attackAOE, this.team, this, bonusDamage));
            }

            this.attackTime += this.stats.attackSpeed;
            this.attackCooldown = this.stats.attackSpeed;
        }
    }

    aoeAttack(x, y, stats, bonusDamage = 0) {
        if (this.attackCooldown < 1) {
            if (this.stats.name == 'Wall Breakers') {
                aoes.push(new AOE(this.target.x, this.target.y, stats, this.team, this, bonusDamage));
                this.dead = true;
            } else if ((this.stats.name == 'Mega Knight' && stats.id == 'attack') || this.stats.name == 'Royal Ghost' || this.stats.name == 'Dark Prince') {
                aoes.push(new AOE(this.target.x, this.target.y, stats, this.team, this, bonusDamage));
                this.attackCooldown = this.stats.attackSpeed;
            } else {
                aoes.push(new AOE(x, y, stats, this.team, this, bonusDamage));
                this.attackCooldown = this.stats.attackSpeed;
            }
        }
    }

    shoot(target, bonusDamage = 0) {
        let dir = M.normalise(target.x - this.x, target.y - this.y);

        if (this.attackCooldown < 1) {
            if (this.stats.projectileCount) {
                for (let i = 0; i < this.stats.projectileCount; i++) {
                    let currentAngle = Math.atan2(dir.y, dir.x);
                    let newAngle = Math.random() * (this.stats.projectileSpread + this.stats.projectileSpread) - this.stats.projectileSpread;
                    let angle = currentAngle + newAngle;
                    let newDir = {x: Math.cos(angle), y: Math.sin(angle)};
                    let p = new Projectile(this.x, this.y, this.stats.projectileStats, newDir, this.team, 'all', this);

                    p.bonusDamage = bonusDamage;
                    projectiles.push(p);
                }
            } else {
                if (this.stats.projectileStats.type == 'lightning') {
                projectiles.push(new ChainLighning(this.target.x, this.target.y, this.x, this.y, this.stats.projectileStats, this.team, 'all', this));
                } else {
                    if (this.stats.projectileStats.targetPriority == 'all' || this.stats.projectileStats.targetPriority == 'ground') {
                        let p = new Projectile(this.x, this.y, this.stats.projectileStats, dir, this.team, 'all', this);
                        p.bonusDamage = bonusDamage;
                        projectiles.push(p);

                    } else if (this.stats.projectileStats.groundProj) {
                        let p = new Projectile(this.x, this.y, this.stats.projectileStats, dir, this.team, {x: this.target.x, y: this.target.y}, this);
                        p.bonusDamage = bonusDamage;
                        projectiles.push(p);
                    } else {
                        let p = new Projectile(this.x, this.y, this.stats.projectileStats, dir, this.team, this.target, this);
                        p.bonusDamage = bonusDamage;
                        projectiles.push(p);
                    }
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
        let dir = (this.team == game.team1) ? -1 : 1;
        if (this.supportSpawnCooldown < 1) {
            if (this.stats.supportSpawnNum == 4) {
                entities.push(new UnitEntity(this.x + 50, this.y, this.team, this.stats.supportStats));
                entities.push(new UnitEntity(this.x - 50, this.y, this.team, this.stats.supportStats));
                entities.push(new UnitEntity(this.x, this.y + 50, this.team, this.stats.supportStats));
                entities.push(new UnitEntity(this.x, this.y - 50, this.team, this.stats.supportStats));
            } else if (this.stats.supportSpawnNum == 3) {
                entities.push(new UnitEntity(this.x, this.y + dir, this.team, this.stats.supportStats));
                entities.push(new UnitEntity(this.x, this.y + dir, this.team, this.stats.supportStats));
                entities.push(new UnitEntity(this.x, this.y + dir, this.team, this.stats.supportStats));
            } else if (this.stats.name == 'Night Witch') {
                entities.push(new UnitEntity(this.x + 25, this.y + dir * -20, this.team, this.stats.supportStats));
                entities.push(new UnitEntity(this.x - 25, this.y + dir * -20, this.team, this.stats.supportStats));
            } else if (this.stats.supportSpawnNum == 2) {
                entities.push(new UnitEntity(this.x, this.y + dir, this.team, this.stats.supportStats));
                entities.push(new UnitEntity(this.x, this.y + dir, this.team, this.stats.supportStats));
            } else if (this.stats.name == 'Phoenix Egg') {
                entities.push(new UnitEntity(this.x, this.y, this.team, this.stats.supportStats));
            } else {
                entities.push(new UnitEntity(this.x, this.y, this.team, this.stats.supportStats));
            }

            if (this.stats.dieOnSupportSpawn) this.dead = true;
            this.supportSpawnCooldown = this.stats.supportSpawnSpeed;
        }
    }

    checkSpeedChange() {
        this.speedMult = 1;
        this.moveSpeedMult = 1;

        if (this.rageTime > 0) this.speedMult *= 1.3;
        if (this.snareTime > 0) this.moveSpeedMult *= 0.3;

        let rageBoosted = false;
        if (this.rageTime > 0) rageBoosted = true;
        for (let i = 0; i < aoes.length; i++) {
            let p = aoes[i];

            if (!p.stats.speedMult || p.team != this.team) continue;
            if (p.stats.target == 'ground' && this.isFlying) continue;

            if (M.dist(this, p) < this.stats.size + p.stats.radius) {
                if (p.stats.rageDuration) {
                    if (!rageBoosted) {
                        this.speedMult *= p.stats.speedMult;
                        this.rageTime = p.stats.rageDuration;
                    } else {
                        this.rageTime = p.stats.rageDuration;
                    }
                } else {
                    this.speedMult *= p.stats.speedMult;
                }
                
            }
        }

        for (let i = 0; i < aoes.length; i++) {
            let p = aoes[i];

            if (!p.stats.moveSpeedMult || p.team == this.team) continue;
            if (p.stats.target == 'ground' && this.isFlying) continue;

            if (M.dist(this, p) < this.stats.size + p.stats.radius) {
                this.moveSpeedMult *= p.stats.moveSpeedMult;
            }
        }
    }

    serialise() {
        let s = {
            x: this.x,
            y: this.y,
            team: this.team,
            name: this.stats.name,
            hp: this.hp,
            sheildHP: this.sheildHP,
            freezeTime: this.freezeTime,
            slowTime: this.slowTime,
            rageTime: this.rageTime,
            charging: this.charging,
            isAttacking: this.isAttacking,
            hidden: this.hidden,
            isFlying: this.isFlying,
            vineTime: this.vineTime,
            invisible: this.invisible,
            enchantTime: this.enchantTime,
            target: null
        };
        if (this.target) s.target = {x: this.target.x, y: this.target.y};
        return s;
    }
}

class UnitEntity extends Entity {
    constructor(x, y, team, stats) {
        super(x, y, team, stats);
        this.dashTime = 0;
        this.dashPauseTime = 0;
        this.distance = 0;
        this.knockbackVel = {x: 0, y: 0};
        this.hasDeployed = false;
        this.backUnits = [];
        this.enchantedUnits = [];

        if (this.stats.spawnAOEStats) this.aoeAttack(this.x, this.y, this.stats.spawnAOEStats);
        if (this.stats.spawnInvis) this.nonAttackTime = this.stats.invisTime;
        if (this.stats.backUnitNum) {
            for (let i = -this.stats.backUnitNum / 2 + 0.5; i < this.stats.backUnitNum / 2 + 0.5; i++) {
                let b = new UnitEntity(this.x + i * 25, this.y, this.team, this.stats.backUnitStats);
                b.type = 'waypoint';

                this.backUnits.push(b);
                entities.push(b);
            }
        }
    }

    update() {
        if (this.type == 'waypoint') {
            this.backUpdate();
            return;
        }

        if (Number.isNaN(this.hp)) {
            this.dead = true;
            return;
        }

        if (this.deployTimeLeft > 0) {
            this.deployTimeLeft -= 1000 / 60;
            if (this.type != 'building' && this.type != 'bomb') this.collide();
            this.wallCol();
            return;
        } else if (!this.hasDeployed) {
            this.hasDeployed = true;
            if (this.stats.enchantCount) {
                this.enchant();
            }
        }

        if (this.target && this.target.invisible) this.target = null;

        if (!this.target || this.target.dead) {
            this.attackTime = 0;
            this.attacking = false;
        }

        if (this.vineTime > 0) {
            this.vineTime -= 1000 / 60;
            this.isFlying = false;
            return;
        } else {
            if (this.stats.type == 'flying') this.isFlying = true;
        }

        if (this.stunTime > 0) {
            this.stunTime -= 1000 / 60;
            if (this.dashTime) this.dashTime = 0;
            if (this.stats.chargeAttack) this.attackCooldown = this.stats.attackSpeed;
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

        if (this.elixirCooldown > 0) this.elixirCooldown -= 1000 / 60;
        else if (this.stats.elixirSpeed) {
            this.elixirCooldown = this.stats.elixirSpeed;
            addElixir(this.team, this.stats.elixirAmount);
        }

        if (this.snareTime > 0) this.snareTime -= 1000 / 60;

        if (!this.isAttacking) this.nonAttackTime += 1000 / 60;
        if (this.stats.invisTime && this.nonAttackTime > this.stats.invisTime) this.invisible = true;
        else this.invisible = false;

        if (this.attackCooldown > 0) this.attackCooldown -= 1000 / 60 * this.slowAmount * this.speedMult;
        if (this.supportSpawnCooldown > 0 && this.stats.supportSpawnSpeed) this.supportSpawnCooldown -= 1000 / 60 * this.slowAmount * this.speedMult;
        if (this.pigCurseTime > 0) this.pigCurseTime -= 1000 / 60;
        if (this.rageTime > 0) this.rageTime -= 1000 / 60;

        if (this.stats.hpLostPerSecond) {
            this.takeDamage(this.stats.hpLostPerSecond / (1000 / 60) / 4);
        }

        if (this.type == 'bomb') return;

        //Apply knockback
        if (this.knockbackVel && (this.knockbackVel.x != 0 || this.knockbackVel.y != 0)) {
            this.x += this.knockbackVel.x;
            this.y += this.knockbackVel.y;
            this.knockbackVel.x *= 0.9;
            this.knockbackVel.y *= 0.9;

            this.charging = false;
            this.distance = 0;
        }

        if (this.stats.activationHP) {
            if (this.hp <= this.stats.hp * this.stats.activationHP) {
                this.dead = true;
                let e = new UnitEntity(this.x, this.y, this.team, this.stats.activatedStats);
                e.hp = this.hp;
                entities.push(e);
            }
        }

        this.checkDash();
        this.checkCharge();
        this.checkSpeedChange();
        if (!this.stats.spawnInRange) this.spawnSupport();
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
                    && this.target.type != 'waypoint';
        let distCheck = false;
        if (minRange > 0) distCheck = (dist - this.target.stats.size < maxRange && dist - this.target.stats.size > minRange);
        else distCheck = dist - this.target.stats.size < maxRange;

        if (this.stats.spawnInRange && distCheck) this.spawnSupport();

        if (canDash) {
            if (this.dashTime < 100) {
                this.dashTime = 1000 + this.stats.dashPauseTime;
                this.dashPauseTime = this.stats.dashPauseTime;
            }
        } else if (distCheck && this.target.stats.size > 0) {
            if (this.initAttackCooldown > 0 && !this.charging) {
                this.initAttackCooldown -= 1000 / 60;
            } else {
                this.attack();
                this.isAttacking = true;
                this.charging = false;
                this.distance = 0;
                this.nonAttackTime = 0;
            }   
        } else {
            this.isAttacking = false;
            this.attackTime = 0;
            this.initAttackCooldown = this.stats.initHitSpeed;
            if (this.dashTime <= 1 && !this.charging) this.moveTowards(this.target);
        }

        if (this.type != 'building' && this.type != 'bomb') this.collide();
        this.wallCol();

        for (let i = 0; i < this.backUnits.length; i++) {
            let b = this.backUnits[i];

            if (this.backUnits.length > 1) b.x = this.x + (i * this.backUnits.length / 2 - 0.5) * 25;
            else b.x = this.x;
            b.y = this.y;
        }
    }

    backUpdate() {
        this.findTarget();

        if (this.attackCooldown > 0) this.attackCooldown -= 1000 / 60;

        if (!this.target || this.target.type == 'waypoint') return;

        let minRange = this.stats.range.min || 0;
        let maxRange = this.stats.range.max || this.stats.range;
        let dist = M.dist(this.x, this.y, this.target.x, this.target.y);

        let distCheck = false;
        if (minRange > 0) distCheck = (dist - this.target.stats.size < maxRange && dist - this.target.stats.size > minRange);
        else distCheck = dist - this.target.stats.size < maxRange;
        
        if (distCheck && this.target.stats.size > 0) {
            this.attack();
        }
    }

    findTarget() {
        if (this.target && !this.target.dead && this.isAttacking && this.target.type != 'waypoint') return;

        let minDist = Infinity;
        let closestEnemy = null;
        for (let i = 0; i < entities.length; i++) {
            let e = entities[i];
            if (e.team == this.team || e.type == 'bomb' || e.invisible || e.hidden || e.type == 'waypoint') continue;

            let dist = M.dist(this.x, this.y, e.x, e.y) - e.stats.size;

            let minRange = this.stats.viewRange.min || 0;
            let maxRange = this.stats.viewRange.max || this.stats.viewRange;
            let check = false;
            if (minRange > 0) check = (dist < minDist && dist < maxRange && dist > minRange);
            else check = (dist < minDist && dist < maxRange);
            
            if (check) {
                if (this.stats.targetPriority == 'buildings') {
                    if (e.type == 'building') {
                        minDist = dist;
                        closestEnemy = e;
                    } else {
                        continue;
                    }
                } else if (this.stats.targetPriority == 'ground') {
                    if (!e.isFlying && e.isFlying == false) {
                        minDist = dist;
                        closestEnemy = e;
                    } else {
                        continue;
                    }
                } else if (this.stats.targetPriority == 'units') {
                    if (e.type != 'building') {
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
            let bridgeY = (this.team == game.team1) ? game.river - game.riverWidth / 2 : game.river + game.riverWidth / 2;

            let onOwnSide = (this.team == game.team1) ? this.y > game.river : this.y < game.river;

            if (onOwnSide && !this.isFlying) {
                if (!(M.dist(this.x, this.y, bridgeX, game.river) < this.stats.speed / 60 + 1)) {
                    this.target = {x: bridgeX, y: bridgeY, stats: {size: 0, type: 'waypoint'}, type: 'waypoint'};
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
        if (dist < speed / 60) return;

        let dx = target.x - this.x;
        let dy = target.y - this.y;

        let xAmount = (dx / dist) * speed * this.slowAmount * this.moveSpeedMult * this.speedMult / 60 * 0.75;
        let yAmount = (dy / dist) * speed * this.slowAmount * this.moveSpeedMult * this.speedMult / 60 * 0.75;
        
        this.x += xAmount;
        this.y += yAmount;
        this.distance += Math.sqrt(xAmount * xAmount + yAmount * yAmount);
    }

    collide() {
        if (this.type == 'waypoint') return;
        for (let i = 0; i < entities.length; i++) {
            let obj = entities[i];

            if (obj == this) continue;
            if (obj.dead) continue;
            if (obj.type == 'bomb' || obj.type == 'waypoint') continue;

            if (this.isFlying && !obj.isFlying) continue;
            if (!this.isFlying && obj.isFlying) continue;

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
        if (!this.isFlying) {
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
            this.dashPauseTime -= 1000 / 60 * this.slowAmount * this.speedMult;
            return;
        }

        if (this.target && this.target.type == 'waypoint') {
            this.dashTime = 0;
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

    enchant() {
        for (let i = 0; i < entities.length; i++) {
            let e = entities[i];

            if (e.type == 'building' || e.team != this.team) continue;
            if (e == this) continue;

            let dist = M.dist(this, e) + e.stats.size;

            if (dist < this.stats.enchantRange) {
                this.enchantedUnits.push(e);
                e.enchantTime = Infinity;
                e.attackCount = 0;
                if (this.enchantedUnits.length == this.stats.enchantCount) return;
            }
        }
    }

    applyKnockback(dir, amount) {
        if (this.type != 'building') {
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

        if (this.vineTime > 0) {
            this.vineTime -= 1000 / 60;
            return;
        }

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
            this.attackCooldown -= 1000 / 60 * this.slowAmount * this.speedMult;
        }

        if (this.rageTime > 0) this.rageTime -= 1000 / 60;

        if (this.target && M.dist(this, this.target) + this.target.stats.size > this.stats.range) {
            this.isAttacking = false;
        }

        this.checkSpeedChange();
        this.findTarget();

        if (this.target) {
            this.isAttacking = true;
            if (this.team == game.team1) {
                if (p1KingActivated || this.stats.name != 'king') this.shoot(this.target);
            } else {
                if (p2KingActivated || this.stats.name != 'king') this.shoot(this.target);
            }
        }
    }

    findTarget() {
        if (this.target && !this.target.dead && this.isAttacking) return;

        let minDist = Infinity;
        let closestEnemy = null;
        for (let i = 0; i < entities.length; i++) {
            let e = entities[i];
            if (e.team == this.team || e.invisible || e.hidden) continue;
            if (e.type == 'bomb' || e.type == 'waypoint') continue;

            let dist = M.dist(this.x, this.y, e.x, e.y);

            if (dist < minDist && dist < this.stats.range + e.stats.size) {
                minDist = dist;
                closestEnemy = e;
            }
        }

        this.target = closestEnemy;
    }

    takeDamage(amount, e = null) {
        if (this.team == game.team1) {
            if (!p1KingActivated && this.stats.name == 'king') p1KingActivated = true;
        } else {
            if (!p2KingActivated && this.stats.name == 'king') p2KingActivated = true;
        }
        if (this.hp <= amount) {
            this.dead = true;
        } else {
            this.hp -= amount;
        }
    }
}

class AOE {
    constructor(x, y, stats, team, owner = null, bonusDamage = 0) {
        this.x = x;
        this.y = y;
        this.stats = stats;
        this.radius = this.stats.radius;
        this.lifetime = stats.lifetime || 250;
        this.team = team;
        this.dead = false;
        this.target = stats.target || 'all';
        this.owner = owner;
        this.pulseCooldown = stats.pulseTime || 0;
        this.pulseCount = stats.pulseCount || 1;
        this.spawnCooldown = stats.initSpawnSpeed || 0;
        this.bonusDamage = bonusDamage;

        if (!this.stats.lifetime) this.stats.lifetime = 250;

        this.aoeDamage();
    }

    draw() {
        let y = isHost ? this.y : c.height - this.y;
        ctx.beginPath();
        if (this.stats.colour) ctx.fillStyle = this.stats.colour;
        else ctx.fillStyle = this.team == game.team1 ? '#00046f79' : '#ff840059';
        ctx.arc(this.x, y, this.radius, 0, 2 * Math.PI); 
        ctx.fill();
    }

    update() {
        if (this.pulseCooldown > 0) {
            this.pulseCooldown -= 1000 / 60;
        } else if (this.pulseCount > 0) {
            this.aoeDamage();
            if (this.stats.shrink != false) {
                this.lifetime = this.stats.lifetime || 250;
                this.radius = this.stats.radius;
            }
        }

        if (this.spawnCooldown > 0) {
            this.spawnCooldown -= 1000 / 60;
        } else if (this.stats.spawnStats) {
            this.spawnUnit();
            this.spawnCooldown = this.stats.spawnSpeed;
        }

        if (this.lifetime > 0) {
            this.lifetime -= 1000 / 60;

            if (this.stats.shrink == true || this.stats.shrink == null) {
                this.radius = Math.max(10, this.stats.radius * (this.lifetime / this.stats.lifetime));
            }
        } else if (this.pulseCount == 0) {
            this.dead = true;
        }

        if (this.stats.pullForce) this.pull();
    }

    aoeDamage() {
        this.pulseCooldown = this.stats.pulseTime || 0;
        this.pulseCount--;
        let unitsInRange = [];
        for (let i = 0; i < entities.length; i++) {
            let e = entities[i];
            if (e.type == 'bomb' || e.type == 'waypoint') continue;
            if (e.hidden && !this.stats.canHitHidden) continue;

            if (this.stats.target == 'ground' && e.isFlying) continue;

            let minDist = this.stats.radius + e.stats.size;

            if (M.dist(this, e) < minDist) {
                if (e.team != this.team) {
                    if (!this.stats.damage[0] && !this.stats.hitCount) this.attack(e);
                    else unitsInRange.push(e);
                } else {
                    if (this.stats.heal) e.heal(this.stats.heal);
                    if (this.stats.clone) this.clone(e);
                }
            }
        }

        if (this.stats.damage[0]) this.voidAttack(unitsInRange);
        else if (this.stats.hitCount) this.attackHighest(unitsInRange, this.stats.hitCount);
    }

    attack(e) {
        if (this.stats.freezeDuration) e.freezeTime += this.stats.freezeDuration;

        if (this.stats.slowDuration) {
            e.slowTime += this.stats.slowDuration;
            e.slowAmount = this.stats.slowAmount;
        }

        if (this.stats.stunDuration) e.stunTime += this.stats.stunDuration;

        if (this.stats.ctDamage && (e.stats.name == 'king' || e.stats.name == 'princess')) e.takeDamage(this.stats.ctDamage + this.bonusDamage, this.owner);
        else if (this.stats.buidlingDamage && e.type == 'building') e.takeDamage(this.stats.buidlingDamage + this.bonusDamage, this.owner); 
        else e.takeDamage(this.stats.damage + this.bonusDamage, this.owner);
        if (this.stats.stunDuration) e.stunTime = this.stats.stunDuration;

        if (this.stats.knockback && e.knockbackVel) {
            let dir = M.normalise(e.x - this.x, e.y - this.y);
            e.applyKnockback(dir, this.stats.knockback);
        }

        if (this.pulseCount == this.stats.pulseCount - 1 && this.stats.vineDuration) {
            e.vineTime = this.stats.vineDuration;
        }
    }

    voidAttack(unitsInRange) {
        for (let i = 0; i < unitsInRange.length; i++) {
            let e = unitsInRange[i];
            if (unitsInRange.length < 2) {
                if (this.stats.ctDamage && (e.stats.name == 'king' || e.stats.name == 'princess')) e.takeDamage(this.stats.ctDamage[0], this.owner);
                else e.takeDamage(this.stats.damage[0], this.owner);
                continue;
            }

            if (unitsInRange.length < 5) {
                if (this.stats.ctDamage && (e.stats.name == 'king' || e.stats.name == 'princess')) e.takeDamage(this.stats.ctDamage[1], this.owner);
                else e.takeDamage(this.stats.damage[1], this.owner);
                continue;
            }

            if (this.stats.ctDamage && (e.stats.name == 'king' || e.stats.name == 'princess')) e.takeDamage(this.stats.ctDamage[2], this.owner);
            else e.takeDamage(this.stats.damage[2], this.owner);
        }
    }

    attackHighest(unitsInRange, count) {
        let unitHps = [];
        for (let i = 0; i < unitsInRange.length; i++) {
            unitHps.push(unitsInRange[i].hp);
        }

        let maxHps = M.getLargestInArray(count, unitHps);

        let attackedUnits = 0;
        for (let i = 0; i < maxHps.length; i++) {
            for (let j = 0; j < unitsInRange.length; j++) {
                if (unitsInRange[j].hp == maxHps[i] && attackedUnits++ < count) this.attack(unitsInRange[j]);
            }
        }
    }

    pull() {
        for (let i = 0; i < entities.length; i++) {
            let e = entities[i];

            if (e.type == 'building' || e.team == this.team) continue;

            let minDist = this.stats.radius + e.stats.size;
            if (M.dist(this, e) < minDist) {
                let dir = M.normalise(this.x - e.x, this.y - e.y);
                if (e.applyKnockback) e.applyKnockback(dir, this.stats.pullForce);
            }
        }
    }

    clone(e) {
        if (e.type == 'building') return;
        if (e.stats.isClone) return;
        let dir = (this.team == game.team1) ? 1 : -1;
        let stats = {...e.stats};
        stats.hp = 1;
        if (stats.sheildHP) stats.sheildHP = 1;
        stats.isClone = true;

        entities.push(new UnitEntity(e.x, e.y + dir * 10, e.team, stats));
    }

    spawnUnit() {
        let angle = Math.random() * Math.PI * 2;
        let pos = {x: Math.cos(angle) * this.stats.radius + this.x, y: Math.sin(angle) * this.stats.radius + this.y};

        entities.push(new UnitEntity(pos.x, pos.y, this.team, this.stats.spawnStats));
    }

    serialise() {
        return {x: this.x, y: this.y, name: this.stats.name, team: this.team, radius: this.radius};
    }
}

class Projectile {
    constructor(x, y, stats, direction, team, target = 'all', owner = null) {
        this.x = x;
        this.y = y;
        this.ox = x;
        this.oy = y;
        this.stats = stats;
        this.direction = direction;
        this.team = team;
        this.lifetime = stats.lifetime || 9999;
        this.dead = false;
        this.distance = 0;
        this.target = target;
        this.pierce = stats.pierce || 0;
        this.hitTargets = [];
        this.owner = owner;
        this.returning = false;
        this.bonusDamage = 0;
        
        this.particleCooldown = stats.particleSpeed;

        if (!this.stats.size) this.stats.size = 5;
        if (!this.stats.speed) this.stats.speed = 500;
        if (!this.stats.distance) this.stats.distance = 200;
    }

    draw() {
        let y = isHost ? this.y : c.height - this.y;
        if (this.stats.width) {
            ctx.beginPath();
            if (this.stats.colour) ctx.fillStyle = this.stats.colour;
            else ctx.fillStyle = '#000';
            let nx = -this.stats.width / 2 + this.x;
            let ny = this.stats.height / 2 + y;
            ctx.fillRect(nx, ny, this.stats.width, this.stats.height);
        } else {
            ctx.beginPath();
            if (this.stats.colour) ctx.fillStyle = this.stats.colour;
            else ctx.fillStyle = '#000';
            ctx.arc(this.x, y, this.stats.size, 0, 2*Math.PI);
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

        if (this.particleCooldown > 0) this.particleCooldown -= 1000 / 60;
        else {
            for (let i = 0; i < this.stats.particleCount; i++) {
                let x = Math.random() * (this.stats.particleSpread + this.stats.particleSpread) - this.stats.particleSpread;
                let y = Math.random() * (this.stats.particleSpread + this.stats.particleSpread) - this.stats.particleSpread;

                particles.push(new Particle(x + this.x, y + this.y, this.stats.particle));
            }
        }

        if (this.distance > this.stats.distance) {
            if (this.stats.returns && !this.returning) {
                this.distance = 0;
                this.direction.x *= -1;
                this.direction.y *= -1;
                this.hitTargets = [];
                this.returning = true;
            } else {
                this.dead = true;
                if (this.stats.aoeOnDeath) aoes.push(new AOE(this.x, this.y, this.stats.aoeStats, this.team, this.owner));
                return;
            }
        }

        let xAmount = this.direction.x * this.stats.speed / 60 * 0.75;
        let yAmount = this.direction.y * this.stats.speed / 60 * 0.75;

        this.x += xAmount;
        this.y += yAmount;
        this.distance += Math.sqrt(xAmount * xAmount + yAmount * yAmount);

        this.collide();
    }

    collide() {
        if (this.target == 'all') {
            for (let i = 0; i < entities.length; i++) {
                let u = entities[i];

                if (u.team == this.team || u.type == 'bomb') continue;
                if (u.hidden && !this.stats.canHitHidden) continue;
                if (this.stats.targetPriority == 'ground' && u.isFlying) continue;
                if (this.stats.target == 'buildings' && (u.type == 'unit' || u.isFlying)) continue;

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

        if (this.stats.snareDuration) {
            u.snareTime = this.stats.snareDuration;
        }

        if (this.pierce > 0) {
            this.pierce -= 1;
            if (this.stats.ctDamage && (u.stats.name == 'king' || u.stats.name == 'princess')) u.takeDamage(this.stats.ctDamage + this.bonusDamage, this.owner);
            else u.takeDamage(this.stats.damage + this.bonusDamage, this.owner);
            this.hitTargets.push(u);
        } else {
            if (this.stats.aoeStats) {
                aoes.push(new AOE(this.x, this.y, this.stats.aoeStats, this.team, this.owner, this.bonusDamage));
            } else {
                if (this.stats.ctDamage && (u.stats.name == 'king' || u.stats.name == 'princess')) u.takeDamage(this.stats.ctDamage + this.bonusDamage, this.owner);
                else u.takeDamage(this.stats.damage + this.bonusDamage, this.owner);
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

    serialise() {
        return {x: this.x, y: this.y, name: this.stats.name, team: this.team};
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
        let y = isHost ? this.y : c.height - this.y;
        let oy = isHost ? this.oy : c.height - this.oy;
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#00e1ff';
        ctx.moveTo(this.x, y);
        ctx.lineTo(this.ox, oy);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.moveTo(this.x, y);
        ctx.lineTo(this.ox, oy);
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
            if (e.type == 'bomb') continue;
            if (this.attacked.includes(e)) continue;

            let dist = M.dist(this.x, this.y, e.x, e.y);

            if (dist < minDist && dist < this.stats.range) {
                if (this.stats.targetPriority == 'buildings') {
                    if (e.type == 'building') {
                        minDist = dist;
                        closestEnemy = e;
                    } else {
                        continue;
                    }
                } else if (this.stats.targetPriority == 'ground') {
                    if (!e.isFlying) {
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

    serialise() {
        return {x: this.x, y: this.y, ox: this.ox, oy: this.oy, name: this.stats.name, team: this.team, type: 'lightning'};
    }
}

class Particle {
    constructor(x, y, stats, team = game.team1, totalTime = 0) {
        this.x = x;
        this.y = y;
        this.size = (Math.random() * (stats.size.max - stats.size.min) + stats.size.min) || stats.size;
        this.stats = stats;
        this.totalTime = totalTime;
        this.time = 0;
        this.team = team;

        this.lifetime = stats.lifetime || totalTime + 250;
        this.dead = false;
    }

    draw() {
        let y = isHost ? this.y : c.height - this.y
        if (this.stats.isTimer) {
            const percent = Math.min(this.time / this.totalTime, 1);
            const endAngle = -Math.PI / 2 + percent * Math.PI * 2;
            ctx.beginPath();
            ctx.fillStyle = this.stats.colour;
            ctx.lineWidth = 10;
            ctx.arc(this.x, y, this.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.strokeStyle = (this.team == game.team1) ? '#3966f9ff' : '#fc3b3bff';
            ctx.lineWidth = this.size - 2;
            ctx.arc(this.x, y, this.size - (this.size / 2 + 2), -Math.PI / 2, endAngle);
            ctx.stroke();

            ctx.beginPath();
            ctx.strokeStyle = (this.team == game.team1) ? '#1639aeff' : '#a21818ff';
            ctx.lineWidth = 3;
            ctx.moveTo(this.x, y);
            ctx.lineTo(Math.cos(endAngle) * (this.size) + this.x, Math.sin(endAngle) * (this.size) + y);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.fillStyle = this.stats.colour;
            ctx.arc(this.x, y, this.size, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    update() {
        if (this.lifetime > 0) this.lifetime -= 1000 / 60;
        else {
            this.dead = true;
        }

        if (this.time < this.totalTime) this.time += 1000 / 60;
    }

    serialise() {
        return {x: this.x, y: this.y, stats: this.stats, size: this.size, team: this.team, totalTime: this.totalTime, time: this.time};
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

    static pointOnCirc(a) {
        return {x: Math.cos(a), y: Math.sin(a)};
    }

    static getLargestInArray(num, array) {
        if (num >= array.length) return array.sort();
        let sorted = array.sort((a, b) => b - a);

        return sorted.splice(0, num).sort();
    }
}

function runAI() {
    if (Math.random() < 0.5) return;
    let spawnPoints = [{x: c.width / 2, y: 300}, {x: game.laneLeftX, y: game.princessY + 50}, {x: game.laneRightX, y: game.princessY + 50}];
    let i = Math.floor(Math.random() * p2Hand.length);
    let stats = p2Units[p2Hand[i]];

    if (stats.name == 'Goblin Barrel' || stats.name == 'Miner') {
        spawnPoints = [{x: game.laneLeftX, y: c.height - game.princessY}, {x: game.laneRightX, y: c.height - game.princessY}];
    } else if (stats.name == 'Elixir Collector') {
        spawnPoints = [{x: 50, y: 50}, {x: 120, y: 50}, {x: c.width - 50, y: 50}, {x: c.width - 120, y: 50}];
    } else if (stats.name == '') {

    }

    let spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];

    spawnUnit(spawnPoint.x, spawnPoint.y, i, game.team2);
}

function updateElixir() {
    p1Elixir = Math.min(game.maxElixir, p1Elixir + (game.p1ElixirMult * elixirMult) / 100);

    p2Elixir = Math.min(game.maxElixir, p2Elixir + (game.p2ElixirMult * elixirMult) / 100);

    updateElixirUI();
}

function updateElixirUI() {
    elixirBarGrey.style.width = `${p1Elixir / game.maxElixir * 100}%`;
    elixirBar.style.width = `${Math.floor(p1Elixir) / game.maxElixir * 100}%`;
    elixirNum.innerHTML = Math.floor(p1Elixir);

    updateCardDisabledState();
}

function spawnUnit(x, y, index, team) {
    if (index == -1) return;

    let stats = null;

    if (team == game.team1) {
        stats = p1Units[p1Hand[index]];
        let spawnStats = stats.name == 'Mirror' ? p1Units[p1Cycles[p1Cycles.length - 1]] : stats;
        let cost = stats.name == 'Mirror' ? spawnStats.cost + 1 : spawnStats.cost;;
        stats = spawnStats;

        if (p1Elixir < cost) return;
        p1Elixir -= cost;

        p1Cycles.push(p1Hand[index]);
        p1Hand[index] = p1Cycles[0];
        p1Cycles.splice(0, 1);

        if (stats.type != 'spell' && stats.deployType != 'spell' || stats.width) {
            let newPos = findMax(x, y);
            if (newPos.x) x = newPos.x;
            if (newPos.y) y = newPos.y;
        }
    } else {
        stats = p2Units[p2Hand[index]];
        let spawnStats = stats.name == 'Mirror' ? p2Units[p2Cycles[p2Cycles.length - 1]] : stats;
        let cost = stats.name == 'Mirror' ? spawnStats.cost + 1 : spawnStats.cost;
        stats = spawnStats;

        if (p2Elixir < cost) return;
        p2Elixir -= cost;

        p2Cycles.push(p2Hand[index]);
        p2Hand[index] = p2Cycles[0];
        p2Cycles.splice(0, 1);
    }

    updateElixirUI();
    
    if (stats.spawnDelay) {
        setTimeout(function() {spawnLogic(x, y, team, stats)}, stats.spawnDelay);
    } else {
        spawnLogic(x, y, team, stats);
    }
}

function spawnLogic(x, y, team, stats) {
    if (stats.count == 2) {
        spawnRequest(x - 10, y, stats, team);
        spawnRequest(x + 10, y, stats, team);
    } else if (stats.count == 3) {
        spawnRequest(x + 10, y, stats, team);
        spawnRequest(x, y + 10, stats, team);
        spawnRequest(x - 10, y, stats, team);
    } else if (stats.count == 15) {
        for (let i = 0; i < 15; i++) {
            spawnRequest(x + i, y + Math.random(), stats, team);
        }
    } else if (stats.name == 'Royal Recruits') {
        for (let i = 0; i < 6; i++) {
            spawnRequest(x - c.width / 2 + (c.width / 6 * i) + c.width / 12, y, stats, team);
        }
    } else if (stats.count == 6) {
        for (let i = 0; i < 6; i++) {
            spawnRequest(x + i, y + Math.random(), stats, team);
        }
    } else if (stats.count == 5) {
        spawnRequest(x + 30, y, stats, team);
        spawnRequest(x - 30, y, stats, team);
        spawnRequest(x, y + 30, stats, team);
        spawnRequest(x - 20, y - 20, stats, team);
        spawnRequest(x + 20, y - 20, stats, team);
    } else if (stats.count == 4) {
        spawnRequest(x + 10, y + 10, stats, team);
        spawnRequest(x - 10, y + 10, stats, team);
        spawnRequest(x + 10, y - 10, stats, team);
        spawnRequest(x - 10, y - 10, stats, team);
    } else if (stats.type == 'spell' && !stats.hp && !stats.distance) {
        spawnRequest(x, y, stats, team, 'aoe');
    } else if (stats.name == 'Log' || stats.name == 'Barbarian Barrel') {
        let dir = (team == game.team1) ? {x: 0, y: -1} : {x: 0, y: 1};
        spawnRequest(x, y, stats, team, 'log', dir);
    } else if (stats.name == 'Goblin Gang') {
        let dir = (team == game.team1) ? 10 : -10;
        spawnRequest(x + 30, y - dir, units.goblins, team);
        spawnRequest(x, y - dir * 2.5, units.goblins, team);
        spawnRequest(x - 30, y - dir, units.goblins, team);
        spawnRequest(x + 30, y + dir, units.spearGoblins, team);
        spawnRequest(x, y + dir * 2.5, units.spearGoblins, team);
        spawnRequest(x - 30, y + dir, units.spearGoblins, team);
    } else if (stats.name == 'Rascals') {
        let dir = (team == game.team1) ? 10 : -10;
        spawnRequest(x, y, otherUnits.rascalBoy, team);
        spawnRequest(x + 30, y + dir * 5, otherUnits.rascalGirl, team);
        spawnRequest(x - 30, y + dir * 5, otherUnits.rascalGirl, team);
    } else if (stats.name == 'Goblin Barrel' || stats.name == 'Miner' || stats.name == 'Goblin Drill') {
        let startX = c.width / 2;
        let startY = (team == game.team1) ? c.height - game.kingY : game.kingY;
        let dir = {x: x - startX, y: y - startY};

        dir = M.normalise(dir);
        spawnRequest(startX, startY, stats, team, 'projectile', dir, {x: x, y: y});
    } else {
        spawnRequest(x, y, stats, team);
    }

    if (stats.deployTime) particleRequest(x, y + (stats.size || 20) + 10, particleStats.timer, team, stats.deployTime);
}

function gameover(loser) {
    const offline = !isConnected || !conn;

    gameFinished = true;

    if (!offline && isHost) {
        conn.send({type: 'TOWER_INFO', team: game.team1, towerDead: p2TowerDead});
        conn.send({type: 'TOWER_INFO', team: game.team2, towerDead: p1TowerDead});
        conn.send({type: 'GAMEOVER', loser: loser});
    }

    let winner;
    if (offline) {
        winner = loser != game.team1 ? 'Player' : 'BallsinBox';
    } else {
        if ((isHost && loser == game.team1) || (!isHost && loser == game.team1)) winner = 'Peer';
        else winner = 'Host';
    }

    gameoverMessage.innerHTML = `${winner} Wins!`;

    restartButton.style.background = '#10b981';
    if (offline) restartButton.innerHTML = 'Play Again';

    gameoverScreen.style.visibility = 'visible';
    gameoverScreen.style.opacity = '1';

    multiplayerMenu.style.display = 'block';

    if (isHost) {
        entities = [];
        projectiles = [];
        aoes = [];
        particles = [];
    }

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

    multiplayerMenu.style.display = 'none';

    p1Elixir = game.p1StartElixir;
    p2Elixir = game.p2StartElixir;
    p1KingActivated = false;
    p1TowerDead = {left: false, right: false, king: false};
    p2KingActivated = false;
    p2TowerDead = {left: false, right: false, king: false};

    elixirMult = 1;

    updateElixirUI();

    if (game.randomiseEnemyUnits) randomiseEnemyUnits();
    randomiseP1Units();

    let p1UnitsArr = Object.keys(p1Units);
    let p2UnitsArr = Object.keys(p2Units);

    let p1Deck = [...p1UnitsArr];
    M.shuffle(p1Deck);
    p1Hand = p1Deck.slice(0, 4);
    p1Cycles = p1Deck.slice(4);

    let p2Deck = [...p2UnitsArr];
    M.shuffle(p2Deck);
    p2Hand = p2Deck.slice(0, 4);
    p2Cycles = p2Deck.slice(4);

    drawHandUI();

    if (isHost) {
        //Peer Towers
        entities.push(new TowerEntity(c.width / 2, game.kingY, game.team2, towers.king));
        entities.push(new TowerEntity(game.laneLeftX, game.princessY, game.team2, towers.princess));
        entities.push(new TowerEntity(game.laneRightX, game.princessY, game.team2, towers.princess));
        
        //Host Towers
        entities.push(new TowerEntity(c.width / 2, c.height - game.kingY, game.team1, towers.king));
        entities.push(new TowerEntity(game.laneLeftX, c.height - game.princessY, game.team1, towers.princess));
        entities.push(new TowerEntity(game.laneRightX, c.height - game.princessY, game.team1, towers.princess));
    }

    elixirIntervalID = setInterval(updateElixir, game.elixirRate);
    if (!isConnected) runAIIntervalID = setInterval(runAI, 1000);
    if (isHost) timerIntervalID = setInterval(stepTimer, 100);
}

function requestStart() {
    if (!isConnected || !conn) {
        reset();
        return;
    }

    restartButton.style.background = '#333';

    if (peerIsReady && isHost) {
        reset();
        conn.send({type: 'READY'});
    } else if (!isHost) {
        conn.send({type: 'READY'});
    } else if (isHost) {
        isReady = true;
    }
}

function randomiseEnemyUnits() {
    let unitsArr = Object.keys(units);

    for (let i = 0; i < 8; i++) {
        let index = Math.floor(Math.random() * unitsArr.length);
        let u = units[unitsArr[index]];

        p2Units['unit' + (i+1)] = u;

        unitsArr.splice(index, 1);
    }
}

function randomiseP1Units() {
    let unitsArr = Object.keys(units);
    
    for (let i = 0; i < 8; i++) {
        let u = p1Units['unit' + (i+1)];
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
        let u = p1Units['unit' + (i+1)];
        let isRandom = !u || randomP1Units['unit' + (i+1)];
        if (isRandom) {
            let index = Math.floor(Math.random() * unitsArr.length);
            let u = units[unitsArr[index]];

            p1Units['unit' + (i+1)] = u;

            unitsArr.splice(index, 1);
        }
    }
}

function drawHandUI() {
    cardBar.innerHTML = '';

    for (let i = 0; i < p1Hand.length; i++) {
        let cardStats = p1Units[p1Hand[i]];
        let cardElem = document.createElement('div');

        if (!cardStats) continue;

        cardElem.classList.add('card');

        let symbol = cardStats.name == 'Mirror' ? '🪞' + p1Units[p1Cycles[p1Cycles.length - 1]].symbol : (cardStats.displaySymbol || cardStats.symbol);
        let cost = cardStats.name == 'Mirror' ? p1Units[p1Cycles[p1Cycles.length - 1]].cost + 1 : cardStats.cost;

        cardElem.innerHTML = `
            <h2>${symbol}</h2>
            <div style="font-weight: 700;">${cardStats.name}</div>
            <div style="font-weight: 700;">Cost: <span style="color: #df00df;">${cost}</span></div>
        `;

        if (window.innerWidth < 800) {
            cardElem.style.width = `${(window.innerWidth - 25) / 4}px`
        }

        if (i === mouse.selection) {
            cardElem.classList.add('selected');
        }

        if (cost > p1Elixir) {
            cardElem.classList.add('disabled');
        }

        cardElem.addEventListener('click', () => cardClick(cardElem, i));
        cardBar.appendChild(cardElem);
    }

    const nextCard = document.getElementById('nextCard');

    let nextCardStats = p1Units[p1Cycles[0]];

    if (nextCardStats) {
        nextCard.innerHTML = `
            <h2>${nextCardStats.displaySymbol || nextCardStats.symbol}</h2>
            <div style="font-weight: 700;">${nextCardStats.name}</div>
            <div style="font-weight: 700;">Cost: <span style="color: #df00df;">${nextCardStats.cost}</span></div>
        `;
    }
}

function updateCardDisabledState() {
    const cards = cardBar.children;

    for (let i = 0; i < cards.length; i++) {
        const cardStats = p1Units[p1Hand[i]];
        if (!cardStats) continue;
        let cost = cardStats.name == 'Mirror' ? p1Units[p1Cycles[p1Cycles.length - 1]].cost + 1 : cardStats.cost;

        cards[i].classList.toggle(
            'disabled',
            cost > p1Elixir
        );
    }
}

function cardClick(cardElem, index) {
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

function createGrid(hsl1, hsl2, v) {
    const img = document.createElement("canvas");
    img.width = c.width;
    img.height = c.height;

    const g = img.getContext("2d");

    const cols = c.width / game.gridSize;
    const rows = c.height / game.gridSize;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const offset1 = Math.random() * (v + v) - v;
            const nl1 = Math.min(100, Math.max(0, hsl1.l + offset1));
            const c1 = `hsl(${hsl1.h}, ${hsl1.s}%, ${nl1}%)`;
            const offset2 = Math.random() * (v + v) - v;
            const nl2 = Math.min(100, Math.max(0, hsl2.l + offset2));
            const c2 = `hsl(${hsl2.h}, ${hsl2.s}%, ${nl2}%)`;

            g.fillStyle = (x + y) & 1 ? c1 : c2;
            g.fillRect(x * game.gridSize, y * game.gridSize, game.gridSize, game.gridSize);
        }
    }

    return img;
}

function drawMap() {
    //Grid
    if (!gridCanvas) gridCanvas = createGrid({h: 74, s: 50, l: 52}, {h: 77, s: 46, l: 51}, 2);
    ctx.drawImage(gridCanvas, 0, 0);

    //Lanes
    ctx.beginPath();
    ctx.fillStyle = '#d0aa69';
    ctx.fillRect(game.laneLeftX - 12, game.princessY - 84, 24, c.height - (game.princessY - 84) * 2);
    ctx.fillRect(game.laneRightX - 12, game.princessY - 84, 24, c.height - (game.princessY - 84) * 2);

    //Back lines
    ctx.fillRect(game.laneLeftX - 12, game.princessY - 84, 240, 24);
    ctx.fillRect(game.laneLeftX - 12, c.height - game.princessY + 84, 240, 24);

    //Crown tower squares
    //King
    ctx.fillRect(c.width / 2 - 48, game.kingY - 48, 96, 96);
    ctx.fillRect(c.width / 2 - 48, c.height - game.kingY - 48, 96, 96);
    //Princess
    ctx.fillRect(game.laneLeftX - 36, game.princessY - 36, 72, 72);
    ctx.fillRect(game.laneRightX - 36, game.princessY - 36, 72, 72);
    ctx.fillRect(game.laneLeftX - 36, c.height - game.princessY - 36, 72, 72);
    ctx.fillRect(game.laneRightX - 36, c.height - game.princessY - 36, 72, 72);

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

    let g = ctx.createRadialGradient(c.width / 2, c.height / 2, 300, c.width / 2, c.height / 2, 1000);
    g.addColorStop(0, 'rgba(0, 0, 0, 0)');
    g.addColorStop(0.5, '#000000');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);

    //Draw no deploy area
    let isSpell = null;
    if (mouse.selection != -1) isSpell = p1Units[p1Hand[mouse.selection]].type == 'spell' || p1Units[p1Hand[mouse.selection]].deployType == 'spell';

    if (mouse.selection != -1 && !isSpell) {
        ctx.fillStyle = '#d700005c';
        ctx.strokeStyle = '#7f0000ff';
        ctx.lineWidth = 4;

        let towerDead = isHost ? p2TowerDead : p1TowerDead;

        if (towerDead.left && towerDead.right) {
            ctx.fillRect(0, 0, c.width, game.river + (game.riverWidth / 2) + game.deployMaxY2);
            ctx.strokeRect(0, 0, c.width, game.river + (game.riverWidth / 2) + game.deployMaxY2);
        }
        
        if (towerDead.left && !towerDead.right) {
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

        if (!towerDead.left && towerDead.right) {
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

        if (!towerDead.left && !towerDead.right) {
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
            <h2>${cardStats.displaySymbol || cardStats.symbol}</h2>
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
        p1Units['unit' + (handIndex + 1)] = null;
        randomP1Units['unit' + (handIndex + 1)] = true;
    } else {
        if (cardElem.style.opacity == 0.2 && !debug.pickSameCards) return;
        let children = chosenCards.children;
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child.classList.contains('occupied')) continue;

            child.innerHTML = `
                <h2>${stats.displaySymbol || stats.symbol}</h2>
                <div style="font-weight: 700;">${stats.name}</div>
                <div style="font-weight: 700;">Cost: <span style="color: #df00df;">${stats.cost}</span></div>
            `;
            child.classList.add('occupied');

            cardElem.style.opacity = 0.2;

            child.addEventListener('click', () => cardChoiceClick(child, stats, true, index, i));

            p1Units['unit' + (i + 1)] = stats;
            randomP1Units['unit' + (i + 1)] = false;
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

    let towerDead = isHost ? p2TowerDead : p1TowerDead;

    //Both Dead
    if (towerDead.left && towerDead.right) {
        if (y < game.river + (game.riverWidth / 2) + game.deployMaxY2) ny = game.river + (game.riverWidth / 2) + game.deployMaxY2;
    }

    //Both Alive
    if (!towerDead.left && !towerDead.right) {
        if (y < game.river + (game.riverWidth / 2) + game.deployMaxY) ny = game.river + (game.riverWidth / 2) + game.deployMaxY;
    }

    //Left Dead
    if (towerDead.left && !towerDead.right) {
        
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
    if (!towerDead.left && towerDead.right) {
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
    let p1TowersDestroyed = 0;
    let p2TowersDestroyed = 0;

    if (p2TowerDead.left) p1TowersDestroyed++;
    if (p2TowerDead.right) p1TowersDestroyed++;

    if (p1TowerDead.left) p2TowersDestroyed++;
    if (p1TowerDead.right) p2TowersDestroyed++;

    let displayTime = timeLeft;
    if (timeLeft <= 60) {
        elixirMult = 2;
    }
    if (timeLeft <= 0) {
        displayTime = overtimeLeft;
        if (p1TowersDestroyed > p2TowersDestroyed) gameover(game.team2);
        if (p2TowersDestroyed > p1TowersDestroyed) gameover(game.team1);
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
    const totalCrownDisplay = document.getElementById('totalCrownDisplay');
    const newCrownDisplay = document.getElementById('newCrownDisplay');

    if (game.p1ElixirMult > 1 || debug.pickSameCards || game.p2ElixirMult < 1) {
        newCrownDisplay.innerHTML = 'No crowns given';
        newCrownDisplay.style.display = 'block';
        return;
    }

    totalCrownDisplay.innerHTML = `${localStorage.crowns || 0} 👑`;
    let crownAmount = 3;

    if (p1TowerDead.left) crownAmount--;
    if (p1TowerDead.right) crownAmount--;
    if (p1TowerDead.king) crownAmount--;
    
    if (p2TowerDead.left) crownAmount++;
    if (p2TowerDead.right) crownAmount++;
    if (p2TowerDead.king) crownAmount++;

    crowns += crownAmount;
    localStorage.crowns = crowns;

    totalCrownDisplay.innerHTML = `${localStorage.crowns || 0} 👑`;
    newCrownDisplay.innerHTML = `+${crownAmount}👑`;
    newCrownDisplay.style.display = 'block';
}

function addElixir(team, amount) {
    if (team == game.team1) {
        p1Elixir = Math.min(game.maxElixir, p1Elixir + amount);
    } else {
        p2Elixir = Math.min(game.maxElixir, p2Elixir + amount);
    }
}