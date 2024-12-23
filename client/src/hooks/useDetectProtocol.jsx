import { useState, useEffect } from 'react';

const useDetectProtocol = () => {
  const [protocol, setProtocol] = useState('');

  useEffect(() => {
    // Get the protocol from the window.location object
    const protocol = window.location.protocol?.replace(':', '') || 'http';

    // Update the state with the protocol
    setProtocol(() => protocol);
  }, []); // Empty dependency array ensures this effect runs once on mount

  return protocol;
};

export default useDetectProtocol;