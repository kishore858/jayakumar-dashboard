
import React, { useState, useEffect } from 'react';
import { getFaviconUrl, extractDomain } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LogoFetcherProps {
  website: string;
  size?: number;
  className?: string;
}

const LogoFetcher: React.FC<LogoFetcherProps> = ({ 
  website, 
  size = 24,
  className = ''
}) => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchLogo = async () => {
      if (!website) {
        setLoading(false);
        setError(true);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        const domain = extractDomain(website);
        const url = getFaviconUrl(domain);
        
        // Pre-load the image to check if it loads correctly
        const img = new Image();
        img.onload = () => {
          setLogoUrl(url);
          setLoading(false);
        };
        
        img.onerror = () => {
          setError(true);
          setLoading(false);
        };
        
        img.src = url;
      } catch (err) {
        console.error('Error fetching logo:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchLogo();
  }, [website]);

  // Show loader while fetching
  if (loading) {
    return <Loader2 className={`animate-spin ${className}`} style={{ width: size, height: size }} />;
  }

  // If there was an error, show the first letter of the domain as a fallback
  if (error || !logoUrl) {
    const domain = extractDomain(website || '');
    const letter = domain ? domain.charAt(0).toUpperCase() : '?';
    
    return (
      <div 
        className={`flex items-center justify-center rounded-md bg-primary/10 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs font-bold text-primary">{letter}</span>
      </div>
    );
  }

  // Show the fetched logo
  return (
    <img 
      src={logoUrl} 
      alt={`${website} logo`}
      className={`object-contain rounded-md ${className}`}
      style={{ width: size, height: size }}
      loading="lazy"
    />
  );
};

export default LogoFetcher;
