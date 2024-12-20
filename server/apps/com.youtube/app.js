const axios = require('axios');

const formatCount = (count) => {
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`;
    } else {
        return count.toString();
    }
}

exports.initialize = async (application) => {
    const youtubeLink = application?.payload?.listingUrl || application?.payload?.localUrl;
    const apiKey = application?.config?.apiKey;

    if (!youtubeLink || !apiKey) {
        return application.sendError(400, 'YouTube link or API key is missing.');
    }

    const videoId = youtubeLink.split('v=')[1];
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,statistics`;

    try {
        const response = await axios.get(apiUrl);
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
        await application.sendError(400, 'Error in fetching data from YouTube.');
    }
}
