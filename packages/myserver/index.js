// =======================
//  LOKASI PENTING
// =======================
const bandara = new mp.Vector3(-1037.77, -2737.81, 20.17);
const kantorGalileo = new mp.Vector3(-428.5, 1198.5, 326.7);

// =======================
//  EVENT HANDLERS
// =======================

// Player join
function handlePlayerJoin(player) {
    player.outputChatBox('Welcome to the server!');
    player.spawn(bandara);
    player.heading = 330;

    player.lastCheckpoint = bandara;
    player.inventory = [];
}
mp.events.add("playerJoin", handlePlayerJoin);

// Player respawn
function handlePlayerRespawn(player) {
    if (player.lastCheckpoint) {
        player.spawn(player.lastCheckpoint);
        player.outputChatBox("Respawn di checkpoint terakhir!");
    } else {
        player.spawn(bandara);
        player.outputChatBox("Tidak ada checkpoint tersimpan. Respawn di bandara.");
    }
}
mp.events.add("playerRespawn", handlePlayerRespawn);

// Player death
function handlePlayerDeath(player) {
    player.outputChatBox("Kamu mati! Respawn sebentar lagi...");

    setTimeout(() => {
        if (player.lastCheckpoint) {
            player.spawn(player.lastCheckpoint);
            player.outputChatBox("Respawn di checkpoint terakhir!");
        } else {
            player.spawn(bandara);
            player.outputChatBox("Tidak ada checkpoint tersimpan. Respawn di bandara.");
        }
    }, 3000);
}
mp.events.add("playerDeath", handlePlayerDeath);

// Save checkpoint
function setCheckpoint(player, x, y, z) {
    player.lastCheckpoint = new mp.Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
    player.outputChatBox(`Checkpoint berhasil disimpan di lokasi: ${x}, ${y}, ${z}`);
}
mp.events.add("setCheckpoint", setCheckpoint);

// Request inventory (untuk TAB UI)
function requestInventory(player) {
    player.call("showInventory", [JSON.stringify(player.inventory)]);
}
mp.events.add("requestInventory", requestInventory);

// =======================
//  COMMAND HANDLERS
// =======================

// /kantor
function cmdKantor(player) {
    player.outputChatBox("Menunggu taksi...");
    player.call("startTaxiTransition");
    setTimeout(() => {
        player.position = kantorGalileo;
        player.outputChatBox("Kamu sudah sampai di Kantor Galileo!");
        player.call("endTaxiTransition");
        player.call("showCheckpoint");
    }, 5000);
}
mp.events.addCommand("kantor", cmdKantor);

// /car
function cmdCar(player) {
    let heading = player.heading * Math.PI / 180;
    let forwardX = Math.sin(heading);
    let forwardY = Math.cos(heading);

    let spawnPos = new mp.Vector3(
        player.position.x + forwardX * 4,
        player.position.y + forwardY * 4,
        player.position.z
    );

    const vehicle = mp.vehicles.new(mp.joaat("adder"), spawnPos, {
        numberPlate: "MYCAR",
        color: [[255, 255, 0], [255, 255, 0]]
    });

    vehicle.rotation = new mp.Vector3(0, 0, player.heading);
    player.outputChatBox("Mobil dipanggil, ada di depanmu!");
}
mp.events.addCommand("car", cmdCar);

// /dead
function cmdDead(player) {
    player.health = 0;
}
mp.events.addCommand("dead", cmdDead);

// /tp x y z
function cmdTp(player, fullText, x, y, z) {
    if (!x || !y || !z) {
        player.outputChatBox("Usage: /tp x y z");
        return;
    }
    player.position = new mp.Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
    player.outputChatBox(`Teleported ke ${x}, ${y}, ${z}`);
}
mp.events.addCommand("tp", cmdTp);

// /pickup itemName
function cmdPickup(player, fullText, itemName) {
    if (!itemName) {
        player.outputChatBox("Usage: /pickup [itemName]");
        return;
    }
    player.inventory.push(itemName);
    player.outputChatBox(`Kamu mengambil ${itemName}`);
}
mp.events.addCommand("pickup", cmdPickup);

// /drop itemName
function cmdDrop(player, fullText, itemName) {
    if (!itemName) {
        player.outputChatBox("Usage: /drop [itemName]");
        return;
    }
    const idx = player.inventory.indexOf(itemName);
    if (idx === -1) {
        player.outputChatBox("Item tidak ada di inventory!");
        return;
    }

    player.inventory.splice(idx, 1);
    mp.objects.new(mp.joaat("prop_ld_health_pack"), player.position, { rotation: new mp.Vector3(0,0,0) });
    player.outputChatBox(`Kamu membuang ${itemName}`);
}
mp.events.addCommand("drop", cmdDrop);

// /inv
function cmdInv(player) {
    if (player.inventory.length === 0) {
        player.outputChatBox("Inventory kosong!");
    } else {
        player.outputChatBox("Inventory: " + player.inventory.join(", "));
    }
}
mp.events.addCommand("inv", cmdInv);
