// events.js
import mitt from 'mitt';

const emitter = mitt();

export const PAGE_BOTTOM_EVENT = 'PAGE_BOTTOM_EVENT';
export const RELOAD_CODE_SNIPPET = 'RELOAD_CODE_SNIPPET';
export const RELOAD_INSTALLED_APPS = 'RELOAD_INSTALLED_APPS';

export default emitter;
