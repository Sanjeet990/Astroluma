
const connectionTest = async (testerInstance) => {
    try {
        const connectionUrl = testerInstance?.appUrl;
        
        if (!connectionUrl) {
            await testerInstance.connectionFailed("Please provide all the required configuration parameters");
            return;
        }

        //console.log(`${connectionUrl}/health`);

        const response = await testerInstance?.axios.get(`${connectionUrl}/health`);

        if (response.status === 200) {
            await testerInstance.connectionSuccess();
        } else {
            await testerInstance.connectionFailed('Invalid response from Heimdall');
        }

    } catch (error) {
        //console.log(error);
        await testerInstance.connectionFailed(error);
    }
}

const initialize = async (application) => {

    const appUrl = application?.appUrl;

    if (!appUrl) {
        return await application.sendError('Please provide all the required configuration parameters');
    }

    try {
        
        const response = await application?.axios.get(`${appUrl}/health`);

        const data = response.data;

        const variables = [
            { key: '{{items}}', value: data.items },
            { key: '{{users}}', value: data.users },
            { key: '{{appUrl}}', value: appUrl }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
        await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;