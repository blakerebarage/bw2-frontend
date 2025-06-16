import { useEffect, useState } from 'react';

const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    browser: '',
    os: '',
    ip: '',
    location: {
      city: '',
      country: ''
    }
  });
  useEffect(() => {
    const getDeviceInfo = async () => {
      // Get browser and OS info
      const userAgent = navigator.userAgent;
      const browser = userAgent.includes('Chrome') ? 'Chrome' :
                     userAgent.includes('Firefox') ? 'Firefox' :
                     userAgent.includes('Safari') ? 'Safari' :
                     userAgent.includes('Edge') ? 'Edge' : 'Unknown';
      
      // Get accurate OS info
      let os = 'Unknown';
      const winVersion = userAgent.match(/Windows NT (\d+\.\d+)/);
      
      if (winVersion) {
        const version = winVersion[1];
        switch (version) {
          case '10.0':
            if (userAgent.includes('Windows NT 10.0; Win64; x64')) {
              os = 'Windows 10/11';
            } else {
              os = 'Windows 10';
            }
            break;
          case '6.3':
            os = 'Windows 8.1';
            break;
          case '6.2':
            os = 'Windows 8';
            break;
          case '6.1':
            os = 'Windows 7';
            break;
          case '6.0':
            os = 'Windows Vista';
            break;
          case '5.1':
            os = 'Windows XP';
            break;
          default:
            os = `Windows ${version}`;
        }
      } else if (userAgent.includes('Mac')) {
        os = 'MacOS';
      } else if (userAgent.includes('Linux')) {
        os = 'Linux';
      }

      // Get IP and location info
      try {
        // First get IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        
        // Then get location data
        const locationResponse = await fetch(`http://ip-api.com/json/${ipData.ip}`);
        const locationData = await locationResponse.json();
        
        setDeviceInfo({
          browser,
          os,
          ip: ipData.ip,
          location: {
            city: locationData.city || 'Unknown',
            country: locationData.countryCode || 'Unknown'
          }
        });
      } catch (error) {
        console.error('Error fetching IP and location:', error);
        setDeviceInfo(prev => ({
          ...prev,
          browser,
          os
        }));
      }
    };

    getDeviceInfo();
  }, []);

  return deviceInfo;
};

export default useDeviceInfo; 