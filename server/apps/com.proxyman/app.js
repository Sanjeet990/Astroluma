const axios = require('axios');

const initialize = async (application) => {

    const {email, password} = application.config;
    
    const listingUrl = application?.payload?.listingUrl || application?.payload?.localUrl;

    if(!email || !password || !listingUrl) {
        return await application.sendError(400, 'Please provide all the required configuration parameters');
    }

    const apiUrl = listingUrl.endsWith('/') ? listingUrl.slice(0, -1) : listingUrl;

    if (!apiUrl || !email || !password) {
        return application.sendError(400, 'API URL, email, or password is missing.');
    }

    try {
        // Obtain the bearer token
        const tokenResponse = await axios.post(`${apiUrl}/api/tokens`, {
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
        const statsResponse = await axios.get(`${apiUrl}/api/reports/hosts`, {
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
            { key: '{{proxyManagerLink}}', value: listingUrl }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
        await application.sendError(400, 'Error in fetching data from Nginx Proxy Manager.');
    }
}

global.initialize = initialize;