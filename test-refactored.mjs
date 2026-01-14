import { allPosts } from './.contentlayer/generated/index.mjs';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { Feed } from 'feed';
import { format, isFuture, compareDesc } from 'date-fns';

async function markdownToHtml(markdown) {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);
  return result.toString();
}

function createFeedItem(post, content) {
  return {
    title: post.title,
    link: `https://writing.natwelch.com/post/${post.id}`,
    date: new Date(post.datetime),
    category: post.tags.map((t) => ({ name: t, term: t })),
    author: [
      {
        name: "Nat Welch",
        email: "nat@natwelch.com",
        link: "https://natwelch.com",
      },
    ],
    content,
  };
}

async function generateFeed(posts) {
  const feed = new Feed({
    id: "https://writing.natwelch.com/",
    title: "Nat? Nat. Nat!",
    favicon: "https://writing.natwelch.com/favicon.ico",
    description: "Nat Welch's blog about random stuff.",
    link: "https://writing.natwelch.com/",
    feedLinks: {
      atom: "https://writing.natwelch.com/feed.atom",
      rss: "https://writing.natwelch.com/feed.rss",
    },
    author: {
      name: "Nat Welch",
      email: "nat@natwelch.com",
      link: "https://natwelch.com",
    },
    language: "en",
    copyright: `2011 - ${format(new Date(), "yyyy")} Nat Welch. All rights reserved.`,
  });

  for (const p of posts) {
    try {
      const htmlContent = await markdownToHtml(p.body.raw);
      feed.addItem(createFeedItem(p, htmlContent));
    } catch (err) {
      console.error(`Error processing post ${p.id}:`, err);
      // Add post with fallback content on error
      const fallbackContent = `<p>Error rendering post content. Please visit <a href="https://writing.natwelch.com/post/${p.id}">the full post</a> to read it.</p>`;
      feed.addItem(createFeedItem(p, fallbackContent));
    }
  }

  return feed;
}

async function test() {
  try {
    const posts = allPosts
      .filter(post => !post.draft)
      .filter(post => !isFuture(new Date(post.datetime)))
      .sort((a, b) => compareDesc(new Date(a.datetime), new Date(b.datetime)))
      .slice(0, 5);
    
    console.log(`Testing with ${posts.length} posts...`);
    const feed = await generateFeed(posts);
    
    const rssContent = feed.rss2();
    const atomContent = feed.atom1();
    
    const checks = [
      rssContent.includes('<p>') && rssContent.includes('</p>'),
      atomContent.includes('<p>') && atomContent.includes('</p>'),
      !rssContent.includes('Due to a rendering bug'),
      !atomContent.includes('Due to a rendering bug'),
    ];
    
    if (checks.every(c => c)) {
      console.log('✅ Refactored code works correctly!');
    } else {
      console.error('❌ Tests failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

test();
