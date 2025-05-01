
const connectionTest = async (testerInstance) => {
    //implementa a connection tester logic
    try {
        const connectionUrl = testerInstance?.appUrl;

        if (!connectionUrl) {
            return testerInstance.connectionFailed("Invalid URL defined.");
        }

        const apiUrl = `${connectionUrl}/api/speedtest/latest/`;

        await testerInstance?.axios.get(apiUrl);

        await testerInstance.connectionSuccess();

    } catch (error) {
        await testerInstance.connectionFailed(error);
    }
}

const initialize = async (application) => {
    const connectionUrl = application?.appUrl;

    if (!connectionUrl) {
        return await application.sendError("Invalid URL defined.");
    }

    try {

        const apiUrl = `${connectionUrl}/api/speedtest/latest/`;

        const dataLoaded = await application?.axios.get(apiUrl);

        const data = dataLoaded?.data?.data;

        const ping = Math.round(data?.ping);
        const download = Math.round(data?.download);
        const upload = Math.round(data?.upload);
        const serverName = data?.server_name.length > 8 ? `${data.server_name.slice(0, 8)}...` : data.server_name;
        const url = data?.url;

        const variables = [
            { key: '{{ping}}', value: ping },
            { key: '{{download}}', value: download },
            { key: '{{upload}}', value: upload },
            { key: '{{serverName}}', value: serverName },
            { key: '{{url}}', value: url },
            { key: '{{trackerUrl}}', value: connectionUrl }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
        //console.log(error);
        await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;