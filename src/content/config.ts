import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
    author: z.string().default('salarycalc team'),
    image: z.string().optional(),
    takeaways: z.array(z.string()).default([]),
  }),
});

// Static informational pages (About, Contact, Terms, Privacy, Methodology,
// etc). Same idea as `blog`: drop a .md file in src/content/pages/ and it
// renders through StaticPage.astro automatically — see the route files in
// src/pages/*/index.astro for how each one is wired up.
const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    heroLead: z.string().optional(),
    image: z.string().optional(),
    takeaways: z.array(z.string()).default([]),
  }),
});

export const collections = { blog, pages };
