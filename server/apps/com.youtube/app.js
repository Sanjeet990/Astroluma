
const formatCount = (count) => {
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`;
    } else {
        return count.toString();
    }
}

const connectionTest = async (testerInstance) => {
    //implementa a connection tester logic
    try {
        const connectionUrl = testerInstance?.appUrl;
        const apiKey = testerInstance?.config?.apiKey;    

        if (!connectionUrl || !apiKey) {
            return testerInstance.connectionFailed("YouTube link or API key is missing.");
        }

        const videoId = connectionUrl.split('v=')[1];
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,statistics`;

        await testerInstance?.axios.get(apiUrl);

        await testerInstance.connectionSuccess();
        
    } catch (error) {
        await testerInstance.connectionFailed(error);
    }
}

const initialize = async (application) => {
    const youtubeLink = application?.appUrl;
    const apiKey = application?.config?.apiKey;

    if (!youtubeLink || !apiKey) {
        return application.sendError('YouTube link or API key is missing.');
    }

    const videoId = youtubeLink.split('v=')[1];
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,statistics`;

    try {
        const response = await application?.axios.get(apiUrl);
        const videoData = response.data.items[0];
        const thumb = response.data.items[0].snippet.thumbnails.high.url;

        const variables = [
            { key: '{{views}}', value: formatCount(videoData.statistics.viewCount) },
            { key: '{{likes}}', value: formatCount(videoData.statistics.likeCount) },
            { key: '{{comments}}', value: formatCount(videoData.statistics.commentCount) },
            { key: '{{downloadLink}}', value: youtubeLink },
            { key: '{{youtubeLink}}', value: youtubeLink }
        ];

        await application.sendResponse('response.tpl', 200, variables, thumb);

    } catch (error) {
        //console.log(error);
        await application.sendError(error);
    }
}

global.initialize = initialize;
global.connectionTest = connectionTest;