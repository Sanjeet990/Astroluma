
exports.initialize = async (application) => {

    const htmlcode = application?.config?.htmlcode;
    
    try {
        
        const variables = [
            { key: '{{html}}', value: htmlcode }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
       await application.sendError(400, 'Error in fetching data from GitHub.');
    }
}
