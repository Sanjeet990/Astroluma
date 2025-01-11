const connectionTest = async (testerInstance) => {
    //No need to connect to third party services,
    //so just report as connected

    await testerInstance.connectionSuccess();
}

const initialize = async (application) => {

    const htmlcode = application?.config?.htmlcode;
    
    try {
        
        const variables = [
            { key: '{{html}}', value: htmlcode }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
       await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;
