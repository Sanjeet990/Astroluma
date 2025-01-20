const { spawn } = require('child_process');
const os = require('os');
const CryptoJS = require('crypto-js');

exports.isValidStream  = (url) => {
    return new Promise((resolve, reject) => {
        // Spawn the ffprobe process
        const ffprobe = spawn('ffprobe', [
            '-v', 'error',          // Show only errors
            '-show_streams',        // Display stream information
            '-select_streams', 'v', // Select video streams
            '-i', url               // Input URL
        ]);

        let output = '';
        let errorOutput = '';

        // Collect stdout data
        ffprobe.stdout.on('data', (data) => {
            output += data.toString();
        });

        // Collect stderr data (for errors)
        ffprobe.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        // Handle process close
        ffprobe.on('close', (code) => {
            if (code === 0 && output.includes('codec_name')) {
                // If successful and metadata includes codec information
                resolve(true);
            } else {
                console.error(`ffprobe error: ${errorOutput}`);
                resolve(false);
            }
        });

        // Handle errors
        ffprobe.on('error', (err) => {
            console.error(`Failed to start ffprobe: ${err.message}`);
            reject(err);
        });
    });
}

exports.isHostMode = () => {
    const inHostMode = process.env.HOST_MODE === 'true';
    return inHostMode;
}

exports.getSecretKey = () => {
    let secret = process.env.SECRET_KEY;

    //If secret is empty, generate a secret that doesn't change on this server. Probably use MAC address or something
    if (!secret) {
        const networkInterfaces = os.networkInterfaces();
        let macAddress = '';
        for (const key in networkInterfaces) {
            const networkInterface = networkInterfaces[key];
            for (const ni of networkInterface) {
                if (ni.mac && ni.mac !== '00:00:00:00:00:00') {
                    macAddress = ni.mac;
                    break;
                }
            }
            if (macAddress) {
                break;
            }
        }

        if (!macAddress) {
            macAddress = '00:00:00:00:00:00';
        }
        
        //Encrypt this string and make it 32 characters long
        secret = CryptoJS.AES.encrypt(macAddress, 'astroluma').toString().substring(0, 32);
    }

    return secret;
}