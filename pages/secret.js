import React from 'react'
import securePage from '../lib/securePage'

const Secret = ({ loggedUser }) => (
  <div>
    Hi <strong>{loggedUser.email}</strong>. This is a super secure page! Try loading this page again using the incognito/private mode of your browser.
  </div>
)

export default securePage(Secret)
