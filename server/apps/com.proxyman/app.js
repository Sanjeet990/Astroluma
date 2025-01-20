
const connectionTest = async (testerInstance) => {
    //implementa a connection tester logic
    try {
        const apiUrl = testerInstance?.appUrl;

        const { email, password } = testerInstance.config;

        if (!email || !password || !apiUrl) {
            await testerInstance.connectionFailed("Please provide all the required configuration parameters");
        }

        const tokenResponse = await testerInstance?.axios.post(`${apiUrl}/api/tokens`, {
            identity: email,
            secret: password,
            expiry: '1y'
        }, {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            }
        });

        if (tokenResponse?.data?.token) {
            await testerInstance.connectionSuccess();
        } else {
            await testerInstance.connectionFailed("Invalid credentials");
        }
    } catch (error) {
        await testerInstance.connectionFailed(error);
    }
}


const initialize = async (application) => {

    const { email, password } = application.config;

    const apiUrl = application?.appUrl;

    if (!email || !password || !apiUrl) {
        await application.sendError('Please provide all the required configuration parameters');
    }

    try {
        // Obtain the bearer token
        const tokenResponse = await application?.axios.post(`${apiUrl}/api/tokens`, {
            identity: email,
            secret: password,
            expiry: '1y'
        }, {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            }
        });

        const token = tokenResponse.data.token;

        // Fetch the statistics using the bearer token
        const statsResponse = await application?.axios.get(`${apiUrl}/api/reports/hosts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = statsResponse.data;

        const variables = [
            { key: '{{dead}}', value: data.dead },
            { key: '{{proxy}}', value: data.proxy },
            { key: '{{redirection}}', value: data.redirection },
            { key: '{{stream}}', value: data.stream },
            { key: '{{proxyManagerLink}}', value: apiUrl }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
        await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;