<div class="flex flex-col justify-center items-center h-full w-full p-2">

    <img class="w-16 h-16" src="https://cdn.jsdelivr.net/gh/selfhst/icons/png/bazarr.png" />

    <table class="w-full mb-4">
        <tbody>
            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <!-- Cloud icon -->
                        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
                    </svg>
                    Episodes:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{episodes}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <!-- Film icon -->
                        <path d="M19 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"></path>
                        <path d="M7 2v20"></path>
                        <path d="M17 2v20"></path>
                        <path d="M2 12h20"></path>
                        <path d="M2 7h5"></path>
                        <path d="M2 17h5"></path>
                        <path d="M17 17h5"></path>
                        <path d="M17 7h5"></path>
                    </svg>
                    Movies:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{movies}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardTextpy-1 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <!-- Navigation icon -->
                        <path d="m3 11 19-9-9 19-2-8-8-2z"></path>
                    </svg>
                    Providers:
                </td>
                <td class="text-right w-1/2 text-itemCardTextpy-1 text-xs">{{providers}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardTextpt-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <!-- Settings icon -->
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    Announcements:
                </td>
                <td class="text-right w-1/2 text-itemCardTextpt-2 text-xs">{{announcements}}</td>
            </tr>
        </tbody>
    </table>
    <a href="{{bazarrLink}}" target="_blank" class="w-full bg-blue-500 text-xs text-secondaryLightText p-2 rounded-full hover:bg-blue-700 text-center">
        Open Bazarr
    </a>
</div>