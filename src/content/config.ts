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
