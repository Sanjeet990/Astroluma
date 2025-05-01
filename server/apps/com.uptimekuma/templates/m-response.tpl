<div class="flex flex-col justify-center items-center h-full w-full p-2">

    <img class="w-16 h-16" src="https://raw.githubusercontent.com/louislam/uptime-kuma/master/public/icon.svg" />

    <table class="w-full mb-4">
        <tbody>
            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke="#7de4a2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                    </svg>
                    Up:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{up}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardTextpy-1 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke="#7de4a2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                    </svg>
                    Down:
                </td>
                <td class="text-right w-1/2 text-itemCardTextpy-1 text-xs">{{down}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardTextpt-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke="#7de4a2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Pending:
                </td>
                <td class="text-right w-1/2 text-itemCardTextpt-2 text-xs">{{pending}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardTextpt-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke="#7de4a2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path stroke="#7de4a2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Maintenance:
                </td>
                <td class="text-right w-1/2 text-itemCardTextpt-2 text-xs">{{maintenance}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardTextpt-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke="#7de4a2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Unknown:
                </td>
                <td class="text-right w-1/2 text-itemCardTextpt-2 text-xs">{{unknown}}</td>
            </tr>
        </tbody>
    </table>
    <a href="{{kumaLink}}" target="_blank" class="w-full bg-blue-500 text-xs text-secondaryLightText p-2 rounded-full hover:bg-blue-700 text-center">
        Open Uptime Kuma
    </a>
</div>