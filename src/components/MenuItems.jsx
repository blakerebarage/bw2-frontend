import { BsChatDotsFill, BsWallet2 } from "react-icons/bs";
import { FaHistory } from "react-icons/fa";
import { GiTurnstile } from "react-icons/gi";
import { GrTransaction } from "react-icons/gr";
import { HiMiniChatBubbleLeftRight } from "react-icons/hi2";
import { ImProfile } from "react-icons/im";
import { MdRequestPage } from "react-icons/md";
import { PiHandDepositFill, PiHandWithdrawFill } from "react-icons/pi";

const menuItems = [
  {
    id: 1,
    labelKey: "balanceOverview",
    Icon: BsWallet2,
    link: "/balance-overview",
    description: "View your current balance and transactions"
  },
  {
    id: 2,
    labelKey: "depositeBalance",
    Icon: PiHandDepositFill,
    link: "/balance-deposite",
    description: "Add funds to your account"
  },
  {
    id: 3,
    labelKey: "withdrawBalance",
    Icon: PiHandWithdrawFill,
    link: "/balance-withdraw",
    description: "Withdraw your funds"
  },
  {
    id: 4,
    labelKey: "depositByChat",
    Icon: BsChatDotsFill,
    link: "/deposit-chat",
    description: "Deposit through chat support"
  },
  {
    id: 5,
    labelKey: "withdrawByChat",
    Icon: HiMiniChatBubbleLeftRight,
    link: "/withdraw-chat",
    description: "Withdraw through chat support"
  },
  {
    id: 6,
    labelKey: "depositRequests",
    Icon: MdRequestPage,
    link: "/deposit-requests",
    description: "View your deposit requests"
  },
  {
    id: 7,
    labelKey: "withdrawRequests",
    Icon: MdRequestPage,
    link: "/withdraw-requests",
    description: "View your withdraw requests"
  },
 
  {
    id: 8,
    labelKey: "turnOver",
    Icon:  GiTurnstile,
    link: "/turn-over",
    description: "Turn Over"
  },
  { 
      id: 9, 
    labelKey: "betsHistory", 
    Icon: FaHistory, 
    link: "/bets-history",
    description: "View your past bets"
  },
  { 
    id: 10, 
    labelKey: "transactionHistory", 
    Icon: GrTransaction, 
    link: "/transaction-history",
    description: "View your past transactions"
  },
  { 
    id: 11, 
    labelKey: "myProfile", 
    Icon: ImProfile, 
    link: "/my-profile",
    description: "Manage your profile"
  },
];

export default menuItems;
