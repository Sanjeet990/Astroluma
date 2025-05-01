<div class="w-full bg-secondaryDark p-2 rounded-lg shadow-lg flex">
    <table class="w-1/2 mr-4 flex-1">
        <tbody>
            <!-- Server -->
            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill="#d25200" d="M19 18H6c-2.21 0-4-1.79-4-4 0-2.21 1.79-4 4-4 .34 0 .67.04 1 .1C8.1 7.84 9.97 6 12 6c2.76 0 5 2.24 5 5 0 .34-.04.67-.1 1H19c1.66 0 3 1.34 3 3s-1.34 3-3 3z"/>
                    </svg>
                    Server:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{node}}</td>
            </tr>
            <!-- CPU -->
            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill="#d25200" d="M12 2a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 16a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1zm10-6a1 1 0 0 1-1 1h-2a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1zM4 12a1 1 0 0 1-1 1H1a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1zm12.071-7.071a1 1 0 0 1 1.414 0l1.414 1.414a1 1 0 0 1-1.414 1.414L16.07 6.343a1 1 0 0 1 0-1.414zm-8.485 0a1 1 0 0 1 0 1.414L6.172 7.828a1 1 0 0 1-1.414-1.414L6.343 4.93a1 1 0 0 1 1.414 0zm8.485 12.728a1 1 0 0 1 0 1.414l-1.414 1.414a1 1 0 0 1-1.414-1.414l1.414-1.414a1 1 0 0 1 1.414 0zm-8.485 0a1 1 0 0 1-1.414 0L4.93 16.07a1 1 0 0 1 1.414-1.414l1.414 1.414a1 1 0 0 1 0 1.414zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/>
                    </svg>
                    CPU:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{cpu}} %</td>
            </tr>
            <!-- Disk -->
            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill="#d25200" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-7 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3-10H8V5h7v4z"/>
                    </svg>
                    Disk:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{disk}} %</td>
            </tr>
        </tbody>
    </table>
    <table class="w-1/2 flex-1">
        <tbody>
            <!-- Status -->
            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <circle fill="#d25200" cx="12" cy="12" r="8"/>
                    </svg>
                    Status:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{status}}</td>
            </tr>
            <!-- Memory -->
            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill="#d25200" d="M3 17h2v-7H3v7zm4 0h2v-4H7v4zm4 0h2v-10h-2v10zm4 0h2v-13h-2v13zm4 0h2v-16h-2v16z"/>
                    </svg>
                    Memory:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{memory}} %</td>
            </tr>
            <!-- Uptime -->
            <tr>
            <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill="#d25200" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 11h-4V7h2v4h2z"/>
                    </svg>
                    Uptime:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{uptime}}</td>
            </tr>
        </tbody>
    </table>
</div>
