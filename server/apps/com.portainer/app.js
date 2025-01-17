
const connectionTest = async (testerInstance) => {
    try {
        const connectionUrl = testerInstance?.appUrl;
        const { username, password } = testerInstance.config;

        if (!username || !password || !connectionUrl) {
            await testerInstance.connectionFailed("Please provide all the required configuration parameters");
            return;
        }

        const authUrl = `${connectionUrl}/api/auth`;

        const response = await testerInstance?.axios.post(authUrl, {
            username,
            password
        });

        const data = response.data;

        if (data?.jwt) {
            await testerInstance.connectionSuccess();
        } else {
            await testerInstance.connectionFailed('Invalid response from Portainer API');
        }

    } catch (error) {
        await testerInstance.connectionFailed(error);
    }
}

const initialize = async (application) => {

    const { username, password } = application.config;

    const sanitizedListingUrl = application?.appUrl;

    if (!username || !password || !sanitizedListingUrl) {
        return await application.sendError('Please provide all the required configuration parameters');
    }

    const authUrl = `${sanitizedListingUrl}/api/auth`;
    const endpointsUrl = `${sanitizedListingUrl}/api/endpoints`;

    try {
        // Step 1: Authenticate using the access token to get a JWT token
        const authResponse = await application?.axios.post(authUrl, {
            username,
            password
        });

        const jwtToken = authResponse.data.jwt;

        // Step 2: Fetch the available endpoints
        const endpointsResponse = await application?.axios.get(endpointsUrl, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        const endpoints = endpointsResponse.data;

        const endpointId = endpoints[0].Id;

        // Step 3: Use the endpoint ID to fetch data from Portainer
        const apiUrl = `${sanitizedListingUrl}/api/endpoints/${endpointId}/docker/info`;
        const response = await application?.axios.get(apiUrl, {
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
            { key: '{{portainerLink}}', value: sanitizedListingUrl }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
        await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;