const { spawn } = require('child_process');
const os = require('os');

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
    const interfaces = os.networkInterfaces();
    const isHostMode = !Object.keys(interfaces).some((name) =>
      name.startsWith('docker') || name.startsWith('br-')
    );
    return isHostMode ? true : false;
}