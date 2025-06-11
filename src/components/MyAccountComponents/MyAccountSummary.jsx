import { useCurrency } from "@/Hook/useCurrency";
import { useSelector } from "react-redux";

const MyAccountSummary = () => {
  const { user } = useSelector((state) => state.auth);
  const {formatCurrency} = useCurrency();
  // const { data: users } = useGetUsersQuery();
  
  // Filter users who have the same role as the logged-in user
  // const currentUserData = users?.find(
  //   (u) => u.phoneOrUserName === user?.phoneOrUserName
  // );

  return (
    <div className="w-full  bg-gradient-to-b from-[#fefefe] to-[#f3f3f3] ">
      <div>
        <div className="w-full min-h-screen flex flex-col md:flex-row lg:flex-row place-items-baseline space-y-4 md:space-y-0 lg:space-y-0 space-x-0 md:space-x-4 px-4">
          <div className="font-sans space-y-4 md:space-y-6 lg:space-y-6">
            <h3 className="text-lg font-bold sm:text-xl text-gray-800">
              Account Summary
            </h3>
            <div className="flex flex-wrap justify-start bg-gray-50 shadow-lg  sm:w-2/3 md:w-2/3 lg:w-[600px]">
              <div className="p-4 w-56 md:w-96 lg:w-96  border-r border-black border-opacity-10 text-left">
                <p className="text-gray-600 font-bold text-sm sm:text-xl">
                  Your Balance
                </p>
                <h3>
                  <span className="font-sans text-xl mr-5 font-semibold underline">
                  {user?.currency}
                  </span>
                  <span className="text-gray-700 text-xl font-bold sm:text-3xl ">
                  {formatCurrency(user?.balance) || '00.00'}
                    {/* {user?.balance} */}
                  </span>
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountSummary;
