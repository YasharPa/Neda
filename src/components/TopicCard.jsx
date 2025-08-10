import { Link } from "react-router-dom";
import "../styles/TopicCard.css";

export default function TopicCard({ title, description, link }) {
  return (
    <Link to={link} className="topic-card">
      <h2>{title}</h2>
      <p>{description}</p>
    </Link>
  );
}
