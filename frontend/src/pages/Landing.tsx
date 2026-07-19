import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div>
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-equilibrium-dark leading-tight">
          A quiet place to say <br />
          <span className="bg-gradient-to-r from-equilibrium-blue to-equilibrium-purple bg-clip-text text-transparent">
            what you're really feeling
          </span>
        </h1>
        <p className="mt-5 text-gray-500 max-w-2xl mx-auto">
          Equilibrium is an anonymous space to express your emotions, get AI-powered insight into your patterns,
          and connect with a real mentor — without ever sharing who you are.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/register" className="btn-primary">Get started anonymously</Link>
          <Link to="/login" className="btn-secondary">I already have an account</Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-6 pb-20">
        <Feature title="Stay fully anonymous" body="Pick a username like MoonWalker or SilentSoul45. No real names, ever shown publicly." />
        <Feature title="AI emotional insight" body="Every post is gently analyzed for mood, stress, and early warning signs — never for judgment." />
        <Feature title="Real human mentors" body="When something looks serious, a trained mentor is notified and can privately reach out." />
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20 text-center text-sm text-gray-400">
        Equilibrium is a peer-support and self-reflection tool. It is not a replacement for professional
        diagnosis or emergency care. If you are in crisis, please contact local emergency services or a
        crisis line in your country.
      </section>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-6">
      <h3 className="font-semibold text-equilibrium-dark mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{body}</p>
    </div>
  );
}
