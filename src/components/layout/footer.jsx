export default function Footer() {
  const githubUrl = "https://github.com/didac-odena";
  const linkedinUrl = "https://es.linkedin.com/in/d%C3%ADdac-%C3%B2dena";

  return (
    <footer className="w-full border-t z-15 border-border bg-slate-100 text-ink">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-3 px-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        
          <span className="text-muted">Orixium Web</span>
        

        <div className="flex items-center gap-3">
        <span className="text-sm text-muted"> Built by Dídac Ódena</span>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="text-muted transition-colors hover:text-accent"
            aria-label="GitHub profile"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.58 2 12.253c0 4.53 2.865 8.375 6.839 9.73.5.095.682-.22.682-.49 0-.243-.009-.888-.014-1.742-2.782.62-3.369-1.375-3.369-1.375-.454-1.186-1.11-1.503-1.11-1.503-.908-.64.069-.627.069-.627 1.004.072 1.532 1.06 1.532 1.06.892 1.565 2.341 1.114 2.91.852.091-.664.35-1.115.636-1.372-2.221-.26-4.555-1.143-4.555-5.085 0-1.123.39-2.04 1.029-2.758-.103-.259-.446-1.306.098-2.724 0 0 .84-.276 2.75 1.053A9.3 9.3 0 0 1 12 7.07c.85.004 1.705.119 2.504.35 1.909-1.33 2.748-1.054 2.748-1.054.545 1.418.202 2.465.1 2.724.64.718 1.028 1.635 1.028 2.758 0 3.952-2.338 4.822-4.566 5.077.36.318.68.946.68 1.907 0 1.376-.012 2.484-.012 2.822 0 .273.18.59.688.49C19.137 20.624 22 16.78 22 12.253 22 6.58 17.523 2 12 2Z" />
            </svg>
          </a>

          <a
            href={linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="text-muted transition-colors hover:text-accent"
            aria-label="LinkedIn profile"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
              <path d="M20.45 20.45h-3.554v-5.569c0-1.328-.027-3.036-1.85-3.036-1.85 0-2.134 1.444-2.134 2.937v5.668H9.36V9h3.414v1.56h.047c.476-.9 1.637-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.455v6.285ZM5.34 7.433a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126ZM7.12 20.45H3.56V9H7.12v11.45ZM22.225 0H1.771C.792 0 0 .774 0 1.727v20.545C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.273V1.727C24 .774 23.2 0 22.222 0h.003Z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
