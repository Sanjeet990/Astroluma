<div class="flex flex-col justify-center items-center h-full w-full p-2">
    <svg class="w-16 h-16 mb-4" fill="currentColor" viewBox="0 0 1024 1024">
        <circle cx="512" cy="512" r="512" style="fill:#d25200"/>
        <path d="M512 497.8 342.7 311.6c6.6-6.6 14.2-11.7 22.9-15.5 8.7-3.8 18.1-5.7 28.1-5.7 10.7.1 20.4 2.2 29.3 6.3 8.9 4.1 16.6 9.8 23.1 17l65.8 71.9 65.4-71.9c6.8-7.2 14.7-12.9 23.6-17 9-4.1 18.7-6.2 29.2-6.3 10 .1 19.4 2 28.1 5.7 8.7 3.8 16.4 8.9 22.9 15.5L512 497.8m0 28.4L342.7 712.4c6.6 6.6 14.2 11.7 22.9 15.5 8.7 3.8 18.1 5.7 28.1 5.7 10.5-.1 20.2-2.2 29.2-6.3s16.9-9.8 23.6-17l65.4-71.9 65.8 71.9c6.5 7.2 14.2 12.9 23.1 17 8.9 4.1 18.6 6.2 29.3 6.3 10-.1 19.4-2 28.1-5.7 8.7-3.8 16.4-8.9 22.9-15.5L512 526.2M497.8 512 370.3 372.2c-7.4-7.9-16-14.1-25.9-18.7-9.8-4.5-20.5-6.8-31.9-6.9-11 .1-21.3 2.2-30.8 6.3-9.6 4.1-17.9 9.8-25.1 16.9L385.9 512 256.5 654.2c7.2 7.4 15.6 13.2 25.1 17.4 9.6 4.2 19.8 6.3 30.8 6.3 11.5-.1 22.2-2.4 32.1-6.9 9.9-4.5 18.5-10.8 25.7-18.7L497.8 512m28.4 0 127.5 140.3c7.2 7.9 15.8 14.1 25.7 18.7 9.9 4.5 20.6 6.8 32.1 6.9 11-.1 21.3-2.2 30.8-6.3 9.6-4.2 17.9-9.9 25.1-17.4L638.1 512l129.4-142.2c-7.2-7.2-15.6-12.8-25.1-16.9-9.6-4.1-19.8-6.2-30.8-6.3-11.4.1-22.1 2.4-31.9 6.9-9.8 4.5-18.5 10.8-25.9 18.7L526.2 512" style="fill:#fff"/>
    </svg>
    <table class="w-full mb-4">
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
    <a href="{{proxMoxLink}}" target="_blank" class="w-full bg-buttonGeneric text-xs text-secondaryLightText p-2 rounded-full hover:bg-buttonGenericDark mb-2 text-center">
        Open ProxMox
    </a>
</div>
