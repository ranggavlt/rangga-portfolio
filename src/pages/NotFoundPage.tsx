import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return <main className="case-study-placeholder"><div><p className="case-study-kicker">404 / Page not found</p><h1>Nothing here<br /><em>just yet.</em></h1><p>The page you were looking for doesn’t exist.</p><Link className="button button-dark" to="/">Back to portfolio</Link></div></main>
}
