import { Link } from "react-router-dom";

export default function TopicCard({ title, description, link }) {
  return (
    <Link
      to={link}
      className="glass-card-interactive relative block p-8 no-underline group overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-400 via-brand-500 to-blue-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex flex-col gap-3 h-full">
        <h2 className="m-0 text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {title}
        </h2>
        <p className="text-slate-600 dark:text-dark-muted m-0 leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </Link>
  );
}
