import App from "@/App";
import AccountStatementTabs from "@/components/AccountStatementTabs/AccountStatementTabs";
import AccountSummary from "@/components/AccountSummary/AccountSummary";
import AccountTabs from "@/components/AccountTabs/AccountTabs";
import ActiveGame from "@/components/ActiveGame/ActiveGame";
import Activity from "@/components/Activity/ActivityLog";
import AddBank from "@/components/AddBank/AddBank";
import AdminSetting from "@/components/Admin Setting/AdminSetting";
import AdminDashboard from "@/components/AdminDashboard/AdminDashboard";
import AdminWallet from "@/components/AllRoleWallets/AdminWallet/AdminWallet";
import DepositSection from "@/components/AllRoleWallets/SubAdminWallet/SendRequest";
import Wallet from "@/components/AllRoleWallets/SubAdminWallet/Wallet";
import AllWithdraw from "@/components/AllWithdraw/AllWithdraw";
import Banking from "@/components/Banking/Banking";
import BetList from "@/components/BetList/BetList";
import BetListLive from "@/components/BetListLive/BetListLive";
import DeactiveGame from "@/components/DeactiveGame/DeactiveGame";
import Downlist from "@/components/Downlist/Downlist";
import AllTransactions from "@/components/Finances/AllTransactions";
import TransactionSummary from "@/components/Finances/TransactionSummary";
import Game from "@/components/GameApi/Game";
import GameControl from "@/components/GameControl/GameControl";
import HomeControl from "@/components/HomeControl/HomeControl";
import ImageControl from "@/components/ImageControl/ImageControl";
import LiveGame from "@/components/LiveGame/LiveGame";
import MyAccount from "@/components/MyAccount/MyAccount";
import MyAccountDownList from "@/components/MyAccountComponents/MyAccountDownList";
import MyAccountStatementtabs from "@/components/MyAccountComponents/MyAccountStatementtabs";
import MyAccountSummary from "@/components/MyAccountComponents/MyAccountSummary";
import MyDashboardProfile from "@/components/MyAccountComponents/MyDashboardProfile";
import MyActivity from "@/components/MyActivity/MyActivity";
import NotFound from "@/components/NotFound/NotFound";
import Profile from "@/components/Profile/Profile";
import UserProfile from "@/components/Profile/UserProfle";
import ProtectedRoute from "@/components/ProtectedRoute";
import Setting from "@/components/Setting/Setting";
import SuperAdminBalanceAdd from "@/components/SuperAdmin/SuperAdminBalanceAdd";
import TransactionHistory from "@/components/TransactionHistory/TransactionHistory";
import Withdraw from "@/components/Withdraw/Withdraw";
import DashboardLayout from "@/layout/DashboardLayout";
import MainLayout from "@/layout/MainLayout";
import SportsLeaguesLayout from "@/layout/SportsLeaguesLayout";
import ActivityLog from "@/pages/activity-log/ActivityLog";
import AllBetsHistory from "@/pages/all-bets-history/AllBetsHistory";
import BalanceOverview from "@/pages/balance-overview/BalanceOverview";
import Banner from "@/pages/Banner";
import BetsHistory from "@/pages/bets-history/BetsHistory";
import CurrentBets from "@/pages/current-bets/CurrentBets";
import Casino from "@/pages/home/Casino/Casino";
import GameLauncher from "@/pages/home/GameLauncher/GameLauncher";
import Home from "@/pages/home/Home/Home";
import Kyc from "@/pages/home/Kyc/Kyc";
import Leagues from "@/pages/home/Leagues/Leagues";
import Login from "@/pages/home/Login/Login";
import PrivacyPolicy from "@/pages/home/PrivacyPolicy/PrivacyPolicy";
import Register from "@/pages/home/Register/Register";
import ResponsibleGaming from "@/pages/home/ResponsibleGaming/ResponsibleGaming";
import RulesRegulation from "@/pages/home/RulesRegulation/RulesRegulation";
import Sports from "@/pages/home/Sports/Sports";
import TermsAndCondition from "@/pages/home/TermsAndCondition/TermsAndCondition";
import MyProfile from "@/pages/my-profile/MyProfile";

