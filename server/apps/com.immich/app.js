
const setupHeader = (apikey) => {
    if (!apikey) {
        return [];
    }

    return {
        headers: {
            "Accept": "application/json",
            "x-api-key": apikey,
        },
    };
}

const connectionTest = async (testerInstance) => {
    //implementa a connection tester logic
    try {
        const connectionUrl = testerInstance?.appUrl;
        const apiKey = testerInstance?.config?.apiKey;

        if (!connectionUrl || !apiKey) {
            return testerInstance.connectionFailed("Missing connection url or api key");
        }


        const headers = setupHeader(apiKey);

        const apiUrl = `${connectionUrl}/api/server/statistics`;

        const response = await testerInstance?.axios.get(apiUrl, headers);

        if (response.status === 200) {
            await testerInstance.connectionSuccess();
        } else {
            await testerInstance.connectionFailed("Failed to connect to the server");
        }

    } catch (error) {
        await testerInstance.connectionFailed(error);
    }
}

const initialize = async (application) => {
    const connectionUrl = application?.appUrl;
    const apiKey = application?.config?.apiKey;

    if (!connectionUrl || !apiKey) {
        return application.sendError("Missing connection url or api key");
    }

    try {

        const headers = setupHeader(apiKey);

        const apiUrl = `${connectionUrl}/api/server/statistics`;

        
        const response = await application?.axios.get(apiUrl, headers);
        const dataLoaded = response.data;

        let photos = 0;
        let videos = 0;
        let usage = "0GiB";

        if (dataLoaded) {
            photos = Number(dataLoaded.photos).toLocaleString();
            videos = Number(dataLoaded.videos).toLocaleString();
            const usageInGiB = (dataLoaded.usage / 1073741824).toFixed(2);
            usage = `${usageInGiB}GiB`;
        }
    
        const variables = [
            { key: '{{photos}}', value: photos },
            { key: '{{videos}}', value: videos },
            { key: '{{usage}}', value: usage },
            { key: '{{immichUrl}}', value: connectionUrl },
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
        await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;