import { Header, Footer } from "../index.js";

export function PageLayout(props) {
  const children = props.children;

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-10 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
