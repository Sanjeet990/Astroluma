<div class="flex flex-col justify-center items-center h-full w-full p-2">
    <svg fill="#00aaff" class="w-16 h-16 mb-4" viewBox="0 0 24 24">
        <path stroke="#00aaff" stroke-width="1.5" d="M13.5 10.5h2m-4.5 0h2m-4.5 0h2m-4.5 0h2m-4.5 0h2m0.4-2h2m0.4 0h2m0.4 0h2m-2-2h2"/>
        <path fill="#00aaff" d="m22 10.5s-0.7-0.7-2.3-0.5c-0.2-1.2-1.4-1.8-1.4-1.8s-1.2 1.4-0.3 3c-0.2 0.1-0.6 0.3-1.3 0.3H3c-0.2 0.7-0.2 6 5.5 6 4.1 0 7.2-1.9 8.7-5.4 2.2 0.2 2.6-1.6 2.6-1.6"/>
    </svg>
    <table class="w-full mb-4">
        <tbody>

            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="#00aaff" viewBox="0 0 64 64">
                        <path d="M44 19.2c1.4 0 2.6-1.1 2.6-2.6 0-1.4-1.1-2.6-2.6-2.6h-1.2v-3.3c0-1.4-1.1-2.6-2.6-2.6h-1.5c-1.4 0-2.6 1.1-2.6 2.6v3.3h-7.7v-3.3c0-1.4-1.1-2.6-2.6-2.6h-1.5c-1.4 0-2.6 1.1-2.6 2.6v3.3H20.5v-3.3c0-1.4-1.1-2.6-2.6-2.6h-1.5c-1.4 0-2.6 1.1-2.6 2.6v3.3h-1.2c-1.4 0-2.6 1.1-2.6 2.6s1.1 2.6 2.6 2.6h1.2v3.3c0 1.4 1.1 2.6 2.6 2.6h1.5c1.4 0 2.6-1.1 2.6-2.6v-3.3h7.7v3.3c0 1.4 1.1 2.6 2.6 2.6h1.5c1.4 0 2.6-1.1 2.6-2.6v-3.3h1.2zM32 12c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 16c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zM50 32c-3 0-5.7-1.2-7.6-3.1-1.9 1.9-4.6 3.1-7.6 3.1-6.1 0-11-4.9-11-11 0-2.6 1.9-5.5 5-7 1.5-1 3.4-1.7 5.6-1.7 5.5 0 10 4.5 10 10 0 2.4-1.3 4.8-3.6 6.1-1.7 1-3.6 1.7-5.7 1.7zm-4.2-9.3c-1.4.4-2.8.8-4.2.8-2.2 0-4.2-.7-6-1.9-1.8-1.1-3.1-2.7-3.1-5.1 0-2.9 2.1-5.5 5-6.4 1.2-.4 2.4-.6 3.7-.6 4.4 0 8 3.6 8 8s-3.6 8-8 8c-1.4 0-2.8-.4-4.1-.9zM18 49.5c-5.2 0-10-2.1-13.5-5.5C2.1 43.5 0 38.6 0 34h16v15.5c0 2.6 2.4 5 5 5h17.4c1.3 0 2.5-.5 3.5-1.5l2.5-2.5c1-1 1.5-2.2 1.5-3.5V32h16c0 4.6-2.1 9.5-4.5 12.5C28.8 48.7 23.4 49.5 18 49.5z" />
                    </svg>
                    Containers:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{containers}}</td>
            </tr>

            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill="#00aaff" d="M8 5v14l11-7z"/>
                    </svg>
                    Running:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{containersRunning}}</td>
            </tr>
            
            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill="#00aaff" d="M6 6h12v12H6z"/>
                    </svg>
                    Stopped:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{containersStopped}}</td>
            </tr>

            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill="#00aaff" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm0-10a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm0 4a2 2 0 1 1 2-2 2 2 0 0 1-2 2z"/>
                        <path fill="#ffffff" opacity="0.3" d="M12 4a8 8 0 0 1 0 16 8 8 0 0 1 0-16zm0 2a6 6 0 0 0 0 12 6 6 0 0 0 0-12z"/>
                    </svg>
                    Images:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{images}}</td>
            </tr>
            
            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill="#00aaff" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                    Paused:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{containersPaused}}</td>
            </tr>
            
            <tr>
                <td class="text-left w-1/2 text-itemCardText pb-2 text-xs flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fill="#00aaff" d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.66-.22.66-.48 0-.24-.01-.87-.01-1.71-2.78.61-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85.004 1.71.11 2.51.32 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.16.58.67.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z"/>
                    </svg>
                    Version:
                </td>
                <td class="text-right w-1/2 text-itemCardText pb-2 text-xs">{{version}}</td>
            </tr>
        </tbody>
    </table>
    
    <a href="{{portainerLink}}" target="_blank" class="w-full bg-buttonGeneric text-xs text-secondaryLightText p-2 rounded-full hover:bg-buttonGenericDark mb-2 text-center">
        Open Portainer
    </a>
</div>