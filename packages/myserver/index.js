const bandara = new mp.Vector3(-1037.77, -2737.81, 20.17);
const kantorGalileo = new mp.Vector3(-428.5, 1198.5, 326.7);

mp.events.add('playerJoin', (player) => {
    player.outputChatBox('Welcome to the server!');
    player.spawn(bandara);
    player.heading = 330;

    player.lastCheckpoint = bandara;
    player.inventory = [];
});

mp.events.addCommand("kantor", (player) => {
    player.outputChatBox("Menunggu taksi...");
    player.call("startTaxiTransition");
    setTimeout(() => {
        player.position = kantorGalileo;
        player.outputChatBox("Kamu sudah sampai di Kantor Galileo!");
        player.call("endTaxiTransition");
        player.call("showCheckpoint");
    }, 5000);
});

mp.events.addCommand("car", (player) => {
    let heading = player.heading * Math.PI / 180;
    let forwardX = Math.sin(heading);
    let forwardY = Math.cos(heading);

    let spawnPos = new mp.Vector3(
        player.position.x + forwardX * 4,
        player.position.y + forwardY * 4,
        player.position.z
    );

    const vehicle = mp.vehicles.new(
        mp.joaat("adder"),
        spawnPos,
        {
            numberPlate: "MYCAR",
            color: [[255, 255, 0], [255, 255, 0]]
        }
    );

    vehicle.rotation = new mp.Vector3(0, 0, player.heading);
    player.outputChatBox("Mobil dipanggil, ada di depanmu!");
});

mp.events.add("setCheckpoint", (player, x, y, z) => {
    player.lastCheckpoint = new mp.Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
    player.outputChatBox(`Checkpoint berhasil disimpan di lokasi: ${x}, ${y}, ${z}`);
});

mp.events.add("playerRespawn", (player) => {
    if (player.lastCheckpoint) {
        player.spawn(player.lastCheckpoint);
        player.outputChatBox("Respawn di checkpoint terakhir!");
    } else {
        player.spawn(bandara);
        player.outputChatBox("Tidak ada checkpoint tersimpan. Respawn di bandara.");
    }
});

mp.events.addCommand("dead", (player) => {
    player.health = 0;
});

mp.events.add("playerDeath", (player) => {
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
});


mp.events.addCommand("tp", (player, fullText, x, y, z) => {
    if (!x || !y || !z) {
        player.outputChatBox("Usage: /tp x y z");
        return;
    }
    player.position = new mp.Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
    player.outputChatBox(`Teleported ke ${x}, ${y}, ${z}`);
});

mp.events.addCommand("pickup", (player, fullText, itemName) => {
    if (!itemName) {
        player.outputChatBox("Usage: /pickup [itemName]");
        return;
    }
    player.inventory.push(itemName);
    player.outputChatBox(`Kamu mengambil ${itemName}`);
});

mp.events.addCommand("drop", (player, fullText, itemName) => {
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
});

// /inv -> list inventory
mp.events.addCommand("inv", (player) => {
    if (player.inventory.length === 0) {
        player.outputChatBox("Inventory kosong!");
    } else {
        player.outputChatBox("Inventory: " + player.inventory.join(", "));
    }
});

mp.events.add("requestInventory", (player) => {
    player.call("showInventory", [JSON.stringify(player.inventory)]);
});

