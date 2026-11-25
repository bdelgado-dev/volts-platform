const $ = id => document.getElementById(id);
const cv = $('game-canvas'), cx = cv.getContext('2d'), mc = $('minimap').getContext('2d');
const RW = 1400, RH = 860, HW = 1200, HH = 760, ORDER = ['wood', 'weld', 'elec', 'proj'];
let W, H, Z = 1, S = 'menu', world = null, bag = [], bagSel = 0, bagOpen = false, K = {}, hudT = 0, musicOn = false, toastT = 0;
const cam = { x: 0, y: 0 };
const rnd = Math.random;

/* ---------- Tools: [icon, name, description, commonly used for] ---------- */
const T = {
    saw: ['🪚', 'Hand Saw', 'A toothed blade that cuts wood.', 'Cutting boards and planks.'],
    tape: ['📏', 'Tape Measure', 'A retractable, lockable ruler.', 'Measuring length before cutting.'],
    hammer: ['🔨', 'Claw Hammer', 'A weighted head with a claw for nails.', 'Driving and pulling nails.'],
    pencil: ['✏️', "Carpenter's Pencil", 'A flat pencil that will not roll.', 'Marking cut lines.'],
    square: ['📐', 'Try Square', 'A right-angle guide.', 'Marking and checking 90 degree corners.'],
    clamp: ['🗜️', 'Clamp', 'Grips a workpiece so it cannot move.', 'Holding parts while glue dries or metal is joined.'],
    driver: ['🪛', 'Screwdriver', 'Turns screws with a shaped tip.', 'Fastening screws and terminals.'],
    drill: ['🛠️', 'Power Drill', 'Spins a bit to make holes.', 'Drilling pilot holes before screwing.'],
    sand: ['🟫', 'Sandpaper', 'Paper coated with grit.', 'Smoothing rough wood and splinters.'],
    glue: ['🧴', 'Wood Glue', 'A strong adhesive for wood joints.', 'Bonding joints permanently.'],
    chisel: ['🔪', 'Wood Chisel', 'A sharp flat blade struck with a mallet.', 'Cutting joints and slots.'],
    plane: ['🪵', 'Hand Plane', 'A blade set in a flat body.', 'Shaving wood flat and smooth.'],
    level: ['⚖️', 'Spirit Level', 'A tube with a bubble that shows flat or upright.', 'Checking surfaces are level.'],
    paint: ['🖌️', 'Paint Brush', 'Bristles for spreading paint.', 'Painting and sealing finished projects.'],
    helmet: ['🪖', 'Welding Helmet', 'A dark-lens mask that shields eyes and face.', 'Protecting from arc light and sparks.'],
    gloves: ['🧤', 'Welding Gloves', 'Thick heat-resistant leather gloves.', 'Handling hot metal safely.'],
    apron: ['🥼', 'Leather Apron', 'A heavy apron that blocks sparks.', 'Protecting the body while welding.'],
    ext: ['🧯', 'Fire Extinguisher', 'Sprays agent onto small fires.', 'Fire safety in workshops.'],
    grinder: ['⚙️', 'Angle Grinder', 'A spinning disc that cuts and smooths metal.', 'Cutting and cleaning metal.'],
    welder: ['🔥', 'Arc Welder', 'Makes an electric arc that melts metal.', 'Joining metal parts.'],
    chip: ['🔨', 'Chipping Hammer', 'A pointed hammer for slag.', 'Knocking slag off a cooled weld.'],
    brush: ['🧹', 'Wire Brush', 'Stiff metal bristles.', 'Cleaning metal and finished welds.'],
    meter: ['📟', 'Multimeter', 'Measures voltage, current and continuity.', 'Checking if a wire is live.'],
    lock: ['🔒', 'Lockout Tag', 'A lock and tag for a breaker.', 'Stopping others from switching power on.'],
    igloves: ['🧤', 'Insulated Gloves', 'Rubber gloves rated for voltage.', 'Protecting hands from shock.'],
    cutter: ['✂️', 'Wire Cutters', 'Sharp-jawed pliers.', 'Cutting cable cleanly.'],
    stripper: ['🧵', 'Wire Stripper', 'Removes insulation without cutting the wire.', 'Exposing wire ends for connection.'],
    pliers: ['🪝', 'Pliers', 'Gripping jaws that bend and twist.', 'Bending wire and making loops.'],
    etape: ['🎞️', 'Insulating Tape', 'Non-conductive tape.', 'Covering bare wire joints.'],
    bulb: ['💡', 'Light Bulb', 'A lamp that glows when current flows.', 'Lighting.'],
    jbox: ['📦', 'Junction Box', 'A box that holds wire connections.', 'Housing outlets and splices safely.'],
    breaker: ['🎛️', 'Circuit Breaker', 'Cuts power when current is too high.', 'Protecting circuits from overload.'],
    conduit: ['🚰', 'Conduit Pipe', 'A tube that holds wires.', 'Protecting installed cable.'],
    plan: ['📝', 'Blueprint / Plan', 'A drawing with sizes and parts.', 'Planning a project before building.']
};

/* ---------- Mission goals: [finished icon, mission text, station icon] ---------- */
const G = {
    door: ['🚪', 'Escape the room', '🚧'], plank: ['🪵', 'Cut a plank to fit the gap', '🛠️'], ladder: ['🪜', 'Build a ladder', '🛠️'], chair: ['🪑', 'Build a chair', '🛠️'],
    table: ['table', 'Build a table', '🛠️'], cabinet: ['🗄️', 'Build a cabinet', '🛠️'], hinge: ['🚪', 'Repair the gate hinge', '🛠️'], lamp: ['💡', 'Install a ceiling light', '🛠️'],
    switch: ['🔘', 'Wire a light switch', '🛠️'], outlet: ['🔌', 'Install an outlet', '🛠️'], room: ['🏠', 'Wire a whole room', '🛠️'], toolbox: ['🧰', 'Build a toolbox', '🛠️'],
    bird: ['🐦', 'Build a birdhouse', '🛠️'], shelf: ['📚', 'Build a bookshelf', '🛠️'], gate: ['🚧', 'Fabricate a metal gate', '🛠️']
};
const Lv = (t, g, s, st, x) => ({ t, g, s, st, x });

