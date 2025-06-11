import { useLocation, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    if (location.state?.from) {
      navigate(location.state.from.pathname);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1f2937] text-white px-4">
      <h1 className="text-7xl font-extrabold text-yellow-400 mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-bold mb-2">Page Not Found</h2>
      <p className="mb-8 text-lg text-gray-300 text-center max-w-md">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={goBack}
        className="bg-yellow-400 hover:bg-yellow-500 text-[#1f2937] font-semibold px-6 py-3 rounded-full shadow-lg transition-colors duration-200"
      >
        Go Back
      </button>
    </div>
  );
};

export default NotFound;
