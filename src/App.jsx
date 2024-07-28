import React, { useRef, useEffect, useState } from 'react';

function getCurrentFrame(index) {
  return `/img/${index.toString().padStart(4, '0')}.png`;
}

const ImageCanvas = ({ scrollHeight, numFrames, width, height }) => {
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [frameIndex, setFrameIndex] = useState(0);

  // Load images
  function preloadImages() {
    const newImages = [];
    let loadedImages = 0;

    for (let i = 1; i <= numFrames; i++) {
      const imgSrc = getCurrentFrame(i);
      const img = new Image();

      img.onload = () => {
        newImages[i - 1] = img;
        loadedImages += 1;

        // Check if all images are loaded
        if (loadedImages === numFrames) {
          setImages(newImages);
        }
      };

      img.onerror = (error) => {
        console.error(`Failed to load image: ${imgSrc}`, error);
      };

      img.src = imgSrc;
    }
  }

  // Handle scroll events
  const handleScroll = () => {
    const scrollFraction = window.scrollY / (scrollHeight - window.innerHeight);
    const index = Math.min(
      numFrames - 1,
      Math.ceil(scrollFraction * numFrames)
    );

    if (index < 0 || index >= numFrames) {
      return;
    }

    setFrameIndex(index);
  };

  // Set up canvas
  const renderCanvas = () => {
    const context = canvasRef.current.getContext('2d');
    context.canvas.width = width;
    context.canvas.height = height;
  };

  // Render images to canvas
  useEffect(() => {
    preloadImages();
    renderCanvas();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || images.length < numFrames) {
      return;
    }

    const context = canvasRef.current.getContext('2d');
    let requestId;

    const render = () => {
      context.clearRect(0, 0, width, height);
      const img = images[frameIndex];
      if (img && img.complete) {
        context.drawImage(img, 0, 0, width, height);
      }
      requestId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(requestId);
  }, [frameIndex, images, width, height]);

  return (
    <div style={{ height: scrollHeight }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

function App() {
  return (
    <div className='hello'>
      <ImageCanvas className='canvas' scrollHeight={5000} numFrames={67} width={800} height={600} />
    </div>
  );
}

export default App;
