<div class="flex flex-col justify-center items-center h-full w-full p-2">

    <img class="w-16 h-16" src="https://cdn.jsdelivr.net/gh/selfhst/icons/png/speedtest-tracker.png" />

    <table class="w-full mb-4">
        <tbody>
            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="rgb(168, 85, 247)" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 1 1 0 9h-2.5"/>
                    </svg>
                    Server:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{serverName}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardTextpy-1 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="rgb(168, 85, 247)" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M12 12v3.5M12 2v2.5M12 19v3M5 12H2M22 12h-3M7.11 7.11 5 5M19 5l-2.12 2.12M16.88 16.88 19 19M7.11 16.88 5 19"/>
                    </svg>
                    Ping:
                </td>
                <td class="text-right w-1/2 text-itemCardTextpy-1 text-xs">{{ping}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardTextpt-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="rgb(168, 85, 247)" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M12 5v14M19 12l-7 7-7-7"/>
                    </svg>
                    Download:
                </td>
                <td class="text-right w-1/2 text-itemCardTextpt-2 text-xs">{{download}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardTextpt-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="rgb(168, 85, 247)" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M12 19V5M5 12l7-7 7 7"/>
                    </svg>
                    Upload:
                </td>
                <td class="text-right w-1/2 text-itemCardTextpt-2 text-xs">{{upload}}</td>
            </tr>
        </tbody>
    </table>
    <a href="{{url}}" target="_blank" class="w-full bg-blue-500 text-xs text-secondaryLightText p-2 rounded-full hover:bg-blue-700 text-center">
        Check Report
    </a>
    <a href="{{trackerUrl}}" target="_blank" class="mt-2 w-full bg-blue-500 text-xs text-secondaryLightText p-2 rounded-full hover:bg-blue-700 text-center">
        Open Speed Tracker
    </a>
</div>