
const connectionTest = async (testerInstance) => {
    //implementa a connection tester logic
    try {
        const connectionUrl = testerInstance?.appUrl;
        const apiKey = testerInstance?.config?.apiKey;

        if (!connectionUrl || !apiKey) {
            return testerInstance.connectionFailed("Linkace link or API key is missing.");
        }

        const attrs = {
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            }
        };

        const apiUrl = `${connectionUrl}/api/v1/links`;

        const dataLoaded = await testerInstance?.axios.get(apiUrl, attrs);

        if (dataLoaded?.status === 200) {
            await testerInstance.connectionSuccess();
        } else {
            await testerInstance.connectionFailed("Failed to connect to Linkace.");
        }

    } catch (error) {
        console.log(error);
        await testerInstance.connectionFailed(error);
    }
}

const initialize = async (application) => {

    const connectionUrl = application?.appUrl;
    const apiKey = application?.config?.apiKey;

    if (!connectionUrl || !apiKey) {
        return application.sendError("Linkace link or API key is missing.");
    }

    try {
        const attrs = {
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            }
        };

        const apiUrl = `${connectionUrl}/api/v1/links`;
        const tagsUrl = `${connectionUrl}/api/v1/tags`;

        const [linksLoaded, tagsLoaded] = await Promise.all([
            application?.axios.get(apiUrl, attrs),
            application?.axios.get(tagsUrl, attrs)
        ]);

        const linksCount = linksLoaded?.data?.total || 0;
        const tagsCount = tagsLoaded?.data?.total || 0;

        const variables = [
            { key: '{{linksCount}}', value: linksCount },
            { key: '{{tagsCount}}', value: tagsCount },
            { key: '{{linkaceLink}}', value: connectionUrl }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
        //console.log(error);
        await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;