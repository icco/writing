/* eslint-disable @next/next/no-img-element */
"use client"

import "react-photo-album/masonry.css"

import React from "react"
import { MasonryPhotoAlbum } from "react-photo-album"

interface PhotoGridProps {
  urls: string[]
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ urls }) => {
  const photos = urls.map((url) => ({
    src: url,
    width: 400,
    height: 300,
  }))

  return <MasonryPhotoAlbum photos={photos} />
}

export default PhotoGrid
