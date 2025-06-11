import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useEffect, useState } from "react";

const Logo = ({ className = "", size = "default" }) => {
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await axiosSecure.get("/api/v1/content/get-logo");
        if (res.data.success) {
          setLogo(res.data.data);
        }
      } catch (err) {
       
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, [axiosSecure]);

  const sizeClasses = {
    small: "h-8",
    default: "h-12",
    large: "h-16"
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded ${sizeClasses[size]} ${className}`} />
    );
  }

  if (!logo) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded ${sizeClasses[size]} ${className}`}>
        <span className="text-gray-500 text-sm">Logo</span>
      </div>
    );
  }

  return (
    <img
      src={`${import.meta.env.VITE_BASE_API_URL}${logo.url}`}
      alt="Site Logo"
      className={`object-contain ${sizeClasses[size]} ${className}`}
    />
  );
};

export default Logo; 