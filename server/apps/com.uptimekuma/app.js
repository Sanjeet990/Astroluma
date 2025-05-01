const Buffer = require('buffer').Buffer;

const setupHeader = (apikey) => {
    if (!apikey) {
        return [];
    }

    const basicAuthValue = Buffer.from(`:${apikey}`).toString('base64');

    return {
        headers: {
            Authorization: `Basic ${basicAuthValue}`,
        },
    };
}

const connectionTest = async (testerInstance) => {
    //implementa a connection tester logic
    try {
        const connectionUrl = testerInstance?.appUrl;
        const apiKey = testerInstance?.config?.apiKey;

        if (!connectionUrl || !apiKey) {
            return testerInstance.connectionFailed("Missing connection url or api key");
        }


        const headers = setupHeader(apiKey);

        const apiUrl = `${connectionUrl}/metrics`;

        const response = await testerInstance?.axios.get(apiUrl, headers);

        console.log(response);

        if (response.status === 200) {
            await testerInstance.connectionSuccess();
        } else {
            await testerInstance.connectionFailed("Failed to connect to the server");
        }

    } catch (error) {
        await testerInstance.connectionFailed(error);
    }
}

const initialize = async (application) => {
    const kumaLink = application?.appUrl;
    const apiKey = application?.config?.apiKey;

    if (!kumaLink || !apiKey) {
        return kumaLink.sendError("Missing connection url or api key");
    }

    try {

        if (!kumaLink || !apiKey) {
            return application.sendError("Missing connection url or api key");
        }


        const headers = setupHeader(apiKey);

        const apiUrl = `${kumaLink}/metrics`;

        const response = await application?.axios.get(apiUrl, headers);
        const body = response.data;

        const lines = body.split("\n");

        const data = {
            up: 0,
            down: 0,
            pending: 0,
            maintenance: 0,
            unknown: 0,
        };

        lines.forEach((line) => {
            if (line.length === 0 || line.startsWith("#")) {
                // Skip empty lines or comments
                return;
            }

            if (!line.startsWith("monitor_status")) {
                // Skip metrics that are not monitor statuses
                return;
            }

            // Extract the state, which is the integer at the end of the line
            const state = parseInt(line.slice(line.lastIndexOf(" ") + 1), 10);

            // Map the state to a specific status or 'unknown'
            const stateMapping = {
                0: "down",
                1: "up",
                2: "pending",
                3: "maintenance",
            };

            const key = stateMapping[state] || "unknown";
            data[key]++;
        });

        const variables = [
            { key: '{{up}}', value: data["up"] },
            { key: '{{down}}', value: data["down"] },
            { key: '{{pending}}', value: data["pending"] },
            { key: '{{maintenance}}', value: data["maintenance"] },
            { key: '{{unknown}}', value: data["unknown"] },
            { key: '{{kumaLink}}', value: kumaLink }
        ];

        await application.sendResponse('response.tpl', 200, variables);


    } catch (error) {
        await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;