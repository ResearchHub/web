import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Here you can handle the sign-in process
      // For example, sync with your backend
      return true
    },
    async redirect({ url, baseUrl }) {
      return baseUrl
    },
  },
})

export { handler as GET, handler as POST } 