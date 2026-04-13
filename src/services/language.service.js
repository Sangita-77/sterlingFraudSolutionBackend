import geoip from "geoip-lite";

// Map countries to languages
const countryLanguageMap = {
  // French
  FR: "fr",
  BE: "fr",
  CH: "fr",
  CA: "fr",
  LU: "fr",
  MC: "fr",
  CI: "fr",
  SN: "fr",
  BJ: "fr",
  BF: "fr",
  
  // English
  US: "en",
  GB: "en",
  AU: "en",
  NZ: "en",
  IE: "en",
  CA: "en",
  IN: "en",
  SG: "en",
  
  // German
  DE: "de",
  AT: "de",
  CH: "de",
  LU: "de",
  
  // Italian
  IT: "it",
  CH: "it",
};

export const detectLanguageByIP = (ipAddress) => {
  try {
    // Handle IPv4 and IPv6 addresses
    const geo = geoip.lookup(ipAddress);

    if (geo && geo.country) {
      const detectedLanguage = countryLanguageMap[geo.country] || "en";
      return {
        language: detectedLanguage,
        country: geo.country,
        city: geo.city,
        timezone: geo.timezone,
      };
    }

    // Default to English if geolocation fails
    return {
      language: "en",
      country: null,
      city: null,
      timezone: null,
    };
  } catch (error) {
    console.error("Error detecting language by IP:", error);
    return {
      language: "en",
      country: null,
      city: null,
      timezone: null,
    };
  }
};

// Fetch public IP from external service
export const getPublicIP = async () => {
  const services = [
    "https://api.ipify.org?format=json",
    "https://checkip.amazonaws.com",
    "https://icanhazip.com",
  ];

  for (const service of services) {
    try {
      const response = await fetch(service);
      if (!response.ok) continue;

      if (service.includes("ipify")) {
        const data = await response.json();
        return data.ip;
      } else {
        const ip = await response.text();
        return ip.trim();
      }
    } catch (error) {
      console.error(`Error fetching public IP from ${service}:`, error.message);
      continue;
    }
  }

  return null;
};

export const getSupportedLanguages = () => {
  return [
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
  ];
};

export const isValidLanguage = (language) => {
  const validLanguages = ["en", "fr", "de", "it"];
  return validLanguages.includes(language);
};
