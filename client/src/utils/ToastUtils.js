import { toast } from 'react-toastify';

const makeToast = (type, message) => {

    console.log(message);

    if (!message || message === "undefined" || message === "null" || message === "") return;

    const customId = `t: ${type}, m: ${message}`;

    if (type === 'error') {
        toast.error(message, { toastId: customId });
    } else if (type === 'info') {
        toast.info(message, { toastId: customId });
    } else if (type === 'warning') {
        toast.warning(message, { toastId: customId });
    } else {
        toast.success(message, { toastId: customId });
    }
};

export default makeToast;