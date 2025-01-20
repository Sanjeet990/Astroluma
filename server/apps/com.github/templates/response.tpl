<div class="w-full bg-secondaryDark p-2 rounded-lg shadow-lg">
    <table class="w-full">
        <tbody>
            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill="#0366d6" d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.61-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0112 6.8c.85.004 1.71.11 2.51.32 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z"/>
                    </svg>
                    PRs:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{numPR}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardText py-1 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill="#0366d6" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-6h2v6zm0-8h-2V7h2v4z"/>
                    </svg>
                    Last PR:
                </td>
                <td class="text-right w-1/2 text-itemCardText py-1 text-xs">{{lastPR}}</td>
            </tr>
            <tr>
                <td class="text-left w-1/2 text-itemCardText pt-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill="#0366d6" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    Author:
                </td>
                <td class="text-right w-1/2 text-itemCardText pt-2 text-xs">{{author}}</td>
            </tr>
        </tbody>
    </table>
</div>