import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PaymentMethod = () => {
  const axiosSecure = useAxiosSecure()
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null); // Selected payment method state

    useEffect(() => {
      axiosSecure.get("/banks").then((res) => setPaymentMethods(res.data));
    }, []);

  // Fetch payment methods from the JSON file
  useEffect(() => {
    fetch("/Payment_Methods.json")
      .then((response) => response.json())
      .then((data) => setPaymentMethods(data))
      .catch((error) =>
        ''
      );
  }, []);

  return (
    <div className="py-5">
      <div className="grid grid-cols-8 gap-4 m-4 p-4 rounded-lg shadow-md">
        {paymentMethods.map((method, index) => (
          <div
            key={index}
            onClick={() => setSelectedMethod(method.name)} // Set selected method on click
            className={`border px-5 py-2 rounded-md flex justify-center cursor-pointer transition-all duration-300 ${
              selectedMethod === method.name ? "border-yellow-500 bg-yellow-50 ring-2 ring-yellow-400" : ""
            }`}
          >
            <div className="group relative w-24 h-24 overflow-hidden rounded-lg">
              <Link to={method.path}>
                <img
                  className="w-full h-full object-cover transition-transform duration-300 ease-in-out transform group-hover:scale-110"
                  src={method.logo}
                  alt={method.name}
                />
              </Link>
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Link
                  className="text-white text-lg font-semibold underline"
                >
                  {method.name} 
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedMethod && (
        <p className="text-center text-lg font-semibold mt-4">
          Selected Payment Method: <span className="text-blue-500">{selectedMethod}</span>
        </p>
      )}
    </div>
  );
};

export default PaymentMethod;
