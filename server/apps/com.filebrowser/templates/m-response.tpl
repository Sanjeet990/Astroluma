<div class="flex flex-col justify-center items-center h-full w-full p-2">

    <img class="w-16 h-16" src="https://cdn.jsdelivr.net/gh/selfhst/icons/svg/file-browser.svg" />

    <table class="w-full mb-4">
        <tbody>
            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill="#2196F3" d="M6 6h12v12H6z"/>
                    </svg>
                    Total:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{total}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardTextpy-1 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill="#2196F3" d="M6 6h12v12H6z"/>
                    </svg>
                    Used:
                </td>
                <td class="text-right w-1/2 text-itemCardTextpy-1 text-xs">{{used}}</td>
            </tr>
        </tbody>
    </table>
    <a href="{{filebrowserUrl}}" target="_blank" class="w-full bg-blue-500 text-xs text-secondaryLightText p-2 rounded-full hover:bg-blue-700 text-center">
        Open Filebrowser
    </a>
</div>