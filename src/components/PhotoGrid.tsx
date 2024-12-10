/* eslint-disable @next/next/no-img-element */
"use client"

import React from "react"
import Masonry from "react-masonry-css"

interface PhotoGridProps {
  urls: string[]
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ urls }) => {
  const breakpointColumns = {
    default: 4,
    500: 1,
  }

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="masonry-grid"
      columnClassName="masonry-grid-column"
    >
      {urls.map((url, index) => (
        <a href={url} key={index}>
          <img
            key={index}
            src={url + "?w=500"}
            alt={`Grid item ${index + 1}`}
            className="masonry-grid-item"
            loading="lazy"
            width={500}
          />
        </a>
      ))}
    </Masonry>
  )
}

export default PhotoGrid