/* ---------- Competencies: 6 levels each, basic to advanced ---------- */
const C = {
    wood: { n: 'Woodworking', ic: '🪵', L: [
        Lv('Boarded Door', 'door', 'Planks are nailed across the exit. Learn your first tool.', [['Which tool cuts through wood?', 'saw']], ['tape', 'hammer']),
        Lv('Measure and Mark', 'plank', 'Cut a plank so it fits the gap in the floor.', [['Measure the gap first.', 'tape'], ['Mark the cut line.', 'pencil'], ['Cut along the line.', 'saw']], ['hammer', 'glue']),
        Lv('Build a Ladder', 'ladder', 'You need a ladder to reach the high window.', [['Measure the side rails.', 'tape'], ['Mark where each rung goes at 90 degrees.', 'square'], ['Cut rails and rungs.', 'saw'], ['Nail each rung in place.', 'hammer'], ['Smooth the splinters.', 'sand']], ['clamp', 'driver']),
        Lv('Build a Chair', 'chair', 'Build a sturdy chair from the lumber pile.', [['Measure the legs.', 'tape'], ['Cut the legs and seat.', 'saw'], ['Check the legs are square.', 'square'], ['Make pilot holes.', 'drill'], ['Drive the screws.', 'driver'], ['Smooth the seat.', 'sand']], ['hammer', 'glue', 'paint']),
        Lv('Build a Table', 'table', 'Build a flat, strong table for the workshop.', [['Measure the top and legs.', 'tape'], ['Cut the pieces.', 'saw'], ['Check the corners are square.', 'square'], ['Spread glue on the joints.', 'glue'], ['Hold the joints while the glue dries.', 'clamp'], ['Check the top is flat.', 'level']], ['chisel', 'hammer']),
        Lv('Master Cabinet', 'cabinet', 'Build a cabinet with fitted joints.', [['Read the cabinet drawings.', 'plan'], ['Cut the panels.', 'saw'], ['Cut the joint slots.', 'chisel'], ['Shave the edges smooth.', 'plane'], ['Glue the joints.', 'glue'], ['Clamp the frame.', 'clamp'], ['Finish by sanding.', 'sand']], ['hammer', 'drill', 'level'])] },
    weld: { n: 'Welding', ic: '🔥', L: [
        Lv('Gear Up', 'door', 'The safety gate only opens for properly dressed welders.', [['Protect your eyes and face.', 'helmet'], ['Protect your hands.', 'gloves'], ['Protect your body from sparks.', 'apron']], ['ext', 'brush']),
        Lv('Fire Safety', 'door', 'A small fire blocks the exit.', [['Put out the small fire.', 'ext'], ['Protect your eyes before you continue.', 'helmet']], ['gloves', 'tape']),
        Lv('Cut and Prepare', 'door', 'A chain locks the gate.', [['Wear eye protection.', 'helmet'], ['Wear hand protection.', 'gloves'], ['Cut the chain.', 'grinder']], ['welder', 'ext']),
        Lv('Strike an Arc', 'hinge', 'A gate hinge snapped. Weld it back.', [['Hold the hinge steady.', 'clamp'], ['Protect your eyes.', 'helmet'], ['Join the metal.', 'welder'], ['Remove the slag.', 'chip'], ['Clean the weld.', 'brush']], ['hammer', 'ext']),
        Lv('Weld a Ladder', 'ladder', 'Weld a steel ladder to reach the roof hatch.', [['Measure the steel bars.', 'tape'], ['Cut the bars.', 'grinder'], ['Clamp the rung in place.', 'clamp'], ['Wear your mask.', 'helmet'], ['Weld the rung.', 'welder'], ['Chip off the slag.', 'chip']], ['sand', 'ext']),
        Lv('Steel Table Frame', 'table', 'Fabricate a steel frame for a work table.', [['Read the frame drawing.', 'plan'], ['Measure the tubes.', 'tape'], ['Cut them to size.', 'grinder'], ['Clamp the corners.', 'clamp'], ['Join with the welder.', 'welder'], ['Chip the slag.', 'chip'], ['Brush clean.', 'brush']], ['saw', 'level', 'ext'])] },
    elec: { n: 'Electrical Installations', ic: '💡', L: [
        Lv('Is It Live?', 'door', 'An electric lock buzzes. Make it safe first.', [['Check for voltage.', 'meter'], ['Protect your hands.', 'igloves'], ['Stop anyone switching the power on.', 'lock']], ['saw', 'driver']),
        Lv('Prepare Wires', 'door', 'A cable blocks the control panel.', [['Cut the cable cleanly.', 'cutter'], ['Expose the wire ends.', 'stripper'], ['Cover the bare joint.', 'etape']], ['hammer', 'bulb']),
        Lv('Install a Light', 'lamp', 'Install a ceiling light.', [['Lock out the power.', 'lock'], ['Test that it is dead.', 'meter'], ['Strip the wire ends.', 'stripper'], ['Tighten the terminals.', 'driver'], ['Fit the bulb.', 'bulb']], ['plane', 'pliers']),
        Lv('Wire a Switch', 'switch', 'Wire a wall switch.', [['Lock out the power.', 'lock'], ['Test that it is dead.', 'meter'], ['Strip the wires.', 'stripper'], ['Bend a loop for the terminal.', 'pliers'], ['Screw the switch down.', 'driver']], ['hammer', 'conduit']),
        Lv('Install an Outlet', 'outlet', 'Install a wall outlet.', [['Lock out the power.', 'lock'], ['Test that it is dead.', 'meter'], ['Strip the wires.', 'stripper'], ['Mount the box.', 'jbox'], ['Fix the outlet.', 'driver'], ['Insulate any bare joint.', 'etape']], ['saw', 'clamp']),
        Lv('Wire a Room', 'room', 'Wire a whole room from the drawing.', [['Read the wiring plan.', 'plan'], ['Lay the conduit.', 'conduit'], ['Cut the cable.', 'cutter'], ['Strip the ends.', 'stripper'], ['Fix the connections.', 'driver'], ['Install the breaker.', 'breaker'], ['Test the circuit.', 'meter']], ['hammer', 'glue', 'saw'])] },
    proj: { n: 'Project Making', ic: '📋', L: [
        Lv('Read the Plan', 'door', 'The door code is hidden in a project plan.', [['Which document shows sizes and parts?', 'plan'], ['Measure to check it.', 'tape']], ['saw', 'glue']),
        Lv('Build a Toolbox', 'toolbox', 'Build a toolbox for your gear.', [['Read the plan.', 'plan'], ['Measure the boards.', 'tape'], ['Mark the cuts.', 'pencil'], ['Cut the boards.', 'saw'], ['Nail them together.', 'hammer'], ['Sand the edges.', 'sand']], ['welder', 'meter']),
        Lv('Build a Birdhouse', 'bird', 'Build and paint a birdhouse.', [['Read the plan.', 'plan'], ['Measure the pieces.', 'tape'], ['Cut the pieces.', 'saw'], ['Drill the entry hole.', 'drill'], ['Screw it together.', 'driver'], ['Paint it.', 'paint']], ['grinder', 'etape']),
        Lv('Build a Bookshelf', 'shelf', 'Build a straight bookshelf.', [['Read the plan.', 'plan'], ['Measure the shelves.', 'tape'], ['Cut the boards.', 'saw'], ['Check the corners.', 'square'], ['Screw it together.', 'driver'], ['Check it is level.', 'level']], ['helmet', 'hammer']),
        Lv('Metal and Wood Gate', 'gate', 'Fabricate a gate that combines metal and wood.', [['Read the plan.', 'plan'], ['Measure everything.', 'tape'], ['Cut the wood slats.', 'saw'], ['Protect your eyes.', 'helmet'], ['Weld the frame.', 'welder'], ['Paint the gate.', 'paint']], ['meter', 'glue', 'ext']),
        Lv('Full Project: Workbench', 'table', 'Plan and build a complete workbench.', [['Read the plan.', 'plan'], ['Cut the lumber.', 'saw'], ['Check the corners.', 'square'], ['Drill pilot holes.', 'drill'], ['Drive the screws.', 'driver'], ['Check it is level.', 'level'], ['Sand it smooth.', 'sand']], ['hammer', 'tape', 'clamp'])] }
};
ORDER.forEach((id, ci) => C[id].L.forEach((l, i) => l.t = (ci + 1) + '.' + (i + 1) + ' ' + l.t));

