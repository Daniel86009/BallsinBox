const statusDiv = document.getElementById('status');
const codeInput = document.getElementById('peerCode');

let peer = null;
let conn = null;
let isHost = true;
let isConnected = false;

function startHosting() {
    isHost = true;
    peer = new Peer(codeInput.value);
    peer.on('open', (id) => statusDiv.textContent = "Hosting: " + id);
    peer.on('connection', (c) => {
        conn = c;
        setupEvents();
    });
}

function joinRoom() {
    isHost = false;
    peer = new Peer(); 
    peer.on('open', () => {
        conn = peer.connect(codeInput.value);
        setupEvents();
    });
}

function setupEvents() {
    conn.on('open', () => {
        isConnected = true;

        restartButton.innerHTML = 'Ready';
        statusDiv.textContent = "Connected!";
        statusDiv.style.color = "#10b981";
    });

    conn.on('data', (data) => {
        if (isHost && data.type == 'SPAWN_REQUEST') {
            let e = data.entity;
            console.log(e.x, e.y, e.team, e.stats, e.target);
            if (e.type == 'unit') {
                entities.push(new UnitEntity(e.x, e.y, e.team, e.stats));
            } else if (e.type == 'projectile') {
                projectiles.push(new Projectile(e.x, e.y, e.stats, {x: e.dir.x, y: -e.dir.y}, e.team, {x: e.target.x, y: c.height - e.target.y}));
            } else if (e.type == 'log') {
                projectiles.push(new Projectile(e.x, e.y, e.stats, {x: e.dir.x, y: -e.dir.y}, e.team));
            } else if (e.type == 'aoe') {
                aoes.push(new AOE(e.x, e.y, e.stats, e.team));
            }
            
        } else if (!isHost && data.type == 'SYNC') {
            entities = [];
            aoes = [];
            projectiles = [];
            particles = [];
            for (let i = 0; i < data.entities.length; i++) {
                let stats = data.entities[i];
                let e = null;
                let unitStats = null;

                if (stats.name != 'Miner' && stats.name != 'Goblin Drill') {
                    let unitKeys = Object.keys(units);
                    for (let j = 0; j < unitKeys.length; j++) {
                        let u = units[unitKeys[j]];

                        if (u.name == stats.name) unitStats = u;
                    }
                }

                if (!unitStats) {
                    let otherUnitKeys = Object.keys(otherUnits);
                    for (let j = 0; j < otherUnitKeys.length; j++) {
                        let u = otherUnits[otherUnitKeys[j]];

                        if (u.name == stats.name) unitStats = u;
                    }
                }

                if (!unitStats) {
                    let towerUnitKeys = Object.keys(towers);
                    for (let j = 0; j < towerUnitKeys.length; j++) {
                        let u = towers[towerUnitKeys[j]];

                        if (u.name == stats.name) unitStats = u;
                    }
                }

                if (!unitStats) {
                    console.log(stats.name);
                    continue;
                }

                if (stats.name == 'princess' || stats.name == 'king') {
                    e = new TowerEntity(stats.x, stats.y, stats.team, unitStats);
                } else {
                    e = new UnitEntity(stats.x, stats.y, stats.team, unitStats);
                }

                e.hp = stats.hp;
                e.sheildHP = stats.sheildHP;
                e.freezeTime = stats.freezeTime;
                e.slowTime = stats.slowTime;
                e.rageTime = stats.rageTime;
                e.charging = stats.charging;
                e.isAttacking = stats.isAttacking;
                e.hidden = stats.hidden;
                e.isFlying = stats.isFlying;
                e.vineTime = stats.vineTime;
                e.invisible = stats.invisible;
                if (stats.target) e.target = stats.target;

                entities.push(e);
            }

            for (let i = 0; i < data.aoes.length; i++) {
                let stats = data.aoes[i];
                let aStats = aoeStats[stats.name];

                if (!aStats) {
                    let unitKeys = Object.keys(units);
                    for (let j = 0; j < unitKeys.length; j++) {
                        let u = units[unitKeys[j]];

                        if (u.name == stats.name) aStats = u;
                    }
                }

                let aoe = new AOE(stats.x, stats.y, aStats, stats.team);

                aoe.radius = stats.radius;

                aoes.push(aoe);
            }

            for (let i = 0; i < data.projectiles.length; i++) {
                let stats = data.projectiles[i];
                let pStats = projectileStats[stats.name];
                let p = null;

                if (!pStats) {
                    let unitKeys = Object.keys(units);
                    for (let j = 0; j < unitKeys.length; j++) {
                        let u = units[unitKeys[j]];

                        if (u.name == stats.name) pStats = u;
                    }
                }

                if (stats.type == 'lightning') {
                    p = new ChainLighning(stats.x, stats.y, stats.ox, stats.oy, pStats, stats.team);
                } else {
                    p = new Projectile(stats.x, stats.y, pStats, {x: 0, y: 0}, stats.team);
                }

                projectiles.push(p);
            }
                   
            for (let i = 0; i < data.particles.length; i++) {
                let stats = data.particles[i];
                let p = new Particle(stats.x, stats.y, stats.stats);

                p.size = stats.size;

                particles.push(p);
            }

            timeLeft = data.time.t;
            overtimeLeft = data.time.ot;
        } else if (!isHost && data.type == 'GAMEOVER') {
            gameover(data.loser);
        } else if (!isHost && data.type == 'TOWER_INFO') {
            if (data.team == game.team1) {
                p1TowerDead = data.towerDead;
            } else {
                p2TowerDead = data.towerDead;
            }
        } else if (data.type == 'READY') {
            if (isHost) {
                if (isReady) {
                    reset();
                    conn.send({type: 'READY'});
                } else {
                    peerIsReady = true;
                }
            } else {
                reset();
            }
        }
    });
}

function spawnRequest(x, y, stats, team, type = 'unit', dir, target = 'all') {
    if (isHost || !isConnected) {
        if (type == 'unit') {
            entities.push(new UnitEntity(x, y, team, stats));
        } else if (type =='projectile') {
            projectiles.push(new Projectile(x, y, stats, dir, team, target));
        } else if (type == 'log') {
            projectiles.push(new Projectile(x, y, stats, dir, team));
        } else if (type == 'aoe') {
            projectiles.push(new AOE(x, y, stats, team));
        }
        
    } else if (conn && conn.open) {
        conn.send({type: 'SPAWN_REQUEST', entity: {x: x, y: c.height - y, team: game.team2, stats: stats, type: type, dir: dir, target: target}});
    }
}