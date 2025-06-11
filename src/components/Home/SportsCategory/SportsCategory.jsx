import { useState } from "react";
import { BsHddRackFill, BsStopwatchFill } from "react-icons/bs";
import { FaCalendarDay } from "react-icons/fa";
import { FaCalendarDays, FaTrophy } from "react-icons/fa6";
import { Link } from "react-router-dom";

const SportsCategory = () => {
  const [selectedCategory, setSelectedCategory] = useState("in-play");

  const subcategories = [
    { icon: BsStopwatchFill, title: "In-Play", value: "in-play", route: "" },
    { icon: FaCalendarDay, title: "Today", value: "today", route: "" },
    { icon: FaCalendarDays, title: "Tomorrow", value: "tomorrow", route: "" },
    { icon: FaTrophy, title: "Leagues", value: "leagues", route: "/leagues" },
    { icon: BsHddRackFill, title: "Parlay", value: "parlay", route: "/sports" },
  ];

  const counts = {
    "in-play": { all: 19, cricket: 11, soccer: 3, tennis: 7 },
    today: { all: 10, cricket: 5, soccer: 2, tennis: 1 },
    tomorrow: { all: 12, cricket: 6, soccer: 4, tennis: 2 },
    leagues: { all: 14, cricket: 8, soccer: 5, tennis: 3 },
    parlay: { all: 9, cricket: 7, soccer: 3, tennis: 2 },
  };

  const sports = [
    { name: "All", img: "https://vellki.live/assets/images/vellki/velki-sport-all.webp" },
    { name: "Cricket", img: "https://vellki.live/assets/images/vellki/cricket.webp" },
    { name: "Soccer", img: "https://vellki.live/assets/images/vellki/soccer.webp" },
    { name: "Tennis", img: "https://vellki.live/assets/images/vellki/tennis.webp" },
  ];

  return (
    <div className="flex flex-col gap-4 ">
      {/* Scrollable Category Bar */}
      <div className="flex overflow-x-auto gap-2 pb-1">
        {subcategories.map(({ icon: Icon, title, value, route }) => {
          const content = (
            <div
              onClick={() => setSelectedCategory(value)}
              className={`flex flex-col items-center justify-center min-w-[70px] p-2 rounded-xl transition-all duration-200 ${
                selectedCategory === value
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              <Icon className="text-xl mb-1" />
              <span className="text-xs font-medium">{title}</span>
            </div>
          );
          return route ? (
            <Link to={route} key={value}>
              {content}
            </Link>
          ) : (
            <div key={value}>{content}</div>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {sports.map((sport) => (
          <div
            key={sport.name}
            className="relative bg-white rounded-xl overflow-hidden shadow-md"
          >
            <img
              src={sport.img}
              alt={sport.name}
              className="w-full h-[100px] object-cover"
            />
            <div className="absolute top-3 left-3">
              <h3 className="text-sm text-gray-600 font-semibold">{sport.name}</h3>
              <h2 className="text-3xl font-bold text-black">
                {counts[selectedCategory][sport.name.toLowerCase()]}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SportsCategory;