/* ---------- Furniture: [width, height, colour, name] ---------- */
const F = { cabinet: [64, 90, '#7a4a24', 'cabinet'], crate: [64, 56, '#a8783a', 'crate'], shelf: [96, 56, '#5b3a1e', 'shelf'], barrel: [50, 60, '#6b4a2a', 'barrel'], toolbox: [62, 42, '#b02a22', 'toolbox'],
    locker: [56, 92, '#5f6b78', 'locker'], desk: [100, 60, '#8a5a2b', 'desk'], chest: [74, 50, '#6a3b1a', 'chest'], plant: [40, 56, '#2f7d55', 'plant'], bench: [100, 40, '#6a4a2a', 'bench'] };
const JUNK = ['old rags', 'sawdust', 'loose washers', 'a dusty manual', 'empty cans', 'a cobweb'];
const DOORS = ORDER.map((id, i) => ({ id, x: 90 + i * 270 }));
const COACH = [
    "Welcome to V.O.L.T.S.! I'm Coach Volt. Let me show you around.",
    'Walk with W A S D or the Arrow keys. Stand at a door and press E to enter a competency.',
    'Start with Woodworking. Finish all 6 levels to unlock Welding, Electrical Installations and Project Making.',
    'Each level is a mission: escape, or build a ladder, a chair, a table and more. The tools are hidden inside furniture.',
    'Stand next to a cabinet, crate or locker and press E to search it. Some are empty!',
    'Take your tools to the workbench or exit and use them in the right order. Press B for bag details. Good luck!'
];

/* ---------- Save data ---------- */
let V = { prog: { wood: 0, weld: 0, elec: 0, proj: 0 }, xp: 0, sfx: .6, mus: .35, on: true, met: false };
try { Object.assign(V, JSON.parse(localStorage.getItem('volts2') || '{}')); } catch (err) { }
const save = () => { try { localStorage.setItem('volts2', JSON.stringify(V)); } catch (err) { } };
const unlocked = id => id === 'wood' || V.prog.wood >= 6;
const total = () => ORDER.reduce((s, id) => s + Math.min(6, V.prog[id]), 0);
const ACH = [
    ['First Escape', 'Complete any level', () => total() >= 1],
    ['Woodworker', 'Finish all Woodworking levels', () => V.prog.wood >= 6],
    ['Safe Welder', 'Finish all Welding levels', () => V.prog.weld >= 6],
    ['Spark Safe', 'Finish all Electrical levels', () => V.prog.elec >= 6],
    ['Project Maker', 'Finish all Project Making levels', () => V.prog.proj >= 6],
    ['Master Learner', 'Complete all 24 levels', () => total() >= 24]
];
const earned = () => ACH.filter(a => a[2]()).map(a => a[0]);

/* ---------- Audio (synthesised, starts after a click) ---------- */
let AC, MG, SG, MU, noteI = 0;

function ac() {
    if (!AC) {
        AC = new (window.AudioContext || window.webkitAudioContext)();
        MG = AC.createGain();
        MG.connect(AC.destination);
        SG = AC.createGain();
        MU = AC.createGain();
        SG.connect(MG);
        MU.connect(MG);
        applyVol();
    }
    if (AC.state === 'suspended')
        AC.resume();
}

function applyVol() { if (SG) {
    SG.gain.value = V.sfx;
    MU.gain.value = V.on ? V.mus * 2 : 0;
} }

function tone(f, d, type = 'sine', v = .1, bus) {
    if (!AC)
        return;
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g);
    g.connect(bus || SG);
    o.start(t);
    o.stop(t + d);
}
const SFX = {
    pick: () => { tone(660, .1, 'square', .05); setTimeout(() => tone(990, .12, 'square', .05), 80); },
    good: () => { tone(523, .12, 'triangle', .1); setTimeout(() => tone(784, .2, 'triangle', .1), 100); },
    bad: () => tone(160, .25, 'sawtooth', .06),
    rustle: () => tone(120 + rnd() * 60, .08, 'sawtooth', .03),
    win: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, .3, 'triangle', .1), i * 120))
};
const SCALE = [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3];
const MEL = [0, 2, 4, 2, 5, 4, 2, 1, 0, 2, 4, 5, 7, 5, 4, 2], BASS = [131, 98, 110, 87];

/* Calm but upbeat loop. Only plays inside escape rooms. */

function music() {
    if (musicOn)
        return;
    musicOn = true;
    setInterval(() => {
        if (!world || world.k !== 'room' || S === 'menu' || S === 'paused')
            return;
        const i = noteI++ % 16;
        tone(SCALE[MEL[i]], .4, 'triangle', .07, MU);
        if (i % 4 === 0)
            tone(BASS[i / 4], 1, 'sine', .08, MU);
        if (i % 2 === 0)
            tone(SCALE[MEL[i]] / 2, .2, 'sine', .03, MU);
    }, 270);
}

/* ---------- Screens ---------- */
const OVER_GAME = ['game', 'talk', 'tool', 'ask', 'comp', 'result', 'pause'];

function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => {
        if (s.id !== 'exit-screen')
            s.classList.toggle('active', s.id === name + '-screen');
    });
    $('game-screen').classList.toggle('hidden', !OVER_GAME.includes(name));
    if (name === 'menu')
        $('menu-stats').textContent = 'LEVELS ' + total() + ' / 24  |  ' + V.xp + ' XP';
    if (name === 'progress')
        renderProgress();
    if (name === 'how')
        snapPics();
}
const openUI = name => { S = 'ui'; showScreen(name); };
const closeUI = () => { S = 'play'; showScreen('game'); };
let talkL = [], talkI = 0, talkDone = null;

