import Link from "next/link";
import { getSortedPostsData } from "../lib/posts";

export default function Home() {
  const allPosts = getSortedPostsData();

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans antialiased flex flex-col items-center">
      
      {/* Hero Section */}
      <section className="w-full max-w-4xl mx-auto px-6 pt-32 pb-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Find your center.<br />
          <span className="text-[var(--app-accent)]">One breath at a time.</span>
        </h1>
        <p className="text-xl md:text-2xl text-[var(--app-text-muted)] mb-12 max-w-2xl mx-auto">
          Breathing Labs is a premium, beautifully crafted breathing companion designed to help you unlock deep focus, relaxation, and euphoric states.
        </p>
        
        <Link 
          href="/breathe"
          className="inline-flex items-center justify-center px-10 py-5 text-lg font-medium text-white bg-[var(--app-accent)] rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(var(--app-accent-rgb),0.4)]"
        >
          Start Breathing Now
        </Link>
      </section>

      {/* Blog Section */}
      <section className="w-full max-w-4xl mx-auto px-6 py-20 border-t border-[var(--app-text)]/10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">The Journal</h2>
            <p className="text-[var(--app-text-muted)] text-lg">Insights on breathwork, wellness, and performance.</p>
          </div>
        </div>

        {allPosts.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10">
            <p className="text-[var(--app-text-muted)]">No journal entries yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {allPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <article className="h-full p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <p className="text-sm text-[var(--app-text-muted)] mb-3">{post.date}</p>
                  <h3 className="text-2xl font-semibold mb-3 group-hover:text-[var(--app-accent)] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-[var(--app-text-muted)] leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
      
      <footer className="w-full py-10 mt-auto text-center text-[var(--app-text-muted)] text-sm border-t border-[var(--app-text)]/10">
        © {new Date().getFullYear()} Breathing Labs. All rights reserved.
      </footer>
    </main>
  );
}
