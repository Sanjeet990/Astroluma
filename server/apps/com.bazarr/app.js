const connectionTest = async (testerInstance) => {
    //implementa a connection tester logic
    try {
        const connectionUrl = testerInstance?.appUrl;
        const apiKey = testerInstance?.config?.apiKey;

        if (!connectionUrl || !apiKey) {
            return testerInstance.connectionFailed("Bazarr link or API key is missing.");
        }

        const apiUrl = `${connectionUrl}/api/systemstatus?apikey=${apiKey}`;

        await testerInstance?.axios.get(apiUrl);

        await testerInstance.connectionSuccess();

    } catch (error) {
        await testerInstance.connectionFailed(error);
    }
}

const initialize = async (application) => {
    const connectionUrl = application?.appUrl;
    const apiKey = application?.config?.apiKey;

    if (!connectionUrl || !apiKey) {
        return application.sendError("Bazarr link or API key is missing.");
    }

    try {
        const apiUrl = `${connectionUrl}/api/badges?apikey=${apiKey}`;

        const dataLoaded = await application?.axios.get(apiUrl);

        const episodes = dataLoaded?.data?.episodes || 0;
        const movies = dataLoaded?.data?.movies || 0;
        const providers = dataLoaded?.data?.providers || 0;
        const announcements = dataLoaded?.data?.announcements || 0;

        const variables = [
            { key: '{{episodes}}', value: episodes },
            { key: '{{movies}}', value: movies },
            { key: '{{providers}}', value: providers },
            { key: '{{announcements}}', value: announcements },
            { key: '{{bazarrLink}}', value: connectionUrl }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
        //console.log(error);
        await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;