import React from 'react';
import Masonry from 'react-masonry-css';

interface PhotoGridProps {
  urls: string[];
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ urls }) => {
  const breakpointColumns = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="masonry-grid"
      columnClassName="masonry-grid-column"
    >
      {urls.map((url, index) => (
        <img
          key={index}
          src={url}
          alt={`Grid item ${index + 1}`}
          className="masonry-grid-item"
          loading="lazy"
        />
      ))}
    </Masonry>
  );
};

export default PhotoGrid;
