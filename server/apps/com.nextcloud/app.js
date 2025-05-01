const Buffer = require('buffer').Buffer;

const formatStorage = (bytes) => {
    if (bytes >= 1024 ** 4) {
        return `${(bytes / (1024 ** 4)).toFixed(2)} TB`;
    } else if (bytes >= 1024 ** 3) {
        return `${(bytes / (1024 ** 3)).toFixed(2)} GB`;
    } else {
        return `${(bytes / (1024 ** 2)).toFixed(2)} MB`;
    }
};

const setupHeader = (username, password) => {
    if (!username || !password) {
        return [];
    }

    const basicAuthValue = Buffer.from(`${username}:${password}`).toString('base64');

    return {
        headers: {
            Authorization: `Basic ${basicAuthValue}`,
            "OCS-APIRequest": "true",
        },
    };
}

const connectionTest = async (testerInstance) => {
    try {
        const connectionUrl = testerInstance?.appUrl;
        const { username, password } = testerInstance.config;

        if (!username || !password || !connectionUrl) {
            await testerInstance.connectionFailed("Please provide all the required configuration parameters");
            return;
        }

        const headers = setupHeader(username, password);

        const authUrl = `${connectionUrl}/ocs/v1.php/cloud/users/${username}?format=json`;
        
        const response = await testerInstance?.axios.get(authUrl, headers);

        if (response.status === 200) {
            await testerInstance.connectionSuccess();
        } else {
            await testerInstance.connectionFailed('Invalid response from NextCloud API');
        }

    } catch (error) {
        await testerInstance.connectionFailed(error);
    }
}

const initialize = async (application) => {

    const { username, password } = application.config;

    const connectionUrl = application?.appUrl;

    if (!username || !password || !connectionUrl) {
        return await application.sendError('Please provide all the required configuration parameters');
    }

    try {
        const headers = setupHeader(username, password);

        const authUrl = `${connectionUrl}/ocs/v1.php/cloud/users/${username}?format=json`;

        const response = await application?.axios.get(authUrl, headers);
        
        const data = response.data;

        const free = formatStorage(data?.ocs?.data?.quota?.free || 0);
        const used = formatStorage(data?.ocs?.data?.quota?.used || 0);
        const total = formatStorage(data?.ocs?.data?.quota?.total || 0);
        const usage = (data?.ocs?.data?.quota?.relative || 0).toFixed(1);

        const variables = [
            { key: '{{free}}', value: free },
            { key: '{{used}}', value: used },
            { key: '{{total}}', value: total },
            { key: '{{usage}}', value: usage },
            { key: '{{connectionUrl}}', value: connectionUrl }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
        console.error(error);
        await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;