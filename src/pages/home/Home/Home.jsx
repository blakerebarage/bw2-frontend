import { SelectCategory } from "@/components/Home/SelectCategory/SelectCategory";
import BannerSlider from "@/components/shared/BannerSlider";
import { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    var Tawk_API = Tawk_API || {};
    var Tawk_LoadStart = new Date();

    (function () {
      var s1 = document.createElement("script");
      s1.async = true;
      s1.src = "https://embed.tawk.to/67fb9f88337fb2190cfd2f9a/1ioneebne";
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");
      document.body.appendChild(s1);
    })();
  }, []);
  return (
    <div className="mt-14">
      <BannerSlider />
      <SelectCategory />
    </div>
  );
};

export default Home;
