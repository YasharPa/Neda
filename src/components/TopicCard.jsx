import { Link } from "react-router-dom";

// comingSoonLabel: כשהנושא עוד לא קיים – כרטיס לא לחיץ עם תווית "בקרוב"
export default function TopicCard({ title, description, link, comingSoonLabel }) {
  const content = (
    <>
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-400 via-brand-500 to-blue-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>

      <div className="flex flex-col gap-3 h-full">
        <div className="flex justify-between items-start gap-3">
          <h2 className="m-0 text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {title}
          </h2>
          {comingSoonLabel && (
            <span className="shrink-0 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-3 py-1 text-xs font-bold rounded-full">
              {comingSoonLabel}
            </span>
          )}
        </div>
        <p className="text-slate-600 dark:text-dark-muted m-0 leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </>
  );

  if (comingSoonLabel) {
    return (
      <div className="glass-card relative block p-8 overflow-hidden opacity-80" aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link
      to={link}
      className="glass-card-interactive relative block p-8 no-underline group overflow-hidden"
    >
      {content}
    </Link>
  );
}
