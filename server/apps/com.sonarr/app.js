
const formatSpace = (data) => {
    const units = ["B", "KB", "MB", "GB", "TB"];

    function formatBytes(bytes) {
        let unitIndex = 0;
        while (bytes >= 1024 && unitIndex < units.length - 1) {
            bytes /= 1024;
            unitIndex++;
        }
        return `${bytes.toFixed(2)} ${units[unitIndex]}`;
    }

    return data.map(item => [
        formatBytes(item.freeSpace),
        formatBytes(item.totalSpace),
    ]);
}

const connectionTest = async (testerInstance) => {
    //implementa a connection tester logic
    try {
        const connectionUrl = testerInstance?.appUrl;
        const apiKey = testerInstance?.config?.apiKey;

        if (!connectionUrl || !apiKey) {
            return testerInstance.connectionFailed("Sonarr link or API key is missing.");
        }

        const apiUrl = `${connectionUrl}/api/v3/wanted/missing/?sortKey=series.title&apikey=${apiKey}`;

        await testerInstance?.axios.get(apiUrl);

        await testerInstance.connectionSuccess();

    } catch (error) {
        await testerInstance.connectionFailed(error);
    }
}

const initialize = async (application) => {
    const sonarrLink = application?.appUrl;
    const apiKey = application?.config?.apiKey;

    if (!sonarrLink || !apiKey) {
        return sonarrLink.sendError('Sonarr link or API key is missing.');
    }

    const missingUrl = `${sonarrLink}/api/v3/wanted/missing/?sortKey=series.title&apikey=${apiKey}`;
    const queueUrl = `${sonarrLink}/api/v3/queue/?sortKey=series.title&apikey=${apiKey}`;
    const spaceUrl = `${sonarrLink}/api/v3/diskspace/?apikey=${apiKey}`;

    try {
        const [missingResponse, queueResponse, spaceResponse] = await Promise.all([
            application?.axios.get(missingUrl),
            application?.axios.get(queueUrl),
            application?.axios.get(spaceUrl)
        ]);

        const storageData = formatSpace(spaceResponse?.data);

        const variables = [
            { key: '{{missing}}', value: missingResponse?.data?.totalRecords },
            { key: '{{queue}}', value: queueResponse?.data?.totalRecords },
            { key: '{{slash}}', value: `${storageData[0][0]}` },
            { key: '{{config}}', value: `${storageData[1][0]}` },
            { key: '{{tv}}', value: `${storageData[2][0]}` },
            { key: '{{download}}', value: `${storageData[3][0]}` },
            { key: '{{sonarrLink}}', value: sonarrLink }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
        //console.log(error);
        await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;