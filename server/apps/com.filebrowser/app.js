const formatBytes = (bytes) => {
    // Function to format bytes into a readable format (e.g., MB, GB)
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}

const getToken = async (axios, connectionUrl, authHeader, username, password) => {
    try {
        const headers = {
            "Content-Type": "application/json",
        };

        if (authHeader) {
            headers[authHeader] = username;
        }

        const body = {
            username: username,
            password: password,
        };

        const apiUrl = `${connectionUrl}/api/login`;

        const response = await axios.post(apiUrl, body, { headers });

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error("Error getting token.");
        }
    } catch (error) {
        throw error;
    }
}

const connectionTest = async (testerInstance) => {
    //implementa a connection tester logic
    try {
        const connectionUrl = testerInstance?.appUrl;
        const username = testerInstance?.config?.username;
        const password = testerInstance?.config?.password;
        const proxyheader = testerInstance?.config?.proxyheader;

        if (!connectionUrl || !username || !password) {
            return testerInstance.connectionFailed("Connection data is missing.");
        }

        const token = await getToken(testerInstance?.axios, connectionUrl, proxyheader, username, password);

        if (token) {
            return testerInstance.connectionSuccess();
        } else {
            return testerInstance.connectionFailed("Connection failed.");
        }

    } catch (error) {
        await testerInstance.connectionFailed(error);
    }
}

const initialize = async (application) => {
    const connectionUrl = application?.appUrl;
    const username = application?.config?.username;
    const password = application?.config?.password;
    const proxyheader = application?.config?.proxyheader;

    if (!connectionUrl || !username || !password) {
        return testerInstance.connectionFailed("Connection data is missing.");
    }

    try {

        const token = await getToken(application?.axios, connectionUrl, proxyheader, username, password);

        const headers = {
            "X-AUTH": token
        };

        const apiUrl = `${connectionUrl}/api/usage`;

        const dataLoaded = await application?.axios.get(apiUrl, { headers });

        const total = formatBytes(dataLoaded?.data?.total);
        const used = formatBytes(dataLoaded?.data?.used);

        const variables = [
            { key: '{{total}}', value: total },
            { key: '{{used}}', value: used },
            { key: '{{filebrowserUrl}}', value: connectionUrl }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
        //console.log(error);
        await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;