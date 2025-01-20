<div class="flex flex-col justify-center items-center h-full w-full p-2">

    <img class="w-16 h-16" src="https://cdn.jsdelivr.net/gh/selfhst/icons/svg/heimdall.svg" />

    <table class="w-full mb-4">
        <tbody>

            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill="#FFBF00" d="M6 6h12v12H6z"/>
                    </svg>
                    Items:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{items}}</td>
            </tr>

            <tr>
                <td class="text-left w-1/2 text-itemCardText py-1 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill="#FFBF00" d="M6 6h12v12H6z"/>
                    </svg>
                    Users:
                </td>
                <td class="text-right w-1/2 text-itemCardText py-1 text-xs">{{users}}</td>
            </tr>
            
        </tbody>
    </table>
    
    <a href="{{appUrl}}" target="_blank" class="w-full bg-buttonGeneric text-xs text-secondaryLightText p-2 rounded-full hover:bg-buttonGenericDark mb-2 text-center">
        Open Heimdall
    </a>
</div>