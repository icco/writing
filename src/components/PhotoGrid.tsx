import React from "react"

interface PhotoGridProps {
  urls: string[]
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ urls }) => {
  return (
    <div className="not-prose columns-2 gap-2 md:columns-3">
      {urls.map((url, index) => (
        <a href={url} key={index}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url + "?w=500"}
            alt={`Grid item ${index + 1}`}
            width={500}
            className="my-2 w-full"
          />
        </a>
      ))}
    </div>
  )
}

export default PhotoGrid
