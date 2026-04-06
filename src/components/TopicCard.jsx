import { Link } from "react-router-dom";
import "../styles/TopicCard.css";

export default function TopicCard({ title, description, link }) {
  return (
    <Link
      to={link}
      className="relative block p-5 border border-gray-200 rounded-xl bg-white no-underline text-black transition duration-200 hover:-translate-y-1 hover:shadow-md overflow-hidden before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-[#4caf50] before:via-[#2196f3] before:to-[#ff9800]"
    >
      <h2 className="m-0 mb-2.5 text-center mb-8 text-[#2c3e50] text-xl font-bold">
        {title}
      </h2>
      <p className="text-[#7f8c8d]">{description}</p>
    </Link>
  );
}