import AdminTurnOver from "@/components/AdminTurnOver";
import BankDetails from "@/components/Banking/BankDetails";
import DepositByChat from "@/components/DepositByChat";
import GameStatusChanges from "@/components/GameControl/GameStatusChanges";
import MostPlayedGamesMonitor from "@/components/Home/MostPlayedGamesMonitor/MostPlayedGamesMonitor";
import TurnOver from "@/components/TurnOver";
import UserBetList from "@/components/UserBetList/UserBetList";
import WithdrawByChat from "@/components/WithdrawByChat";
import GameLunch from "@/pages/Game/GameLunch";
import Settings from "@/pages/setting/Settings";
import UsersData from "@/pages/UsersData/UsersData";
import { createBrowserRouter } from "react-router-dom";
import AdminRoute from "./AdminRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <MainLayout />,
        children: [
          { path: "", element: <Home /> },
          { path: "/login", element: <Login /> },
          { path: "/game", element: <GameLunch /> },
          { path: "/signup", element: <Register /> },
          { path: "/terms-conditions", element: <TermsAndCondition /> },
          { path: "/privacy-policy", element: <PrivacyPolicy /> },
          { path: "/rules-regulation", element: <RulesRegulation /> },
          { path: "/kyc", element: <Kyc /> },
          { path: "/responsible-gaming", element: <ResponsibleGaming /> },
          // Protected routes for authenticated users only
          {
            element: <ProtectedRoute />,
            children: [
              { path: "/games/gamelauncher/:id", element: <GameLauncher /> },
              { path: "/balance-overview", element: <BalanceOverview /> },
              { path: "/balance-deposite", element: <DepositSection /> },
              { path: "/balance-withdraw", element: <Withdraw /> },
              { path: "/current-bets", element: <CurrentBets /> },
              { path: "/account-statement", element: <MyAccountStatementtabs /> },
              { path: "/bets-history", element: <BetsHistory /> },
              { path: "/deposit-chat", element: <DepositByChat /> },
              { path: "/withdraw-chat", element: <WithdrawByChat /> },
              { path: "/turn-over", element: <TurnOver /> },
              { path: "/activity-log", element: <ActivityLog /> },
              { path: "/my-profile", element: <MyProfile /> },
              { path: "/setting", element: <Settings /> },
              { path: "/transaction-history", element: <TransactionHistory /> },
            ],
          },
        ],
      },
      {
        path: "/leagues",
        element: <SportsLeaguesLayout />,
        children: [
          {
            path: "",
            element: <Leagues />,
          },
        ],
      },
      {
        path: "/sports",
        element: <SportsLeaguesLayout />,
        children: [
          {
            path: "",
            element: <Sports />,
          },
        ],
      },
      {
        path: "/casino",
        element: <SportsLeaguesLayout />,
        children: [
          {
            path: "",
            element: <Casino />,
          },
        ],
      },
      {
        path: "admindashboard",
        element: (
          <AdminRoute>
            <DashboardLayout />
          </AdminRoute>
        ),
        children: [
          { path: "", element: <AdminDashboard /> },
          { path: "generalsetting", element: <Setting /> },
          { path: "adminsetting", element: <AdminSetting /> },
          { path: "gameapi", element: <Game /> },
          { path: "homecontrol", element: <HomeControl /> },
          { path: "gamecontrol", element: <GameControl /> },
          { path: "gameimagecontrol", element: <ImageControl /> },
          { path: "gamestatuschanges", element: <GameStatusChanges /> },
          { path: "mostplayedgamescontrol", element: <MostPlayedGamesMonitor /> },
          {
            path: "myaccount",
            element: <MyAccount />,
            children: [
              {
                path: "myAccountSummary",
                element: <MyAccountSummary />,
              },
              {
                path: "myAccountStatementtabs",
                element: <MyAccountStatementtabs />,
              },
              {
                path: "myDashboardProfile",
                element: <MyDashboardProfile />,
              },
              {
                path: "downlist",
                element: <MyAccountDownList />,
              },
              {
                path: "myActivity",
                element: <MyActivity />,
              },
            ],
          },
          { path: "betlist", element: <BetList /> },
          { path: "betlive", element: <BetListLive /> },
          { path: "banking", element: <Banking /> },
          { path: "activegame", element: <ActiveGame /> },
          { path: "deactivegame", element: <DeactiveGame /> },
          { path: "livegame", element: <LiveGame /> },
          { path: "usersdata/:role", element: <UsersData /> },
          { path: "depositewallet", element: <AdminWallet /> },
          { path: "wallet", element: <Wallet /> },
          { path: "addBank", element: <AddBank /> },
          { path: "addbalance", element: <SuperAdminBalanceAdd /> },
          { path: "userprofile/:id", element: <UserProfile /> },
          { path: "allwithdrawrequest", element: <AllWithdraw /> },
          { path: "all-transactions", element: <AllTransactions /> },
          { path: "transaction-summary", element: <TransactionSummary /> },
          { path: "all-bets-history", element: <AllBetsHistory /> },
          { path: "turnover-management", element: <AdminTurnOver /> },
          { path: "bank-details/:accountNumber", element: <BankDetails /> },
        ],
      },
      { path: "/aup9s", element: <Banner /> },
      { path: "/accountsummary/:id", element: <AccountSummary /> },
      { path: "/accounttabs", element: <AccountTabs /> },
      { path: "/accountstatementtabs/:id", element: <AccountStatementTabs /> },
      { path: "/profile/:id", element: <Profile /> },
      { path: "/downlist/:id", element: <Downlist /> },
      { path: "/activitylog/:id", element: <Activity /> },
      {
        path: "/betlist/:id", element: <UserBetList />
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
