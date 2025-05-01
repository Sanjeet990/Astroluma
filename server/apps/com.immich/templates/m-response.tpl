<div class="flex flex-col justify-center items-center h-full w-full p-2">

    <img class="w-16 h-16" src="https://cdn.jsdelivr.net/gh/selfhst/icons/svg/immich.svg" />

    <table class="w-full mb-4">
        <tbody>
            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke="#38BDF8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M4 16l4 4m0 0l4-4m-4 4V8m0 0l4 4m-4-4l-4 4m12-8V4m0 0l4 4m-4-4l-4 4"/>
                    </svg>
                    Photos:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{photos}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardTextpy-1 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke="#38BDF8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                    Videos:
                </td>
                <td class="text-right w-1/2 text-itemCardTextpy-1 text-xs">{{videos}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardTextpt-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke="#38BDF8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M20 12V8M20 20v-4M4 12a8 8 0 018-8m0 16a8 8 0 01-8-8m16 0a8 8 0 00-8-8m0 16a8 8 0 008-8"/>
                    </svg>
                    Usage:
                </td>
                <td class="text-right w-1/2 text-itemCardTextpt-2 text-xs">{{usage}}</td>
            </tr>
        </tbody>
    </table>
    <a href="{{immichUrl}}" target="_blank" class="w-full bg-blue-500 text-xs text-secondaryLightText p-2 rounded-full hover:bg-blue-700 text-center">
        Open Immich
    </a>
</div>