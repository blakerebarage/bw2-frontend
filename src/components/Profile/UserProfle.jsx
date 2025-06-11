import { useGetUsersQuery } from "@/redux/features/allApis/usersApi/usersApi";
import { useUser } from "@/UserContext/UserContext";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import AccountTabs from "../AccountTabs/AccountTabs";

const UserProfile = () => {
  const { id } = useParams();
  const { data: users = [] } = useGetUsersQuery();
  const { selectedUser, setSelectedUser } = useUser();

  useEffect(() => {
    const foundUser = users?.data?.users.find((user) => user._id === id);
    if (foundUser) {
      setSelectedUser(foundUser);
    }
  }, [id, users, setSelectedUser]);

  if (!selectedUser) {
    return <div className="text-center text-gray-500">User not found</div>;
  }

  return (
    <div className="bg-adminBackground min-h-screen flex flex-col lg:flex-row gap-6 md:space-x-4 px-4">
      <AccountTabs 
      id={id}
      />
      <div className="font-sans space-y-4 md:space-y-6 lg:space-y-6 mt-6">
        <h3 className="text-lg font-bold sm:text-xl text-gray-800">
          Account Summary
        </h3>
        <div className="flex flex-wrap justify-start bg-white  sm:w-2/3 md:w-2/3 lg:w-[600px]">
          <div className="p-4 w-56 md:w-96 lg:w-96  border-r border-black border-opacity-10 text-left">
            <p className="text-gray-600 font-bold text-sm sm:text-xl">
              User Balance
            </p>
            <h3>
              <span className="font-sans text-xl mr-5 font-semibold underline">
                USD
              </span>
              <span className="text-gray-800 text-xl font-bold sm:text-3xl ">
                {selectedUser?.balance.toFixed(2)}
              </span>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
