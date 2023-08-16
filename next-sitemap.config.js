/** @type {import('next-sitemap').IConfig} */
module.exports = {
  autoLastmod: false,
  siteUrl: process.env.DOMAIN || 'https://writing.natwelch.com',
  generateRobotsTxt: true,
  changefreq: 'monthly',
}