function talk(lines, who, face, done) {
    talkL = lines;
    talkI = 0;
    talkDone = done;
    $('talk-who').textContent = who;
    $('talk-face').textContent = face;
    renderTalk();
    openUI('talk');
}

function renderTalk() {
    $('talk-text').textContent = talkL[talkI];
    $('talk-prev').classList.toggle('hidden', talkI === 0);
    $('talk-next').textContent = talkI < talkL.length - 1 ? 'NEXT' : 'GOT IT!';
}

function toast(msg) { $('toast').textContent = msg; toastT = 2; }

/* ---------- Worlds ---------- */

/* Pre-renders the floor, walls, windows and rug once so the game stays smooth. */

function bake(hub, w, h) {
    const c = document.createElement('canvas'), g = c.getContext('2d');
    c.width = w;
    c.height = h;
    if (hub) {
        for (let y = 0; y < h; y += 70)
            for (let x = 0; x < w; x += 70) {
                g.fillStyle = (x + y) / 70 % 2 ? '#17384f' : '#1b4260';
                g.fillRect(x, y, 70, 70);
            }
        g.fillStyle = '#0b2030';
        g.fillRect(0, 0, w, 100);
        g.fillStyle = 'rgba(226,75,22,.35)';
        g.fillRect(w / 2 - 70, 100, 140, h);
        g.fillStyle = '#F9B642';
        g.fillRect(0, 96, w, 4);
    }
    else {
        for (let y = 90, r = 0; y < h; y += 36, r++) {
            g.fillStyle = r % 2 ? '#4b3322' : '#47301f';
            g.fillRect(0, y, w, 36);
            g.fillStyle = 'rgba(0,0,0,.28)';
            g.fillRect(0, y, w, 2);
            for (let x = (r * 173) % 260; x < w; x += 260 + (r * 37) % 90)
                g.fillRect(x, y, 2, 36);
        }
        g.fillStyle = '#2e1d17';
        g.fillRect(0, 0, w, 90);
        g.fillStyle = '#3a2419';
        g.fillRect(0, 50, w, 40);
        g.fillStyle = '#1a0d09';
        g.fillRect(0, 86, w, 6);
        [200, 620, 1040].forEach(x => {
            g.fillStyle = '#0e3550';
            g.fillRect(x, 12, 120, 52);
            g.fillStyle = '#5a3a22';
            g.fillRect(x + 58, 12, 4, 52);
            g.strokeStyle = '#5a3a22';
            g.lineWidth = 4;
            g.strokeRect(x, 12, 120, 52);
            g.fillStyle = 'rgba(249,182,66,.07)';
            g.beginPath();
            g.moveTo(x, 64);
            g.lineTo(x + 120, 64);
            g.lineTo(x + 260, 420);
            g.lineTo(x + 60, 420);
            g.fill();
        });
        g.fillStyle = '#5a1a22';
        g.fillRect(w / 2 - 260, h / 2 - 130, 520, 290);
        g.strokeStyle = '#F9B642';
        g.lineWidth = 4;
        g.strokeRect(w / 2 - 245, h / 2 - 115, 490, 260);
    }
    return c;
}

function rect(k, x, y) { const f = F[k]; return { k, x, y, w: f[0], h: f[1], done: false, tool: null }; }

function enterHub() {
    const solid = [rect('plant', 40, 140), rect('plant', HW - 80, 140), rect('bench', 300, 330), rect('bench', 800, 330), rect('plant', 60, HH - 100), rect('plant', HW - 100, HH - 100), rect('bench', 480, 600)];
    world = { k: 'hub', w: HW, h: HH, p: { x: 600, y: 520, vx: 0, vy: 0, face: 1, wt: 0 }, npc: { x: 950, y: 500 }, solid, floor: bake(true, HW, HH) };
    bag = [];
    bagSel = 0;
    snapCam();
    closeUI();
}

function buildRoom(id, n) {
    const L = C[id].L[n], G0 = G[L.g], door = L.g === 'door', ids = [...new Set([...L.st.map(s => s[1]), ...L.x])];
    const st = door ? { x: RW - 50, y: 360, w: 50, h: 130 } : { x: RW - 280, y: 380, w: 150, h: 80 };
    const solid = [], types = Object.keys(F).filter(k => k !== 'plant' && k !== 'bench');
    if (!door)
        solid.push({ ...st, bench: true });
    const free = (x, y, w, h) => !solid.some(r => x < r.x + r.w + 30 && x + w > r.x - 30 && y < r.y + r.h + 30 && y + h > r.y - 30) && Math.hypot(x + w / 2 - 110, y + h / 2 - 430) > 150;
    for (let i = 0; i < ids.length + 4; i++) {
        for (let tries = 0; tries < 80; tries++) {
            const f = rect(types[rnd() * types.length | 0], 90 + rnd() * (RW - 520), 130 + rnd() * (RH - 280));
            if (free(f.x, f.y, f.w, f.h)) {
                f.tool = ids[i] || null;
                solid.push(f);
                break;
            }
        }
    }
    const missing = ids.filter(t => !solid.some(f => f.tool === t));
    missing.forEach(t => { const f = solid.find(f => !f.tool && !f.bench); if (f) f.tool = t; });
    return { k: 'room', w: RW, h: RH, id, n, step: 0, finished: false, p: { x: 110, y: 430, vx: 0, vy: 0, face: 1, wt: 0 }, st, solid, floor: bake(false, RW, RH) };
}

function enterRoom(id, n) {
    world = buildRoom(id, n);
    bag = [];
    bagSel = 0;
    snapCam();
    ac();
    const L = C[id].L[n];
    talk(['LEVEL ' + L.t, L.s, 'Mission: ' + G[L.g][1] + '.', 'Search the furniture (E) to find the tools, then use them in the right order at the ' + (L.g === 'door' ? 'blocked exit' : 'workbench') + '.'], 'MISSION BRIEFING', C[id].ic, closeUI);
}

/* ---------- Movement, interaction ---------- */
const viewW = () => W / Z, viewH = () => H / Z;

function snapCam() {
    cam.x = world.p.x - viewW() / 2;
    cam.y = world.p.y - viewH() / 2;
    clampCam();
}

function clampCam() {
    const vw = viewW(), vh = viewH();
    cam.x = vw >= world.w ? (world.w - vw) / 2 : Math.min(world.w - vw, Math.max(0, cam.x));
    cam.y = vh >= world.h ? (world.h - vh) / 2 : Math.min(world.h - vh, Math.max(0, cam.y));
}

