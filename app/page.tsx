import Image from "next/image";
import ContactForm from "./components/ContactForm";

export default function Home() {
  return (
    <main className="page">
      <div className="card">
        <header className="card-header">
          <Image
            src="/gdf-logo.png"
            alt="Global Detergent Factory"
            width={1171}
            height={348}
            priority
            sizes="(max-width: 480px) 90vw, 320px"
            className="logo"
          />
        </header>

        <div className="card-body">
          <h1>Get in touch</h1>
          <p className="lead">Leave your details below and our team will reach out to you shortly.</p>
          <ContactForm />
        </div>
      </div>

      <footer className="footer">
        © {new Date().getFullYear()} Global Detergent Factory
      </footer>
    </main>
  );
}
