<div class="flex flex-col justify-center items-center h-full w-full p-2">
    <img class="w-16 h-16" src="https://cdn.jsdelivr.net/gh/selfhst/icons/svg/nextcloud.svg" />
    
    <table class="w-full mb-4">
        <tbody>

            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00aaff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Free:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{free}}</td>
            </tr>

            <tr>
                <td class="text-left w-1/2 text-itemCardText py-1 text-xs flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00aaff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                    Used:
                </td>
                <td class="text-right w-1/2 text-itemCardText py-1 text-xs">{{used}}</td>
            </tr>
            
            <tr>
                <td class="text-left w-1/2 text-itemCardText pt-2 text-xs flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00aaff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <path d="M21 12H3"/>
                        <path d="M12 3v18"/>
                    </svg>
                    Total:
                </td>
                <td class="text-right w-1/2 text-itemCardText pt-2 text-xs">{{total}}</td>
            </tr>

            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00aaff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                    Usage:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{usage}} %</td>
            </tr>
            
        </tbody>
    </table>
    
    <a href="{{connectionUrl}}" target="_blank" class="w-full bg-buttonGeneric text-xs text-secondaryLightText p-2 rounded-full hover:bg-buttonGenericDark mb-2 text-center">
        Open NextCloud
    </a>
</div>