import { useEffect, useRef } from 'react';
import { useAppStore } from '@hooks/useAppStore';

const FRAME_COUNT = 465;

export default function FrameSequenceCanvas() {
  const canvasRef = useRef(null);
  const frames = useRef([]);

  useEffect(() => {
    let isCancelled = false;

    // Initialize image objects but don't set src yet (to avoid 465 concurrent requests)
    for (let i = 1; i <= FRAME_COUNT; i++) {
      if (!frames.current[i - 1]) {
        frames.current[i - 1] = new Image();
      }
    }

    // Sequential background preloader
    let preloadIndex = 1;
    const loadNext = () => {
      if (preloadIndex > FRAME_COUNT || isCancelled) return;
      const currentIndex = preloadIndex;
      const img = frames.current[currentIndex - 1];
      
      // If already triggered by user scroll, skip preloading it and move to next
      if (img.src) {
        preloadIndex++;
        loadNext();
        return;
      }
      
      const paddedIndex = currentIndex.toString().padStart(5, '0');
      
      img.onload = () => {
        if (isCancelled) return;
        // Draw the first frame immediately once it loads
        if (currentIndex === 1 && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d', { alpha: false });
          canvasRef.current.width = img.width || 1920;
          canvasRef.current.height = img.height || 1080;
          ctx.drawImage(img, 0, 0);
        }
        preloadIndex++;
        loadNext();
      };
      
      img.onerror = () => {
        if (isCancelled) return;
        preloadIndex++;
        loadNext();
      };
      
      img.src = `/frames/frames_30fps/frame_${paddedIndex}.png`;
    };

    loadNext();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const unsub = useAppStore.subscribe((state, prevState) => {
      if (prevState && state.scrollProgress === prevState.scrollProgress) return;
      
      const progress = state.scrollProgress;
      if (!canvasRef.current) return;
      
      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.floor(progress * FRAME_COUNT)
      );
      
      const img = frames.current[frameIndex];
      if (!img) return;

      const drawImg = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d', { alpha: false });
        if (canvasRef.current.width !== img.width && img.width > 0) {
          canvasRef.current.width = img.width;
          canvasRef.current.height = img.height;
        }
        ctx.drawImage(img, 0, 0);
      };

      if (img.complete && img.naturalWidth > 0) {
        drawImg();
      } else if (!img.src) {
        // Not started loading yet, trigger it now
        const paddedIndex = (frameIndex + 1).toString().padStart(5, '0');
        
        // We override onload temporarily to draw this specific frame immediately when it finishes
        // We don't want to break the preloader's onload entirely, but since the preloader skips
        // frames with .src already set, the preloader won't touch this img anyway!
        img.onload = () => {
            drawImg();
        };
        
        img.src = `/frames/frames_30fps/frame_${paddedIndex}.png`;
      }
    });
    
    return unsub;
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full object-cover"
      style={{ backgroundColor: '#000' }}
    />
  );
}