function hit(x, y) { return world.solid.some(r => x + 11 > r.x && x - 11 < r.x + r.w && y > r.y + r.h * .35 && y - 10 < r.y + r.h); }
function gap(r, x, y) { return Math.hypot(Math.max(r.x - x, 0, x - r.x - r.w), Math.max(r.y - y, 0, y - r.y - r.h)); }

/* The closest thing the player can interact with right now. */

function target() {
    const w = world, p = w.p;
    if (w.k === 'hub') {
        if (Math.hypot(p.x - w.npc.x, p.y - w.npc.y) < 90)
            return { k: 'npc' };
        const d = DOORS.find(d => p.y < 170 && Math.abs(p.x - (d.x + 75)) < 90);
        return d ? { k: 'door', d } : null;
    }
    let best = null, bd = 56;
    w.solid.forEach(f => {
        const d = gap(f, p.x, p.y);
        if (d < bd && (f.tool !== undefined) && !f.bench) {
            bd = d;
            best = { k: 'f', f };
        }
    });
    if (!best && gap(w.st, p.x, p.y) < 70)
        best = { k: 'st' };
    return best;
}

function act() {
    if (S !== 'play' || world.srch)
        return;
    const t = target();
    if (!t)
        return;
    if (t.k === 'npc')
        talk(COACH, 'COACH VOLT', '🧑‍🏫', closeUI);
    else if (t.k === 'door')
        chooseComp(t.d.id);
    else if (t.k === 'st')
        ask();
    else if (t.f.done)
        toast('You already searched this ' + F[t.f.k][3] + '.');
    else
        world.srch = { f: t.f, t: 0 };
}

function finishSearch() {
    const f = world.srch.f;
    world.srch = null;
    f.done = true;
    if (f.tool) {
        bag.push(f.tool);
        bagSel = bag.length - 1;
        const it = T[f.tool];
        $('tool-icon').textContent = it[0];
        $('tool-name').textContent = it[1];
        $('tool-desc').textContent = it[2];
        $('tool-use').textContent = it[3];
        SFX.pick();
        openUI('tool');
    }
    else
        toast('Nothing useful here, just ' + JUNK[rnd() * JUNK.length | 0] + '.');
}

function chooseComp(id) {
    const c = C[id];
    $('comp-title').textContent = c.ic + ' ' + c.n.toUpperCase();
    if (!unlocked(id)) {
        $('comp-sub').textContent = 'LOCKED';
        $('comp-msg').textContent = 'Complete all 6 Woodworking levels to unlock this competency.';
        $('comp-levels').innerHTML = '';
    }
    else {
        $('comp-sub').textContent = 'CHOOSE A LEVEL';
        $('comp-msg').textContent = 'Levels go from basic to advanced and unlock one after another.';
        $('comp-levels').innerHTML = c.L.map((l, i) => '<button data-id="' + id + '" data-l="' + i + '"' + (i > V.prog[id] ? ' disabled' : '') + '><span>' +
            (i < V.prog[id] ? '✅' : i > V.prog[id] ? '🔒' : G[l.g][0] === 'table' ? '▶️' : G[l.g][0]) + '</span>' + l.t + '</button>').join('');
    }
    openUI('comp');
}

/* Knowledge challenge: choose the right tool for each step, in order. */

function ask() {
    const L = C[world.id].L[world.n], s = L.st[world.step], mine = [...new Set(bag)];
    $('ask-step').textContent = 'STEP ' + (world.step + 1) + ' OF ' + L.st.length + '  |  ' + G[L.g][1].toUpperCase();
    $('ask-q').textContent = s[0];
    $('ask-fb').className = 'feedback';
    $('ask-fb').textContent = mine.length ? 'Choose a tool from your bag.' : 'Your bag is empty. Search the furniture first!';
    $('ask-opts').innerHTML = mine.map(id => '<button data-t="' + id + '"><span>' + T[id][0] + '</span>' + T[id][1] + '</button>').join('');
    openUI('ask');
}

function answer(id) {
    const L = C[world.id].L[world.n], s = L.st[world.step];
    if (id !== s[1]) {
        $('ask-fb').className = 'feedback bad';
        $('ask-fb').textContent = 'Not this step. The ' + T[id][1] + ' is used for: ' + T[id][3];
        SFX.bad();
        return;
    }
    SFX.good();
    V.xp += 10;
    world.step++;
    if (world.step >= L.st.length)
        win();
    else
        ask();
}

function win() {
    const id = world.id, n = world.n, L = C[id].L[n], first = V.prog[id] <= n, before = earned();
    world.finished = true;
    if (first)
        V.prog[id] = n + 1;
    V.xp += 30;
    save();
    const fresh = earned().filter(a => !before.includes(a));
    let html = '<p>+' + (L.st.length * 10 + 30) + ' XP  |  Total ' + V.xp + ' XP</p><p>' + C[id].n + ': ' + Math.min(6, V.prog[id]) + ' / 6 levels complete</p>';
    if (id === 'wood' && V.prog.wood >= 6 && first)
        html += '<p class="subtitle">UNLOCKED: WELDING, ELECTRICAL INSTALLATIONS AND PROJECT MAKING!</p>';
    fresh.forEach(a => html += '<p class="subtitle">ACHIEVEMENT: ' + a.toUpperCase() + '</p>');
    $('res-title').textContent = L.t + ' - ' + G[L.g][1] + ' complete';
    $('res-text').innerHTML = html;
    $('res-next').classList.toggle('hidden', n >= 5);
    $('res-next').onclick = () => enterRoom(id, n + 1);
    SFX.win();
    openUI('result');
}

function toMenu() {
    save();
    S = 'menu';
    world = null;
    showScreen('menu');
}

function togglePause() {
    if (S === 'play') {
        S = 'paused';
        showScreen('pause');
    }
    else if (S === 'paused') {
        S = 'play';
        showScreen('game');
    }
}

/* ---------- Drawing ---------- */

