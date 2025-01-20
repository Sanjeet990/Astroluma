<div class="flex flex-col justify-center items-center h-full w-full p-2">
    <img class="w-16 h-16" src="https://cdn.jsdelivr.net/gh/selfhst/icons/svg/truenas-scale.svg" />
    <table class="w-full mb-4">
        <tbody>
            <tr>
                <td class="text-left w-1/2 text-itemCardText pt-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="#00aaff" viewBox="0 0 24 24">
                        <path d="M21 14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v7H5c-1.1 0-2 .9-2 2v5h18v-5zM8 5h10v7H8V5zm11 12H5v-3h14v3z"/>
                        <path d="M15 13h2v2h-2zm-4 0h2v2h-2zm-4 0h2v2H7z"/>
                    </svg>
                    Uptimes:
                </td>
                <td class="text-right w-1/2 text-itemCardText pt-2 text-xs">{{uptimes}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardText pt-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="#00aaff" viewBox="0 0 24 24">
                        <path d="M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z"/>
                    </svg>
                    Cores:
                </td>
                <td class="text-right w-1/2 text-itemCardText pt-2 text-xs">{{cores}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardText pt-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="#00aaff" viewBox="0 0 24 24">
                        <path d="M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z"/>
                    </svg>
                    Memory:
                </td>
                <td class="text-right w-1/2 text-itemCardText pt-2 text-xs">{{memory}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardText pt-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="#00aaff" viewBox="0 0 24 24">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
                    </svg>
                    Alerts:
                </td>
                <td class="text-right w-1/2 text-itemCardText pt-2 text-xs">{{alerts}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardText pt-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="#00aaff" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                    Critical:
                </td>
                <td class="text-right w-1/2 text-itemCardText pt-2 text-xs">{{critical}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardText pt-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="#00aaff" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                    Info:
                </td>
                <td class="text-right w-1/2 text-itemCardText pt-2 text-xs">{{info}}</td>
            </tr>
        </tbody>
    </table>
    
    <a href="{{nasLink}}" target="_blank" class="w-full bg-buttonGeneric text-xs text-secondaryLightText p-2 rounded-full hover:bg-buttonGenericDark mb-2 text-center">
        Open TrueNAS
    </a>
</div>