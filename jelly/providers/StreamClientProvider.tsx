import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { ReactNode, useState, useEffect } from 'react';
  
  const apiKey = process.env.NEXT_PUBLIC_STEAM_API_KEY;

const SteamVideoProvider = ({ children }: { children: ReactNode }) => {
    const [videoClient, setVideoClient] = useState<StreamVideoClient>();
    const { user, isLoaded} = useUser();

useEffect(() => { 
    if(!isLoaded || !user) return;
    if(!apiKey) throw new Error('Steam API key missing');

    const client = new StreamVideoClient({
        apiKey,
        user:{ 
            id: user?.id, 
            name: user?.name || user?.id,
        image: user?.imageUrl,
    },
    tokenProvider
});

 }, [user, isLoaded]);

 return(

      <StreamVideo client={VideoClient}>
      </StreamVideo>
 );

};

  export default SteamVideoProvider;