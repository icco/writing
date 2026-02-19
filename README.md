# writing

A static react frontend for my blog.

You can see screenshots of my inspiration in the [inspiration folder](https://github.com/icco/writing/tree/main/public/images/inspiration)

This latest incaration is based off of static compiling MDX files.

## Features

- **Social Images**: Automatically generated OpenGraph images for all posts and the home page
- **AI-Generated Descriptions**: Optional TypeScript script to generate meta descriptions using Google Gemini API
- **Automatic Summaries**: Posts without explicit summaries get automatic summaries from their first paragraph

### Generating Descriptions with Gemini

To generate AI-powered descriptions for your posts:

```bash
export GEMINI_API_KEY="your-api-key"
yarn generate-descriptions        # All posts without summaries
yarn generate-descriptions 123    # Specific post
```
