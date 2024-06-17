import { currentUser } from "@clerk/nextjs/server"

export default async function Home() {
  const user = await currentUser()
  return (
    <main className="flex min-h-screen flex-col justify-between p-12">
      hello {user?.fullName || "guest"}!
    </main>
  )
}
