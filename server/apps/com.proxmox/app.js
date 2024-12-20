const axios = require('axios');
const https = require('https');

exports.initialize = async (application) => {

    const username = application?.config?.username;
    const password = application?.config?.password;
    const realm = application?.config?.realm;

    const listingUrl = application?.payload?.localUrl || application?.config?.listingUrl;
    
    const sanitizedListingUrl = listingUrl.endsWith('/') ? listingUrl.slice(0, -1) : listingUrl;

    const proxmoxURL = `${sanitizedListingUrl}/api2/json`;

    const axiosInstance = axios.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false // Disable SSL verification
        })
    });

    //get sonar setup here
    try {

        const response = await axiosInstance.post(`${proxmoxURL}/access/ticket`, {
            username: `${username}@${realm}`,
            password
        });

        const data = response.data.data;

        const response2 = await axiosInstance.get(`${proxmoxURL}/nodes`, {
            headers: {
                'Cookie': `PVEAuthCookie=${data.ticket}`,
                'CSRFPreventionToken': data.CSRFPreventionToken
            }
        });

        const { node, status, cpu, maxmem, mem, disk, uptime, maxdisk } = response2.data.data[0];

        const cpuUsagePercentage = (cpu * 100).toFixed(2);
        const ramUsagePercentage = ((mem / maxmem) * 100).toFixed(2);
        const diskUsagePercentage = ((disk / maxdisk) * 100).toFixed(2);

        const days = Math.floor(uptime / (24 * 60 * 60));
        const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((uptime % (60 * 60)) / 60);

        // Create uptime string with non-zero values
        let uptimeString = '';
        if (days > 0) {
            uptimeString += `${days} d `;
            if (hours > 0) uptimeString += `${hours} h `;
        } else {
            if (hours > 0) uptimeString += `${hours} h `;
            if (minutes > 0) uptimeString += `${minutes} m `;
        }

        const variables = [
            { key: '{{node}}', value: node.charAt(0).toUpperCase() + node.slice(1) },
            { key: '{{status}}', value: status.charAt(0).toUpperCase() + status.slice(1) },
            { key: '{{cpu}}', value: cpuUsagePercentage },
            { key: '{{memory}}', value: ramUsagePercentage },
            { key: '{{disk}}', value: diskUsagePercentage },
            { key: '{{uptime}}', value: uptimeString },
            { key: '{{proxMoxLink}}', value: listingUrl }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
        await application.sendError(400, 'Error fetching data from Proxmox API');
    }

}
