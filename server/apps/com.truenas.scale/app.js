
const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / (60 * 60));
    if (hours < 24) {
        return `${hours} hours`;
    } else {
        const days = Math.floor(hours / 24);
        return `${days} days`;
    }
};

const formatMemory = (bytes) => {
    if (bytes >= 1024 ** 4) {
        return `${(bytes / (1024 ** 4)).toFixed(2)} TB`;
    } else if (bytes >= 1024 ** 3) {
        return `${(bytes / (1024 ** 3)).toFixed(2)} GB`;
    } else {
        return `${(bytes / (1024 ** 2)).toFixed(2)} MB`;
    }
};

const connectionTest = async (testerInstance) => {
    //implementa a connection tester logic
    try {
        const nasUrl = testerInstance?.appUrl;

        const { apiKey } = testerInstance?.config;

        if (!apiKey || !nasUrl) {
            await testerInstance.connectionFailed("Please provide all the required configuration parameters");
        }

        const systemInfo = await testerInstance?.axios.get(`${nasUrl}/api/v2.0/system/info`, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        });

        if (systemInfo.status === 200) {
            await testerInstance.connectionSuccess();
        } else {
            await testerInstance.connectionFailed("Invalid response from TrueNAS Scale API");
        }

    } catch (error) {
        await testerInstance.connectionFailed(error);
    }
}

const initialize = async (application) => {

    const { apiKey } = application.config;

    const nasUrl = application?.appUrl;

    if (!apiKey || !nasUrl) {
        await application.sendError(400, 'Please provide all the required configuration parameters');
    }

    try {
        //call TrueNAS Scale API
        const systemInfo = await application?.axios.get(`${nasUrl}/api/v2.0/system/info`, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        });

        const data = systemInfo.data;

        const uptime_seconds = formatUptime(data.uptime_seconds || 0);
        const cores = data.cores;
        const memory = formatMemory(data.physmem || 0);

        const systemAlert = await application?.axios.get(`${nasUrl}/api/v2.0/alert/list`, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        });

        const alerts = systemAlert.data;

        const totalAlerts = alerts.filter(alert => alert.dismissed === false).length;
        const criticalAlerts = alerts.filter(alert => alert.level === 'CRITICAL').length;
        const infoAlerts = alerts.filter(alert => alert.level === 'INFO').length;


        const variables = [
            { key: '{{uptimes}}', value: uptime_seconds },
            { key: '{{cores}}', value: cores },
            { key: '{{memory}}', value: memory },
            { key: '{{alerts}}', value: totalAlerts },
            { key: '{{critical}}', value: criticalAlerts },
            { key: '{{info}}', value: infoAlerts },
            { key: '{{nasLink}}', value: nasUrl }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
        await application.sendError(400, 'Error in fetching data from GitHub.');
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;
