const axios = require('axios');
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

exports.initialize = async (application) => {

    const username = application?.config?.username;
    const password = application?.config?.password;
    const listingUrl = application?.payload?.listingUrl || application?.payload?.localUrl;

    try {
        const { owner, repo } = extractRepoInfo(listingUrl);

        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls`;

        const response = await axios.get(apiUrl, {
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
        await application.sendError(400, 'Error in fetching data from GitHub.');
    }
}
