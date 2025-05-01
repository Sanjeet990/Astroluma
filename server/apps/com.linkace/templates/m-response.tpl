<div class="flex flex-col justify-center items-center h-full w-full p-2">

    <img class="w-16 h-16" src="https://cdn.jsdelivr.net/gh/selfhst/icons/svg/linkace.svg" />

    <table class="w-full mb-4">
        <tbody>
            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke="#2196F3" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path stroke="#2196F3" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    Links:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{linksCount}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardTextpy-1 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke="#2196F3" d="M4 9h16" />
                        <path stroke="#2196F3" d="M4 15h16" />
                        <path stroke="#2196F3" d="M10 3L8 21" />
                        <path stroke="#2196F3" d="M16 3l-2 18" />
                    </svg>
                    Tags:
                </td>
                <td class="text-right w-1/2 text-itemCardTextpy-1 text-xs">{{tagsCount}}</td>
            </tr>
        </tbody>
    </table>
    <a href="{{linkaceLink}}" target="_blank" class="w-full bg-blue-500 text-xs text-secondaryLightText p-2 rounded-full hover:bg-blue-700 text-center">
        Open Linkace
    </a>
</div>