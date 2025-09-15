import { BsWallet2 } from "react-icons/bs";
import { FaHistory } from "react-icons/fa";
import { GiTurnstile } from "react-icons/gi";
import { GrTransaction } from "react-icons/gr";
import { ImProfile } from "react-icons/im";
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
    labelKey: "turnOver",
    Icon:  GiTurnstile,
    link: "/turn-over",
    description: "Turn Over"
  },
  { 
      id: 5, 
    labelKey: "betsHistory", 
    Icon: FaHistory, 
    link: "/bets-history",
    description: "View your past bets"
  },
  { 
    id: 6, 
    labelKey: "transactionHistory", 
    Icon: GrTransaction, 
    link: "/transaction-history",
    description: "View your past transactions"
  },
  { 
    id: 7, 
    labelKey: "myProfile", 
    Icon: ImProfile, 
    link: "/my-profile",
    description: "Manage your profile"
  },
];

export default menuItems;
