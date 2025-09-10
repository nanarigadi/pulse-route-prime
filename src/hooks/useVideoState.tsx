
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface VideoState {
  videos: string[];
  setVideos: (videos: string[]) => void;
}

const VideoStateContext = createContext<VideoState | undefined>(undefined);

export const VideoStateProvider = ({ children }: { children: ReactNode }) => {
  const [videos, setVideos] = useState<string[]>([]);

  return (
    <VideoStateContext.Provider value={{ videos, setVideos }}>
      {children}
    </VideoStateContext.Provider>
  );
};

export const useVideoState = () => {
  const context = useContext(VideoStateContext);
  if (!context) {
    throw new Error('useVideoState must be used within a VideoStateProvider');
  }
  return context;
};
