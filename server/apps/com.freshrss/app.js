const md5 = require('md5');

const getApiKey = (username, apiKey) => {
    return md5(`${username}:${apiKey}`);
}

const connectionTest = async (testerInstance) => {
    //implementa a connection tester logic
    try {
        const connectionUrl = testerInstance?.appUrl;
        const username = testerInstance?.config?.username;
        const apiKey = testerInstance?.config?.apiKey;

        if (!connectionUrl || !apiKey || !username) {
            return testerInstance.connectionFailed("Connection URL, API key or username is missing.");
        }

        const attrs = {
            body: `api_key=${getApiKey(username, apiKey)}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        };

        const apiUrl = `${connectionUrl}/api/fever.php?api`;

        const data = await testerInstance?.axios.post(apiUrl, attrs.body, { headers: attrs.headers });

        if (data?.data?.auth) {
            await testerInstance.connectionSuccess();
        } else {
            return testerInstance.connectionFailed("Connection failed. Please check your credentials.");
        }

    } catch (error) {
        await testerInstance.connectionFailed(error);
    }
}

const initialize = async (application) => {
    const connectionUrl = application?.appUrl;
    const username = application?.config?.username;
    const apiKey = application?.config?.apiKey;

    if (!connectionUrl || !apiKey || !username) {
        return application.sendError("Connection URL, API key or username is missing.");
    }

    try {
        const attrs = {
            body: `api_key=${getApiKey(username, apiKey)}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        };

        const apiUrl = `${connectionUrl}/api/fever.php?api&unread_item_ids`;

        const dataLoaded = await application?.axios.post(apiUrl, attrs.body, { headers: attrs.headers });

        const unreadItems = dataLoaded?.data?.unread_item_ids?.split(',');

        const unreadCount = unreadItems?.length || 0;

        const variables = [
            { key: '{{unreadCount}}', value: unreadCount },
            { key: '{{connectionUrl}}', value: connectionUrl }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
        await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;