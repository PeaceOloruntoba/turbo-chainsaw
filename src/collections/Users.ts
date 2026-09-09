import type { CollectionConfig } from 'payload'

/**
 * Internal Nigeria Lex team accounts (editors, researchers, administrators).
 * This is the collection Payload's built-in auth (HTTP-only cookie JWT) is
 * attached to. Subscribers (public newsletter list) are a separate,
 * non-authenticated collection — see Subscribers.ts.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 8, // 8 hours
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
  },
  access: {
    // Only logged-in Nigeria Lex staff can see the user list at all.
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Researcher', value: 'researcher' },
      ],
      admin: {
        description: 'Controls what this team member can publish and change.',
      },
    },
  ],
}
