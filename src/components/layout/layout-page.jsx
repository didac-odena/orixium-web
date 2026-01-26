import Header from "./header";
import Footer from "./footer";

export default function PageLayout({ children }) {

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-screen-2xl px-6 py-2 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
