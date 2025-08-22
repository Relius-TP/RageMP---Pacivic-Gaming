let checkpoint = null;
let colshape = null;
let checkpointPos = null;
let invBrowser = null;
let inventoryOpen = false;

// =======================
//  TAXI TRANSITION
// =======================
function startTaxiTransition() {
    mp.game.cam.doScreenFadeOut(1000);
}
mp.events.add("startTaxiTransition", startTaxiTransition);

function endTaxiTransition() {
    mp.game.cam.doScreenFadeIn(1000);
}
mp.events.add("endTaxiTransition", endTaxiTransition);

// =======================
//  CHECKPOINT SYSTEM
// =======================
function showCheckpointHandler() {
    if (checkpoint) checkpoint.destroy();
    if (colshape) colshape.destroy();

    checkpointPos = new mp.Vector3(-415.1, 1162, 324.9);
    let markerPos = new mp.Vector3(checkpointPos.x, checkpointPos.y, checkpointPos.z - 1.0);

    checkpoint = mp.checkpoints.new(10, markerPos, 2.0, {
        color: [255, 0, 0, 200],
        visible: true,
        dimension: 0
    });

    colshape = mp.colshapes.newSphere(checkpointPos.x, checkpointPos.y, checkpointPos.z, 3);
    mp.gui.chat.push("Pergi ke checkpoint dan tekan E untuk menyimpannya!");
}
mp.events.add("showCheckpoint", showCheckpointHandler);

function playerEnterColshapeHandler(shape) {
    if (shape === colshape) {
        mp.gui.chat.push("Tekan [E] untuk menyimpan checkpoint!");
    }
}
mp.events.add("playerEnterColshape", playerEnterColshapeHandler);

function saveCheckpointHandler() {
    if (!checkpointPos) return;

    let playerPos = mp.players.local.position;
    let dist = mp.game.system.vdist(playerPos.x, playerPos.y, playerPos.z,
                                    checkpointPos.x, checkpointPos.y, checkpointPos.z);

    if (dist < 2.0) {
        mp.events.callRemote("setCheckpoint", checkpointPos.x, checkpointPos.y, checkpointPos.z);
        mp.gui.chat.push("Checkpoint berhasil disimpan!");
    }
}
mp.keys.bind(0x45, true, saveCheckpointHandler); // E

// =======================
//  RENDER 3D TEXT PROMPT
// =======================
function renderHandler() {
    if (!checkpointPos) return;

    const playerPos = mp.players.local.position;
    const dist = mp.game.system.vdist(playerPos.x, playerPos.y, playerPos.z,
                                      checkpointPos.x, checkpointPos.y, checkpointPos.z);

    if (dist < 5.0) {
        mp.game.graphics.drawText("Tekan E untuk Save Checkpoint",
            [checkpointPos.x, checkpointPos.y, checkpointPos.z + 1.0],
            {
                font: 4,
                color: [255, 255, 255, 200],
                scale: [0.35, 0.35],
                outline: true,
                centre: true
            });
    }
}
mp.events.add("render", renderHandler);

// =======================
//  INVENTORY SYSTEM (TAB)
// =======================
function toggleInventoryHandler() {
    if (!inventoryOpen) {
        mp.events.callRemote("requestInventory");
    } else {
        if (invBrowser) {
            invBrowser.destroy();
            invBrowser = null;
        }
        inventoryOpen = false;
        mp.gui.cursor.show(false, false);
    }
}
mp.keys.bind(0x09, true, toggleInventoryHandler); // TAB

function showInventoryHandler(invData) {
    let items = JSON.parse(invData);

    if (invBrowser) {
        invBrowser.destroy();
        invBrowser = null;
    }

    invBrowser = mp.browsers.new("package://resources/inventory/index.html");

    setTimeout(() => {
        invBrowser.execute(`loadInventory(${JSON.stringify(items)})`);
    }, 200);

    mp.gui.cursor.show(true, true);
    inventoryOpen = true;
}
mp.events.add("showInventory", showInventoryHandler);
