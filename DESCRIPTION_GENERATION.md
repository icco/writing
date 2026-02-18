# Generate Post Descriptions Script

This script uses Google's Gemini AI to automatically generate meta descriptions for blog posts that don't already have an `excerpt` field in their frontmatter.

## Setup

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

2. Set the API key as an environment variable:
   ```bash
   export GEMINI_API_KEY="your-api-key-here"
   ```

## Usage

### Generate description for a specific post:
```bash
node generate-descriptions.js 100
```

### Generate descriptions for all posts without excerpts:
```bash
node generate-descriptions.js
```

## What it does

1. Reads the post content
2. Sends it to Gemini with a prompt to generate a concise meta description (max 160 characters)
3. Updates the post's frontmatter with the generated description in the `excerpt` field
4. The `excerpt` field is then used by the site for:
   - OpenGraph description tags for social media previews
   - Meta description tags for SEO

## Notes

- Posts that already have an `excerpt` will be skipped
- The script includes a 1-second delay between API calls to avoid rate limiting
- Descriptions are automatically truncated to 160 characters for optimal social media display
- If no excerpt is provided, the site will automatically generate a summary from the first paragraph of the post content
