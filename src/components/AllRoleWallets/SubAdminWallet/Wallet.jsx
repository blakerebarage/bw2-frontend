import { useSelector } from "react-redux";
import RequestHistory from "./RequestHistory";
import SendRequest from "./SendRequest";

const Wallet = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-5">
        {/* Total Balance */}
        <div>
          <div className="rounded-xl bg-black p-5 space-y-2">
            <h1 className="text-white text-lg font-semibold text-center">
              Total Balances
            </h1>
            <p className="text-sm text-center font-semibold bg-yellow-500 py-2 rounded-xl">
              USDT (0.00)
            </p>
          </div>
        </div>
        {/* Remaining Balance */}
        <div>
          <div className="rounded-xl bg-black p-5 space-y-2">
            <h1 className="text-white text-lg font-semibold text-center">
              Remaining Balance
            </h1>
            <p className="text-sm text-center font-semibold bg-yellow-500 py-2 rounded-xl">
              USDT (0.00)
            </p>
          </div>
        </div>
        {/* Total Agent Balance */}
        <div>
          <div className="rounded-xl bg-black p-5 space-y-2">
            <h1 className="text-white text-lg font-semibold text-center">
              Total Agent Balance
            </h1>
            <p className="text-sm text-center font-semibold bg-yellow-500 py-2 rounded-xl">
              USDT (0.00)
            </p>
          </div>
        </div>
        {/* Total Exposure */}
        <div>
          <div className="rounded-xl bg-black p-5 space-y-2">
            <h1 className="text-white text-lg font-semibold text-center">
              Total Exposure Balance
            </h1>
            <p className="text-sm text-center font-semibold bg-yellow-500 py-2 rounded-xl">
              USDT (0.00)
            </p>
          </div>
        </div>
      </div>
      {/* <PaymentMethod></PaymentMethod> */}
      <SendRequest></SendRequest>
      <RequestHistory></RequestHistory>
    </div>
  );
};

export default Wallet;
