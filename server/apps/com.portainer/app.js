const axios = require('axios');

exports.initialize = async (application) => {
    const username = application?.config?.username;
    const password = application?.config?.password;

    const listingUrl = application?.payload?.listingUrl || application?.payload?.localUrl;

    const sanitizedListingUrl = listingUrl.endsWith('/') ? listingUrl.slice(0, -1) : listingUrl;

    const authUrl = `${sanitizedListingUrl}/api/auth`;
    const endpointsUrl = `${sanitizedListingUrl}/api/endpoints`;

    try {
        // Step 1: Authenticate using the access token to get a JWT token
        const authResponse = await axios.post(authUrl, {
            username,
            password 
        });

        const jwtToken = authResponse.data.jwt;

        // Step 2: Fetch the available endpoints
        const endpointsResponse = await axios.get(endpointsUrl, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        const endpoints = endpointsResponse.data;

        const endpointId = endpoints[0].Id;

        // Step 3: Use the endpoint ID to fetch data from Portainer
        const apiUrl = `${listingUrl}/api/endpoints/${endpointId}/docker/info`;
        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        const data = response.data;

        const variables = [
            { key: '{{containers}}', value: data.Containers },
            { key: '{{images}}', value: data.Images },
            { key: '{{containersRunning}}', value: data.ContainersRunning },
            { key: '{{containersPaused}}', value: data.ContainersPaused },
            { key: '{{containersStopped}}', value: data.ContainersStopped },
            { key: '{{version}}', value: data.ServerVersion },
            { key: '{{portainerLink}}', value: listingUrl }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
        await application.sendError(400, 'Error in fetching data from Portainer.');
    }
}