function furn(g, f, hl) {
    const { x, y, w, h, k } = f, r = (a, b, c, d, col) => { g.fillStyle = col; g.fillRect(x + a, y + b, c, d); };
    g.fillStyle = 'rgba(0,0,0,.35)';
    g.fillRect(x + 5, y + h - 6, w, 12);
    const col = F[k][2];
    if (k === 'barrel') {
        g.fillStyle = col;
        g.fillRect(x, y + 6, w, h - 6);
        g.beginPath();
        g.ellipse(x + w / 2, y + 7, w / 2, 8, 0, 0, 7);
        g.fill();
        r(0, 18, w, 4, '#2a1a0c');
        r(0, h - 18, w, 4, '#2a1a0c');
        g.fillStyle = '#3b2610';
        g.beginPath();
        g.ellipse(x + w / 2, y + 7, w / 2 - 5, 5, 0, 0, 7);
        g.fill();
    }
    else if (k === 'plant') {
        r(8, h - 22, 24, 22, '#8a4a2a');
        g.fillStyle = col;
        g.beginPath();
        g.arc(x + 20, y + 22, 20, 0, 7);
        g.fill();
        g.fillStyle = '#3d9b6c';
        g.beginPath();
        g.arc(x + 14, y + 16, 10, 0, 7);
        g.fill();
    }
    else {
        r(0, 0, w, h, col);
        r(0, 0, w, 7, 'rgba(255,255,255,.18)');
        r(0, h - 8, w, 8, 'rgba(0,0,0,.3)');
        if (k === 'cabinet' || k === 'locker') {
            r(w / 2 - 1, 8, 2, h - 16, 'rgba(0,0,0,.4)');
            r(w / 2 - 9, h / 2, 5, 12, '#F9B642');
            r(w / 2 + 4, h / 2, 5, 12, '#F9B642');
            if (k === 'locker')
                for (let i = 0; i < 4; i++)
                    r(8, 12 + i * 5, w - 16, 2, 'rgba(0,0,0,.45)');
        }
        else if (k === 'crate') {
            r(0, 0, 6, h, 'rgba(0,0,0,.35)');
            r(w - 6, 0, 6, h, 'rgba(0,0,0,.35)');
            r(0, h / 2 - 3, w, 6, 'rgba(0,0,0,.3)');
        }
        else if (k === 'shelf')
            for (let i = 1; i < 3; i++) {
                r(4, i * h / 3, w - 8, 4, 'rgba(0,0,0,.45)');
                r(10 + i * 8, i * h / 3 - 14, 14, 14, '#b4863c');
                r(50 + i * 8, i * h / 3 - 10, 10, 10, '#4a6a8a');
            }
        else if (k === 'toolbox') {
            r(w / 2 - 14, -8, 28, 8, '#222');
            r(w / 2 - 5, 12, 10, 8, '#F9B642');
            r(0, h / 2, w, 3, 'rgba(0,0,0,.4)');
        }
        else if (k === 'desk') {
            r(6, 14, 34, 30, 'rgba(0,0,0,.28)');
            r(w - 40, 14, 34, 30, 'rgba(0,0,0,.28)');
            r(20, 26, 6, 5, '#F9B642');
            r(w - 26, 26, 6, 5, '#F9B642');
        }
        else if (k === 'chest') {
            r(0, 14, w, 3, 'rgba(0,0,0,.5)');
            r(w / 2 - 6, 12, 12, 12, '#F9B642');
        }
        else if (k === 'bench')
            r(6, h - 14, 8, 14, 'rgba(0,0,0,.4)');
    }
    if (f.done) {
        g.fillStyle = 'rgba(0,0,0,.35)';
        g.fillRect(x, y, w, h);
        g.fillStyle = '#4cd08a';
        g.font = 'bold 18px Arial';
        g.textAlign = 'center';
        g.fillText('✔', x + w / 2, y + h / 2 + 6);
    }
    if (hl) {
        g.strokeStyle = '#F9B642';
        g.lineWidth = 3;
        g.strokeRect(x - 3, y - 3, w + 6, h + 6);
    }
}

function drawTable(g, x, y, s) {
    g.fillStyle = '#8a5a2b';
    g.fillRect(x - 34 * s, y - 14 * s, 68 * s, 12 * s);
    g.fillStyle = '#5b3a1e';
    g.fillRect(x - 30 * s, y - 2 * s, 8 * s, 26 * s);
    g.fillRect(x + 22 * s, y - 2 * s, 8 * s, 26 * s);
}

function station(g, w, now) {
    const L = C[w.id].L[w.n], ic = G[L.g], s = w.st;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    if (L.g === 'door') {
        g.fillStyle = '#1a0d09';
        g.fillRect(s.x, s.y, s.w, s.h);
        g.fillStyle = w.finished ? '#000' : '#6a3a1a';
        g.fillRect(s.x + 6, s.y + 6, s.w - 6, s.h - 12);
        g.font = '40px serif';
        g.fillText(w.finished ? '✅' : ic[2], s.x + 26, s.y + s.h / 2);
    }
    else {
        g.fillStyle = 'rgba(0,0,0,.35)';
        g.fillRect(s.x + 6, s.y + s.h - 6, s.w, 12);
        g.fillStyle = '#7a4a24';
        g.fillRect(s.x, s.y + 20, s.w, s.h - 20);
        g.fillStyle = '#9a6a3a';
        g.fillRect(s.x - 4, s.y + 12, s.w + 8, 14);
        g.fillStyle = '#3b2610';
        g.fillRect(s.x + 8, s.y + 40, s.w - 16, 4);
        if (w.finished) {
            g.fillStyle = 'rgba(76,208,138,.25)';
            g.beginPath();
            g.arc(s.x + s.w / 2, s.y - 10, 50, 0, 7);
            g.fill();
            if (ic[0] === 'table')
                drawTable(g, s.x + s.w / 2, s.y - 22, 1.2);
            else {
                g.font = '56px serif';
                g.fillText(ic[0], s.x + s.w / 2, s.y - 14);
            }
        }
        else {
            g.font = '36px serif';
            g.fillText(ic[2], s.x + s.w / 2, s.y - 4 + Math.sin(now / 350) * 3);
        }
    }
}

function person(g, p) {
    const sw = Math.sin(p.wt) * 5, r = (a, b, c, d, col) => { g.fillStyle = col; g.fillRect(Math.round(p.x + a), Math.round(p.y + b), c, d); };
    g.fillStyle = 'rgba(0,0,0,.4)';
    g.beginPath();
    g.ellipse(p.x, p.y + 1, 14, 5, 0, 0, 7);
    g.fill();
    r(-7, -10, 5, 10 + sw, '#222');
    r(2, -10, 5, 10 - sw, '#222');
    r(-8, -28 + Math.abs(sw) * .3, 16, 20, '#E24B16');
    r(-11, -26, 4, 12 + sw, '#c43d10');
    r(7, -26, 4, 12 - sw, '#c43d10');
    r(-7, -42, 14, 14, '#e0b08a');
    r(-7, -43, 14, 5, '#100406');
    r(p.face > 0 ? 2 : -5, -36, 3, 3, '#100406');
}

