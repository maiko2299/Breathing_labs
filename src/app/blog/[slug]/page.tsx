import Link from 'next/link';
import Markdown from 'react-markdown';
import { getPostData, getSortedPostsData } from '../../../lib/posts';

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const postData = getPostData(slug);

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans antialiased">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        
        <Link href="/" className="inline-flex items-center text-[var(--app-text-muted)] hover:text-[var(--app-accent)] transition-colors mb-12">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to home
        </Link>

        <article className="prose prose-invert prose-lg max-w-none">
          <header className="mb-12 border-b border-white/10 pb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{postData.title}</h1>
            <p className="text-[var(--app-text-muted)] text-lg">{postData.date}</p>
          </header>
          
          <div className="leading-relaxed text-gray-300 space-y-6">
            <Markdown>{postData.content}</Markdown>
          </div>
        </article>

      </div>
    </main>
  );
}
