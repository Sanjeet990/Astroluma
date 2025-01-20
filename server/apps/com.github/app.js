const moment = require('moment');

const extractRepoInfo = (url) => {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
        throw new Error("Invalid GitHub URL");
    }
    return {
        owner: match[1],
        repo: match[2]
    };
}

const connectionTest = async (testerInstance) => {
    //implementa a connection tester logic
    try {
        const connectionUrl = testerInstance?.appUrl; 
        const {username, password} = testerInstance?.config;

        if (!connectionUrl || !username || !password) {
            return testerInstance.connectionFailed("GitHub link or username or password is missing.");
        }

        const { owner, repo } = extractRepoInfo(connectionUrl);

        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls`;
        
        await testerInstance?.axios.get(apiUrl, {
            auth: {
                username,
                password,
            },
            params: {
                state: 'open',
            },
        });

        await testerInstance.connectionSuccess();
    } catch (error) {
        await testerInstance.connectionFailed(error);
    }
}

const initialize = async (application) => {

    const {username, password} = application.config;

    const listingUrl = application?.appUrl;

    if(!username || !password || !listingUrl) {
        await application.sendError('Please provide all the required configuration parameters');
    }

    try {
        const { owner, repo } = extractRepoInfo(listingUrl);

        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls`;
        
        const response = await application?.axios.get(apiUrl, {
            auth: {
                username,
                password,
            },
            params: {
                state: 'open',
            },
        });

        const pullRequests = response.data;

        // Number of opened PRs
        const numberOfOpenPRs = pullRequests.length;

        // Last PR's date and time
        let lastPRDate = null;
        let lastPRAuthor = null;
        if (numberOfOpenPRs > 0) {
            // Sort PRs by creation date to find the last PR
            pullRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            lastPRDate = pullRequests[0].created_at;
            lastPRAuthor = pullRequests[0].user.login;
        }

        const formattedDate = lastPRDate ? moment(lastPRDate).format('MMM Do YYYY, h:mm A') : "N/A";

        const variables = [
            { key: '{{numPR}}', value: numberOfOpenPRs },
            { key: '{{lastPR}}', value: formattedDate },
            { key: '{{author}}', value: lastPRAuthor ? lastPRAuthor : "N/A" },
            { key: '{{repoLink}}', value: listingUrl }
        ];

        await application.sendResponse('response.tpl', 200, variables);

    } catch (error) {
        //console.log(error);
        await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;
