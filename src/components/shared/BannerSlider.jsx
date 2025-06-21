import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem
} from "@/components/ui/carousel";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import useMedia from "@/Hook/useMedia";
import { BellIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { GrNext, GrPrevious } from "react-icons/gr";

const BannerSlider = () => {
  const axiosSecure = useAxiosSecure();
  
  const [notices, setNotices] = useState([]);
  const [api, setApi] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { refreshMedia,banner} = useMedia()
  // get the banner image
  useEffect(() => {
    refreshMedia()
  }, [axiosSecure]);
 

  
  // GET the Notices from marque
  useEffect(() => {
    axiosSecure.get("/api/v1/content/latest-notice/").then((res) => {
      setNotices(res?.data?.data);
    });
  }, []);

  // Listen for the selected slide change
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Scroll to the next slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (api) {
        const nextIndex = (selectedIndex + 1) % banner.length;
        api.scrollTo(nextIndex);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [api, selectedIndex, banner?.length]);

  const scrollTo = (index) => {
    api?.scrollTo(index);
  };

  const handleNext = () => {
    const nextIndex = (selectedIndex + 1) % banner?.length;
    scrollTo(nextIndex);
  };

  const handlePrevious = () => {
    const prevIndex =
      (selectedIndex - 1 + banner?.length) % banner?.length;
    scrollTo(prevIndex);
  };
  return (
    <div className="relative w-full">
      <Carousel className="w-full" setApi={setApi}>
        {/* todo bannerImages image api not working  after given api then comment out that */}
        <CarouselContent>
        {banner?.length && banner?.map((image, index) => (
          <CarouselItem key={index}>
            <div className="">
              <img
                className="w-full h-[200px] bg-cover object-cover"
                src={`${import.meta.env.VITE_BASE_API_URL}${image.url}`}
                alt={`Slide ${index + 1}`}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
        {/* todo bannerImages image api not working  after given api then comment out that */}

        {/* Previous and Next Buttons */}
        <div className="absolute inset-0 flex justify-between items-center px-2 sm:px-4 pointer-events-none">
          <Button
            onClick={handlePrevious}
            className="bg-black/30 hover:bg-black/50 text-white text-lg sm:text-2xl px-2 py-1 pointer-events-auto backdrop-blur-sm border border-white/20"
          >
            <GrPrevious />
          </Button>
          <Button
            onClick={handleNext}
            className="bg-black/30 hover:bg-black/50 text-white text-lg sm:text-2xl px-2 py-1 pointer-events-auto backdrop-blur-sm border border-white/20"
          >
            <GrNext />
          </Button>
        </div>
              </Carousel>

        {
          notices?.length > 0 && (
          <div className="px-3 opacity-90 text-black bg-white w-full py-1">
          <div className="flex items-center gap-4">
            <BellIcon className="text-xl md:text-2xl" />
            <Marquee className="text-xs md:text-sm">
              <ul className="flex items-center justify-between gap-20 font-bold">
                 {/* todo bannerImages image api not working  after given api then comment out that */}
                {notices?.map((notice) => 
                  <li key={notice._id} className="ms-8">
                    {notice?.description}
                  </li>
                )}
                 {/* todo bannerImages image api not working  after given api then comment out that */}
              </ul>
            </Marquee>
          </div>
        </div> 
          )
        }
      </div>
  );
};

export default BannerSlider;