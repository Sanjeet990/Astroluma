const connectionTest = async (testerInstance) => {
    //implementa a connection tester logic
    try {
        const connectionUrl = testerInstance?.appUrl;

        const proxmoxURL = `${connectionUrl}/api2/json`;

        const response = await testerInstance?.axios.post(`${proxmoxURL}/access/ticket`, {
            username: `${testerInstance?.config?.username}@${testerInstance?.config?.realm}`,
            password: testerInstance?.config?.password
        });

        if (response.status === 401) {
            await testerInstance.connectionFailed("Invalid credentials");
        } else {

            const data = response.data;

            if (data?.data?.ticket && data?.data?.CSRFPreventionToken) {
                await testerInstance.connectionSuccess();
            } else {
                await testerInstance.connectionFailed('Invalid response from Proxmox API');
            }
        }
    } catch (error) {
        await testerInstance.connectionFailed(error);
    }
}

const initialize = async (application) => {

    const { username, password, realm, skipTlsValidation } = application.config;


    const sanitizedListingUrl = application?.appUrl;

    if (!username || !password || !realm || !sanitizedListingUrl) {
        return await application.sendError('Please provide all the required configuration parameters');
    }

    const proxmoxURL = `${sanitizedListingUrl}/api2/json`;


    //get proxmox setup here
    try {

        const response = await application?.axios?.post(`${proxmoxURL}/access/ticket`, {
            username: `${username}@${realm}`,
            password
        });

        const data = response.data.data;

        const response2 = await application?.axios?.get(`${proxmoxURL}/nodes`, {
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
            { key: '{{proxMoxLink}}', value: application?.appUrl }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
        console.log(error);
        await application.sendError(error);
    }

}

global.initialize = initialize;
global.connectionTest = connectionTest;