function scene(g, z, w, cx0, cy0, vw, vh, now) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#100406';
    g.fillRect(0, 0, g.canvas.width, g.canvas.height);
    g.setTransform(z, 0, 0, z, -cx0 * z, -cy0 * z);
    g.drawImage(w.floor, 0, 0);
    const hub = w.k === 'hub', tg = w === world && S === 'play' ? target() : null, L = [];
    if (hub) {
        DOORS.forEach(d => {
            const c = C[d.id], u = unlocked(d.id);
            g.fillStyle = u ? '#5a1a22' : '#333';
            g.fillRect(d.x, 10, 150, 90);
            g.fillStyle = '#F9B642';
            g.fillRect(d.x, 10, 150, 4);
            g.font = '34px serif';
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillText(u ? c.ic : '🔒', d.x + 75, 42);
            g.font = 'bold 12px Arial';
            g.fillStyle = '#fff';
            g.fillText(c.n.toUpperCase(), d.x + 75, 82);
            if (tg && tg.d === d) {
                g.strokeStyle = '#F9B642';
                g.lineWidth = 3;
                g.strokeRect(d.x - 3, 7, 156, 96);
            }
        });
        L.push([w.npc.y, () => { g.font = '46px serif'; g.textAlign = 'center'; g.fillText('🧑‍🏫', w.npc.x, w.npc.y); g.font = 'bold 13px Arial'; g.fillStyle = '#F9B642'; g.fillText('Coach Volt', w.npc.x, w.npc.y + 34); }]);
    }
    else
        L.push([w.st.y + w.st.h, () => station(g, w, now)]);
    w.solid.forEach(f => { if (!f.bench) L.push([f.y + f.h, () => furn(g, f, tg && tg.f === f)]); });
    L.push([w.p.y, () => person(g, w.p)]);
    L.sort((a, b) => a[0] - b[0]).forEach(o => o[1]());
    if (w.srch) {
        const f = w.srch.f;
        g.fillStyle = '#000';
        g.fillRect(f.x, f.y - 16, f.w, 8);
        g.fillStyle = '#F9B642';
        g.fillRect(f.x, f.y - 16, f.w * w.srch.t, 8);
    }
    if (tg && tg.k === 'st') {
        g.strokeStyle = '#F9B642';
        g.lineWidth = 3;
        g.strokeRect(w.st.x - 3, w.st.y - 3, w.st.w + 6, w.st.h + 6);
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    const vg = g.createRadialGradient(g.canvas.width / 2, g.canvas.height / 2, g.canvas.height * .3, g.canvas.width / 2, g.canvas.height / 2, g.canvas.width * .65);
    vg.addColorStop(0, 'rgba(8,39,57,0)');
    vg.addColorStop(1, 'rgba(16,4,6,.7)');
    g.fillStyle = vg;
    g.fillRect(0, 0, g.canvas.width, g.canvas.height);
}

function drawMini() {
    const w = world, kx = 160 / w.w, ky = 100 / w.h;
    mc.fillStyle = w.k === 'hub' ? '#17384f' : '#47301f';
    mc.fillRect(0, 0, 160, 100);
    w.solid.forEach(f => { if (!f.bench) { mc.fillStyle = f.done ? '#4cd08a' : '#c49a5a'; mc.fillRect(f.x * kx, f.y * ky, Math.max(3, f.w * kx), Math.max(3, f.h * ky)); } });
    if (w.k === 'room') { mc.fillStyle = '#F9B642'; mc.fillRect(w.st.x * kx, w.st.y * ky, Math.max(4, w.st.w * kx), Math.max(6, w.st.h * ky)); }
    else DOORS.forEach(d => { mc.fillStyle = unlocked(d.id) ? '#E24B16' : '#555'; mc.fillRect(d.x * kx, 0, 150 * kx, 8); });
    mc.strokeStyle = 'rgba(255,255,255,.6)';
    mc.strokeRect(cam.x * kx, cam.y * ky, viewW() * kx, viewH() * ky);
    mc.fillStyle = '#ff4d4d';
    mc.beginPath();
    mc.arc(w.p.x * kx, w.p.y * ky, 4, 0, 7);
    mc.fill();
}

/* The how-to pictures are real frames of the game. */

function snapPics() {
    const a = enterHubDummy(), b = buildRoom('wood', 2), c = buildRoom('wood', 2);
    b.p.x = 600; b.p.y = 450;
    c.p.x = RW - 340; c.p.y = 470;
    c.solid.forEach((f, i) => { f.done = i % 2 === 0 && !f.bench; });
    [a, b, c].forEach((w, i) => { const g = $('pic' + (i + 1)).getContext('2d'); scene(g, 320 / w.w, w, 0, 0, w.w, w.h, 0); });
}

function enterHubDummy() {
    return { k: 'hub', w: HW, h: HH, p: { x: 600, y: 420, wt: 0, face: 1 }, npc: { x: 950, y: 500 }, solid: [rect('plant', 40, 140), rect('plant', HW - 80, 140), rect('bench', 300, 330), rect('bench', 800, 330)], floor: bake(true, HW, HH) };
}

/* ---------- HUD ---------- */

function updateHud() {
    $('hud-xp').textContent = V.xp;
    $('bag-slots').innerHTML = bag.map((id, i) => '<div class="slot' + (i === bagSel ? ' selected' : '') + '" data-i="' + i + '"><i>' + (i + 1) + '</i>' + T[id][0] + '</div>').join('');
    $('bag-details').classList.toggle('open', bagOpen);
    const it = bag[bagSel] && T[bag[bagSel]];
    $('bag-desc').textContent = it ? it[1] + ': ' + it[2] + ' Used for: ' + it[3] : 'Your bag is empty. Search furniture to find tools.';
    const t = S === 'play' ? target() : null;
    let hint = '';
    if (world.k === 'hub') {
        $('hud-comp').textContent = 'HUB';
        $('hud-level').textContent = '-';
        $('hud-tools').textContent = '-';
        $('mission-goal').textContent = 'Pick a competency';
        $('mission-steps').textContent = 'Woodworking comes first.';
        hint = t ? (t.k === 'npc' ? 'Press E to talk to Coach Volt' : 'Press E: ' + C[t.d.id].n + (unlocked(t.d.id) ? '' : ' (locked)')) : '';
    }
    else {
        const L = C[world.id].L[world.n], found = world.solid.filter(f => f.done).length, n = world.solid.filter(f => !f.bench).length;
        $('hud-comp').textContent = C[world.id].n.toUpperCase();
        $('hud-level').textContent = L.t.slice(0, 3);
        $('hud-tools').textContent = bag.length;
        $('mission-goal').textContent = G[L.g][1];
        $('mission-steps').textContent = 'Steps done: ' + world.step + ' / ' + L.st.length + '  |  Searched: ' + found + ' / ' + n;
        hint = t ? (t.k === 'st' ? 'Press E to use the ' + (L.g === 'door' ? 'exit' : 'workbench') : t.f.done ? 'Already searched' : 'Press E to search the ' + F[t.f.k][3]) : 'Search the furniture for tools';
    }
    $('hint').textContent = hint;
}

