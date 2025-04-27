const WebSocket = require('ws');
const { spawn } = require('child_process');
const ping = require('ping');
const { Listing, NetworkDevice } = require('./models');
const wss = new WebSocket.Server({ noServer: true });
const wssPing = new WebSocket.Server({ noServer: true });
const url = require('url');
const jwt = require('jsonwebtoken');

const ffmpegProcesses = new Map();
const wsClients = new Map();

const spawnFFmpeg = (rtspLink) => {

    return spawn('ffmpeg', [
        '-hide_banner',
        '-loglevel', 'quiet',
        '-i', rtspLink,
        '-f', 'mpegts',
        '-rtsp_transport', 'tcp',
        '-crf', '23',
        '-maxrate', '1M',
        '-g', '50',
        '-codec:v', 'copy',
        '-codec:a', 'aac',
        '-b:a', '32k',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-'
    ]);
};

const killFFmpeg = (videoId) => {
    const ffmpeg = ffmpegProcesses.get(videoId);
    if (ffmpeg) {
        console.log(`Killing existing FFmpeg process for ${videoId}`);
        try {
            ffmpeg.kill('SIGINT');
            ffmpegProcesses.delete(videoId);
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }
    } else {
        console.log(`No existing FFmpeg process for ${videoId}`);
    }
};

wss.on('connection', (ws, request, rtspLink, videoId) => {

    // Send a ping every 5 seconds to keep the connection alive
    const pingInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
            ws.ping();
        }
    }, 5000);

    // If no existing FFmpeg process for this videoId, spawn a new one
    if (!ffmpegProcesses.has(videoId)) {
        const ffmpeg = spawnFFmpeg(rtspLink);
        ffmpegProcesses.set(videoId, ffmpeg);
        wsClients.set(videoId, []);

        ffmpeg.stdout.on('data', (data) => {
            const clients = wsClients.get(videoId);
            if (clients) {
                clients.forEach(client => {
                    if (client.readyState === client.OPEN) {
                        client.send(data);
                    } else {
                        console.log('Client is not available to receive messages.');
                    }
                });
            }
        });

        ffmpeg.on('close', (code) => {
            console.log(`FFmpeg closed with code ${code}`);
            ffmpegProcesses.delete(videoId);
            wsClients.delete(videoId);
        });

        ffmpeg.on('error', (err) => {
            console.error(`FFmpeg error: ${err}`);
            ffmpegProcesses.delete(videoId);
            wsClients.delete(videoId);
        });
    }

    // Add the new WebSocket client to the list for this videoId
    wsClients.get(videoId).push(ws);

    ws.on('close', () => {
        console.log('WebSocket closed');
        clearInterval(pingInterval);
        const clients = wsClients.get(videoId);
        if (clients) {
            wsClients.set(videoId, clients.filter(client => client !== ws));
        }
        if (wsClients.get(videoId)?.length === 0) {
            killFFmpeg(videoId);
        }
    });

    ws.on('error', (err) => {
        console.error(`WebSocket error: ${err}`);
        clearInterval(pingInterval);
        const clients = wsClients.get(videoId);
        if (clients) {
            wsClients.set(videoId, clients.filter(client => client !== ws));
        }
        if (wsClients.get(videoId).length === 0) {
            killFFmpeg(videoId);
        }
    });
});

wssPing.on('connection', (ws) => {
    let pingInterval;

    ws.on('message', async (message) => {
        const receivedText = message.toString();

        if (receivedText.startsWith('instant')) {
            const deviceId = receivedText.split('-')[1];
            try {
                const deviceData = await NetworkDevice.findOne({
                    where: { id: deviceId }
                });

                if (!deviceData || !deviceData.deviceIp) {
                    ws.send('No IP address provided');
                    ws.close();
                    return;
                }

                const ipAddress = deviceData.deviceIp;
                const result = await ping.promise.probe(ipAddress, {
                    timeout: 6,
                    min_reply: 2
                });

                await deviceData.update({ isAlive: result.alive });

                const response = {
                    deviceIp: ipAddress,
                    alive: result.alive,
                    time: result.time
                };

                ws.send(JSON.stringify(response));
            } catch (error) {
                console.error(`Error: ${error.message}`);
                ws.send(`Error: ${error.message}`);
            }

        } else {
            const deviceId = receivedText;

            try {
                const deviceData = await NetworkDevice.findOne({
                    where: { id: deviceId }
                });

                if (!deviceData || !deviceData.deviceIp) {
                    ws.send('No IP address provided');
                    ws.close();
                    return;
                }

                const ipAddress = deviceData.deviceIp;

                const response = {
                    deviceIp: ipAddress,
                    alive: deviceData.isAlive,
                    time: 0
                };

                ws.send(JSON.stringify(response));

                if (pingInterval) clearInterval(pingInterval);

                pingInterval = setInterval(async () => {
                    try {
                        const result = await ping.promise.probe(ipAddress, {
                            timeout: 6,
                            min_reply: 2
                        });

                        await deviceData.update({ isAlive: result.alive });

                        const responseData = {
                            deviceIp: ipAddress,
                            alive: result.alive,
                            time: result.time
                        };

                        ws.send(JSON.stringify(responseData));
                    } catch (error) {
                        console.error(`Error: ${error.message}`);
                        ws.send(`Error: ${error.message}`);
                    }
                }, 60000);
            } catch (error) {
                console.error(`Error: ${error.message}`);
                ws.send(`Error: ${error.message}`);
            }
        }
    });

    ws.on('close', () => {
        console.log("Client disconnected");
        if (pingInterval) clearInterval(pingInterval);
    });
});

const handleUpgrade = async (request, socket, head) => {
    const parsedUrl = new URL(request.url, `http://${request.headers.host}`);
    const token = parsedUrl.searchParams.get('token');

    try {
        await jwt.verify(token, process.env.SECRET || "SomeRandomStringSecret");

        const videoId = parsedUrl.pathname.split('/')[1];

        if (videoId) {
            try {
                const listing = await Listing.findOne({
                    where: { id: videoId }
                });

                if (!listing) {
                    console.log(`Listing not found: ${videoId}`);
                    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
                    socket.destroy();
                    return;
                }

                wss.handleUpgrade(request, socket, head, (ws) => {
                    wss.emit('connection', ws, request, listing.listingUrl, videoId);
                });
            } catch (error) {
                console.error(`Error: ${error.message}`);
                socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
                socket.destroy();
            }
        } else {
            wssPing.handleUpgrade(request, socket, head, (ws) => {
                wssPing.emit('connection', ws, request);
            });
        }
    } catch (err) {
        socket.write('HTTP/1.1 401 Not Authorized\r\n\r\n');
        socket.destroy();
    }
};

module.exports = { wss, wssPing, handleUpgrade };
