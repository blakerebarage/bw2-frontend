import { BsChatDotsFill, BsWallet2 } from "react-icons/bs";
import { FaHistory } from "react-icons/fa";
import { GiTurnstile } from "react-icons/gi";
import { GrTransaction } from "react-icons/gr";
import { HiMiniChatBubbleLeftRight } from "react-icons/hi2";
import { ImProfile } from "react-icons/im";
import { PiHandDepositFill, PiHandWithdrawFill } from "react-icons/pi";

const menuItems = [
  {
    id: 1,
    label: "Balance Overview",
    Icon: BsWallet2,
    link: "/balance-overview",
    description: "View your current balance and transactions"
  },
  {
    id: 2,
    label: "Deposite Balance",
    Icon: PiHandDepositFill,
    link: "/balance-deposite",
    description: "Add funds to your account"
  },
  {
    id: 3,
    label: "Withdraw Balance",
    Icon: PiHandWithdrawFill,
    link: "/balance-withdraw",
    description: "Withdraw your funds"
  },
  {
    id: 4,
    label: "Deposit by Chat",
    Icon: BsChatDotsFill,
    link: "/deposit-chat",
    description: "Deposit through chat support"
  },
  {
    id: 5,
    label: "Withdraw by Chat",
    Icon: HiMiniChatBubbleLeftRight,
    link: "/withdraw-chat",
    description: "Withdraw through chat support"
  },
  {
    id: 6,
    label: "TurnOver",
    Icon:  GiTurnstile,
    link: "/turn-over",
    description: "Turn Over"
  },
  { 
      id: 7, 
    label: "Bets History", 
    Icon: FaHistory, 
    link: "/bets-history",
    description: "View your past bets"
  },
  { 
    id: 8, 
    label: "Transaction History", 
    Icon: GrTransaction, 
    link: "/transaction-history",
    description: "View your past transactions"
  },
  { 
    id: 9, 
    label: "My Profile", 
    Icon: ImProfile, 
    link: "/my-profile",
    description: "Manage your profile"
  },
];

export default menuItems;