function renderProgress() {
    $('prog-xp').textContent = 'Total XP: ' + V.xp + '  |  Levels complete: ' + total() + ' / 24';
    $('prog-list').innerHTML = ORDER.map(id => '<div class="row' + (unlocked(id) ? '' : ' off') + '"><span>' + C[id].ic + '</span><b>' + C[id].n + '</b><div class="bar"><div style="width:' +
        Math.min(6, V.prog[id]) / 6 * 100 + '%"></div></div><small>' + (unlocked(id) ? Math.min(6, V.prog[id]) + ' / 6' : 'LOCKED') + '</small></div>').join('');
    const got = earned();
    $('ach-list').innerHTML = ACH.map(a => '<div class="row' + (got.includes(a[0]) ? ' got' : ' off') + '"><span>' + (got.includes(a[0]) ? '🏅' : '🔒') + '</span><b>' + a[0] + '</b><small>' + a[1] + '</small></div>').join('');
}

/* ---------- Loop, input, setup ---------- */

function resize() {
    const d = devicePixelRatio || 1;
    W = cv.width = innerWidth * d;
    H = cv.height = innerHeight * d;
    Z = Math.min(W, H * 1.6) / 1000;
    if (world)
        clampCam();
}
let last = performance.now();

function update(dt) {
    const w = world, p = w.p, mx = (K.KeyD || K.ArrowRight ? 1 : 0) - (K.KeyA || K.ArrowLeft ? 1 : 0), my = (K.KeyS || K.ArrowDown ? 1 : 0) - (K.KeyW || K.ArrowUp ? 1 : 0), n = Math.hypot(mx, my) || 1;
    if (S === 'play') {
        const k = Math.min(1, dt * 12);
        p.vx += (mx / n * 210 - p.vx) * k;
        p.vy += (my / n * 210 - p.vy) * k;
        const nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
        if (!hit(nx, p.y))
            p.x = nx;
        else
            p.vx = 0;
        if (!hit(p.x, ny))
            p.y = ny;
        else
            p.vy = 0;
        p.x = Math.min(w.w - 30, Math.max(30, p.x));
        p.y = Math.min(w.h - 20, Math.max(w.k === 'hub' ? 120 : 110, p.y));
        if (Math.abs(p.vx) > 8)
            p.face = p.vx > 0 ? 1 : -1;
        const moving = Math.hypot(p.vx, p.vy) > 30;
        p.wt = moving ? p.wt + dt * 12 : 0;
        if (w.srch) {
            if (moving || gap(w.srch.f, p.x, p.y) > 64)
                w.srch = null;
            else {
                w.srch.t += dt / .8;
                if (Math.random() < dt * 14)
                    SFX.rustle();
                if (w.srch.t >= 1)
                    finishSearch();
            }
        }
    }
    cam.x += (p.x - viewW() / 2 - cam.x) * Math.min(1, dt * 6);
    cam.y += (p.y - viewH() / 2 - cam.y) * Math.min(1, dt * 6);
    clampCam();
    toastT -= dt;
    if (toastT <= 0)
        $('toast').textContent = '';
}

function loop(t) {
    const dt = Math.min(.05, (t - last) / 1000);
    last = t;
    if (S !== 'menu' && world) {
        update(dt);
        scene(cx, Z, world, cam.x, cam.y, viewW(), viewH(), t);
        drawMini();
        if ((hudT += dt) > .1) {
            hudT = 0;
            updateHud();
        }
    }
    requestAnimationFrame(loop);
}

addEventListener('keydown', e => {
    if (e.code.startsWith('Arrow') || e.code === 'Space')
        e.preventDefault();
    K[e.code] = true;
    if (e.repeat)
        return;
    if (e.code === 'Escape' || e.code === 'KeyP')
        return togglePause();
    if (S !== 'play')
        return;
    if (e.code === 'KeyE' || e.code === 'Space')
        act();
    if (e.code === 'KeyB')
        bagOpen = !bagOpen;
    const n = +e.code.replace('Digit', '');
    if (n >= 1 && n <= bag.length)
        bagSel = n - 1;
});
addEventListener('keyup', e => { K[e.code] = false; });
addEventListener('blur', () => { K = {}; if (S === 'play') togglePause(); });
addEventListener('resize', resize);

/* ---------- Buttons ---------- */
const click = (id, fn) => $(id).addEventListener('click', fn);
click('start-btn', () => {
    ac();
    music();
    enterHub();
    if (!V.met)
        talk(COACH, 'COACH VOLT', '🧑‍🏫', () => { V.met = true; save(); closeUI(); });
});
click('how-btn', () => showScreen('how'));
click('progress-btn', () => showScreen('progress'));
click('menu-btn', () => showScreen('settings'));
click('exit-btn', () => $('exit-screen').classList.add('active'));
click('exit-cancel-btn', () => $('exit-screen').classList.remove('active'));
click('exit-confirm-btn', () => {
    $('exit-screen').classList.remove('active');
    try {
        window.close();
    }
    catch (err) { /* browsers may refuse */ }
    showScreen('goodbye');
});
document.querySelectorAll('.back-menu').forEach(b => b.addEventListener('click', () => showScreen('menu')));
click('pause-btn', togglePause);
click('resume-btn', togglePause);
click('pause-menu-btn', toMenu);
click('talk-prev', () => { talkI--; renderTalk(); });
click('talk-next', () => {
    if (talkI < talkL.length - 1) {
        talkI++;
        renderTalk();
    }
    else if (talkDone)
        talkDone();
});
click('tool-ok', closeUI);
click('ask-back', closeUI);
click('comp-back', closeUI);
click('res-hub', enterHub);
click('reset-btn', () => {
    if (confirm('Erase all progress?')) {
        V.prog = { wood: 0, weld: 0, elec: 0, proj: 0 };
        V.xp = 0;
        V.met = false;
        save();
    }
});
$('ask-opts').addEventListener('click', e => { const b = e.target.closest('button'); if (b) answer(b.dataset.t); });
$('comp-levels').addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.disabled) enterRoom(b.dataset.id, +b.dataset.l); });
$('bag-slots').addEventListener('click', e => { const s = e.target.closest('.slot'); if (s) { bagSel = +s.dataset.i; bagOpen = true; } });

/* ---------- Audio settings ---------- */
$('sfx-volume').value = V.sfx * 100;
$('music-volume').value = V.mus * 100;
$('music-on').checked = V.on;
$('sfx-volume').addEventListener('input', e => { ac(); V.sfx = e.target.value / 100; applyVol(); SFX.pick(); save(); });
$('music-volume').addEventListener('input', e => { ac(); V.mus = e.target.value / 100; applyVol(); tone(330, .4, 'triangle', .1, MU); save(); });
$('music-on').addEventListener('change', e => { V.on = e.target.checked; applyVol(); save(); });

/* ---------- Start ---------- */
showScreen('menu');
resize();
requestAnimationFrame(loop);