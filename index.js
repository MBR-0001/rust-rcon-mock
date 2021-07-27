"use strict";

const ws = require("ws");

const names = [
    "james", "john", "robert", "michael", "mary", "william", "david", "richard", "charles", "joseph", "thomas", "patricia",
    "christopher", "linda", "barbara", "daniel", "paul", "mark", "elizabeth", "donald", "jennifer", "george", "maria",
    "kenneth", "susan", "steven", "edward", "margaret", "brian", "ronald", "dorothy", "anthony", "lisa", "kevin", "nancy",
    "karen", "betty", "helen", "jason", "matthew", "gary", "timothy", "sandra", "jose", "larry", "jeffrey", "frank", "donna",
    "carol", "ruth", "scott", "eric", "stephen", "andrew", "sharon", "michelle", "laura", "sarah", "kimberly", "deborah",
    "jessica", "raymond", "shirley", "cynthia", "angela", "melissa", "brenda", "amy", "jerry", "gregory", "anna", "joshua",
    "virginia", "rebecca", "kathleen", "dennis", "pamela", "martha", "debra", "amanda", "walter", "stephanie", "willie",
    "patrick", "terry", "carolyn", "peter", "christine", "marie", "janet", "frances", "catherine", "harold", "henry",
    "douglas", "joyce", "ann", "diane", "alice"
];

/**
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
function generateRandom(min, max) {
    return min + Math.floor(Math.random() * (max - min));
}

/**
 * @param {Date} date 
 * @returns {string}
 */
function formatDate(date) {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

function random(...args) {
    return args[generateRandom(0, args.length - 1)];
}

class Server {
    constructor({playerCount = 15, server = undefined} = {}) {
        if (!playerCount || typeof playerCount != "number") playerCount = 15;

        let opts = {noServer: !server};
        if (server) opts.server = server;
        this.server = new ws.Server(opts);

        const start = new Date();
        const players = [];
        const perf = [];
        const plugins = [
            {
                name: "NoFriendlyFire",
                version: "1.0.0",
                filename: "NoFriendlyFire.cs",
                author: names[5]
            },
            {
                name: "Performance Booster",
                version: "2.0.0",
                filename: "PerformanceBooster.cs",
                author: names[25]
            },
            {
                name: "Bridge",
                version: "1.0.1",
                filename: "Bridge.cs",
                author: names[55]
            },
        ];
        let bans = "";
        for (let i = 0; i < 50; i++) {
            bans += `${i} ${"765611" + generateRandom(11111111111, 99999999999)} "${names[generateRandom(0, names.length - 1)]}" "Ban reason lol"\n`;
        }

        for (let i = 0; i < playerCount; i++) {
            players.push({
                SteamID: "765611" + generateRandom(11111111111, 99999999999),
                OwnerSteamID: generateRandom(0, 100) <= 5 ? "765611" + generateRandom(11111111111, 99999999999) : "0",
                DisplayName: names[generateRandom(0, names.length - 1)],
                //Ping: generateRandom(25, 170),
                Address: `${generateRandom(1, 255)}.${generateRandom(1, 255)}.${generateRandom(1, 255)}.${generateRandom(1, 255)}:${generateRandom(30000, 65535)}`,
                //ConnectedSeconds: Math.floor(process.uptime()),
                VoiationLevel: 0.0,
                CurrentLevel: 0.0,
                UnspentXp: 0.0,
                //Health: Math.random() * 100
            });
        }

        for (let i = 0; i < 120; i++) {
            perf.push({
                EntityCount: generateRandom(70000, 75000),
                Framerate: generateRandom(75, 125),
                Memory: generateRandom(2000, 6500),
                NetworkIn: 0,
                NetworkOut: 0,
                _Time: new Date(Date.now() - (i * 1000)).toISOString()
            });
        }

        setInterval(() => {
            if (perf.length == 120) perf.shift();
            perf.push({
                EntityCount: generateRandom(70000, 75000),
                Framerate: generateRandom(75, 125),
                Memory: generateRandom(2000, 6500),
                NetworkIn: 0,
                NetworkOut: 0,
                _Time: new Date().toISOString()
            });
        }, 1e3);

        setInterval(() => {
            if (generateRandom(0, 100) > 5) return;
            bc(`Some console message about ${random("saving", "some player getting shot", "some random plugin erroring", "someone getting eaten by a bear")}`);
        }, 1e3);

        setInterval(() => {
            if (generateRandom(0, 100) > 5) return;
            let m = `${random("Some", "Another", "Yet another", "Wee woo", "fooo")} chat message`;
            let p = JSON.stringify({Message: m, Username: names[generateRandom(0, names.length - 1)], Time: Math.floor(Date.now() / 1000)});
            bc(p, "Chat");
        }, 1e3);

        const bc = (obj, type = "Generic") => {
            for (let socket of this.server.clients) {
                const s = JSON.stringify({Identifier: 0, Message: obj, Stacktrace: "", Type: type});
                socket.send(s);
            }
        };

        this.server.on("connection", socket => {
            socket.reply = (obj, id) => socket.send(JSON.stringify({Identifier: id, Message: obj, Stacktrace: "", Type: "Generic"}));

            socket.on("message", data => {
                if (typeof data != "string") return socket.close(1000);
                let json = {};
                try { json = JSON.parse(data); }
                catch (_) { return socket.close(1000); }

                if (json.Identifier != undefined && typeof json.Identifier  != "number") return socket.close(1000);
                
                const id = json.Identifier ?? 0;
                let rv = null;

                if (json.Message && typeof json.Message == "string") {
                    switch (json.Message) {
                        case "serverinfo": {
                            rv = JSON.stringify({
                                Hostname: "Mock server",
                                MaxPlayers: 100,
                                Players: playerCount,
                                Queued: 0,
                                Joining: 0,
                                EntityCount: generateRandom(70000, 72000),
                                GameTime: formatDate(new Date(start.getTime() + Math.round(process.uptime() * 1000))),
                                Uptime: Math.round(process.uptime()),
                                Map: "Procedural Map",
                                Framerate: 75 + Math.random() * 50,
                                Memory: generateRandom(2000, 6500),
                                Collections: generateRandom(200, 275),
                                NetworkIn: 0,
                                NetworkOut: 0,
                                Restarting: false,
                                SaveCreatedTime: formatDate(start)
                            });
                            break;
                        }
                        case "playerlist": {
                            let clone = JSON.parse(JSON.stringify(players));
                            for (let item of clone) {
                                item.Ping = generateRandom(25, 170);
                                item.ConnectedSeconds = Math.floor(process.uptime());
                                item.Health = Math.random() * 100;
                            }
                            rv = JSON.stringify(clone);
                            break;
                        }
                        case "performance.tail": {
                            rv = JSON.stringify(perf);
                            break;
                        }
                        case "performance.now": {
                            rv = JSON.stringify(perf[119]);
                            break;
                        }
                        case "o.plugins":
                        case "oxide.plugins": {
                            rv = `Listing ${plugins.length} plugins:`;

                            for (let plugin of plugins) {
                                rv += `\n  ${plugins.indexOf(plugin).toString().padStart(2, 0)} "${plugin.name}" (${plugin.version}) by ${plugin.author} (${(Math.random() * 3.5).toFixed(2)}s) - ${plugin.filename}`;
                            }
                            
                            break;
                        }
                        case "banlistex": {
                            rv = bans;
                            break;
                        }
                    }
                }

                if (rv) {
                    if (id == 0) bc(rv);
                    else socket.reply(rv, id);
                }
            });
        });

        this.server.on("error", console.log);
    }
}

module.exports = Server;