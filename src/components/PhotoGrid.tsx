/* eslint-disable @next/next/no-img-element */
"use client"

import "react-photo-album/masonry.css"

import React from "react"

interface PhotoGridProps {
  urls: string[]
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ urls }) => {
  return (
    <div className="columns-2 md:columns-3 gap-2 not-prose">
      {urls.map((url, index) => (
        <a href={url} key={index}>
          <img
            src={url + "?w=500"}
            alt={`Grid item ${index + 1}`}
            width={500}
            className="w-full my-2"
          />
        </a>
      ))}
    </div>
  )
}

export default PhotoGrid
