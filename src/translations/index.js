// Available languages
export const LANGUAGES = {
  bn: {
    code: 'bn',
    name: 'বাংলা',
    englishName: 'Bangla',
    flag: '🇧🇩'
  },
  en: {
    code: 'en', 
    name: 'English',
    englishName: 'English',
    flag: '🇺🇸'
  }
};

// Default language
export const DEFAULT_LANGUAGE = 'bn';

// Translation data
export const translations = {
  bn: {
    // Common
    welcome: 'স্বাগতম',
    login: 'লগইন',
    register: 'রেজিস্ট্রেশন',
    logout: 'লগআউট',
    balance: 'ব্যালেন্স',
    username: 'ইউজারনেম',
    password: 'পাসওয়ার্ড',
    submit: 'জমা দিন',
    cancel: 'বাতিল',
    close: 'বন্ধ করুন',
    loading: 'লোড হচ্ছে...',
    error: 'ত্রুটি',
    success: 'সফল',
    signUp: 'সাইন আপ',
    signIn: 'সাইন ইন',
    
    // Auth Pages
    welcomeBack: 'স্বাগতম',
    signInToContinue: 'অব্যাহত রাখতে আপনার অ্যাকাউন্টে সাইন ইন করুন',
    createAccount: 'অ্যাকাউন্ট তৈরি করুন',
    joinBettingJourney: 'আমাদের সাথে যোগ দিন এবং আপনার বেটিং যাত্রা শুরু করুন',
    phoneUsername: 'ফোন/ইউজারনেম',
    phoneNumber: 'ফোন নম্বর',
    fullName: 'পূর্ণ নাম',
    confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
    verificationCode: 'ভেরিফিকেশন কোড',
    enterVerificationCode: 'ভেরিফিকেশন কোড প্রবেশ করান',
    enterPhoneNumber: 'আপনার ফোন নম্বর প্রবেশ করান',
    confirmYourPassword: 'আপনার পাসওয়ার্ড নিশ্চিত করুন',
    haveReferralCode: 'রেফারেল কোড আছে?',
    dontHaveAccount: 'অ্যাকাউন্ট নেই?',
    alreadyHaveAccount: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
    
    // Navigation
    home: 'হোম',
    sports: 'স্পোর্টস',
    casino: 'ক্যাসিনো',
    live: 'লাইভ',
    profile: 'প্রোফাইল',
    favourite: 'প্রিয়',
    table: 'টেবিল',
    slot: 'স্লট',
    crash: 'ক্র্যাশ',
    fishing: 'ফিশিং',
    lottery: 'লটারি',
    arcade: 'আর্কেড',
    all: 'সব',
    popular: 'জনপ্রিয়',
    egame: 'ই-গেম',
    
    // Game Categories
    favouriteGames: 'প্রিয় গেমস',
    popularGames: 'জনপ্রিয় গেমস',
    sportsGames: 'স্পোর্টস গেমস',
    liveGames: 'লাইভ গেমস',
    tableGames: 'টেবিল গেমস',
    slotGames: 'স্লট গেমস',
    crashGames: 'ক্র্যাশ গেমস',
    fishingGames: 'ফিশিং গেমস',
    lotteryGames: 'লটারি গেমস',
    arcadeGames: 'আর্কেড গেমস',
    allGames: 'সব গেমস',
    
    // Sidebar Menu
    menu: 'মেনু',
    balanceOverview: 'ব্যালেন্স ওভারভিউ',
    depositeBalance: 'জমা ব্যালেন্স',
    withdrawBalance: 'উত্তোলন ব্যালেন্স',
    depositByChat: 'চ্যাটের মাধ্যমে জমা',
    withdrawByChat: 'চ্যাটের মাধ্যমে উত্তোলন',
    turnOver: 'টার্নওভার',
    myProfile: 'আমার প্রোফাইল',
    setting: 'সেটিং',
    dashboard: 'ড্যাশবোর্ড',
    timeZone: 'সময় অঞ্চল',
    
    // Balance & Account
    yourBalance: 'আপনার ব্যালেন্স',
    activeAccount: 'সক্রিয় অ্যাকাউন্ট',
    deposits: 'জমা',
    withdrawals: 'তোলা',
    netBalance: 'নেট ব্যালেন্স',
    availableBalance: 'উপলব্ধ ব্যালেন্স',
    currentBalance: 'বর্তমান ব্যালেন্স',
    totalDeposits: 'মোট জমা',
    totalWithdrawals: 'মোট তোলা',
    
    // Deposit & Withdraw
    deposit: 'জমা',
    withdraw: 'তোলা',
    submitDepositRequest: 'আপনার জমার অনুরোধ জমা দিন',
    requestWithdrawal: 'আপনার অ্যাকাউন্ট থেকে তোলার অনুরোধ করুন',
    selectPaymentMethod: 'পেমেন্ট পদ্ধতি নির্বাচন করুন',
    confirmDeposit: 'জমা নিশ্চিত করুন',
    
    // Chat Support
    depositByChatSupport: 'চ্যাট সাপোর্টের মাধ্যমে জমা',
    withdrawByChatSupport: 'চ্যাট সাপোর্টের মাধ্যমে তোলা',
    getInstantAssistanceDeposits: 'আমাদের ডেডিকেটেড সাপোর্ট চ্যানেলের মাধ্যমে আপনার জমার সাথে তাৎক্ষণিক সহায়তা পান',
    getInstantAssistanceWithdrawals: 'আমাদের ডেডিকেটেড সাপোর্ট চ্যানেলের মাধ্যমে আপনার তোলার সাথে তাৎক্ষণিক সহায়তা পান',
    whatsapp: 'হোয়াটসঅ্যাপ',
    messenger: 'মেসেঞ্জার',
    signal: 'সিগন্যাল',
    account: 'অ্যাকাউন্ট',
    number: 'নম্বর',
    forInstantDepositHelp: 'তাৎক্ষণিক জমার সাহায্যের জন্য, উপরের আপনার পছন্দের পদ্ধতির মাধ্যমে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।',
    forInstantWithdrawHelp: 'তাৎক্ষণিক তোলার সাহায্যের জন্য, উপরের আপনার পছন্দের পদ্ধতির মাধ্যমে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।',
    ourAgentsAvailable: 'আমাদের এজেন্টরা আপনাকে সাহায্য করার জন্য ২৪/৭ উপলব্ধ!',
    
    // Analytics & Reports
    turnoverAnalytics: 'টার্নওভার অ্যানালিটিক্স',
    trackTurnoverProgress: 'আপনার টার্নওভার অগ্রগতি এবং স্থিতি ট্র্যাক করুন',
    turnoverLimit: 'টার্নওভার সীমা',
    completedTurnover: 'সম্পূর্ণ টার্নওভার',
    status: 'স্থিতি',
    progress: 'অগ্রগতি',
    active: 'সক্রিয়',
    
    // Bets & History
    betsHistory: 'বেট ইতিহাস',
    trackBettingActivity: 'আপনার বেটিং কার্যকলাপ এবং ফলাফল ট্র্যাক করুন',
    searchByGameName: 'গেমের নাম দিয়ে অনুসন্ধান করুন',
    betAmount: 'বেট পরিমাণ',
    winAmount: 'জেতার পরিমাণ',
    round: 'রাউন্ড',
    serial: 'সিরিয়াল',
    
    // Transaction History
    transactionHistory: 'লেনদেনের ইতিহাস',
    totalDeposit30Days: 'মোট জমা (৩০ দিন)',
    totalWithdraw30Days: 'মোট তোলা (৩০ দিন)',
    all: 'সব',
    description: 'বিবরণ',
    date: 'তারিখ',
    showRecentTransactions: 'সাম্প্রতিক লেনদেন দেখান',
    transactionOverview: 'লেনদেনের সারসংক্ষেপ',
    
    // Profile
    showInfo: 'তথ্য দেখান',
    changePassword: 'পাসওয়ার্ড পরিবর্তন করুন',
    activity: 'কার্যকলাপ',
    email: 'ইমেইল',
    phoneNumberField: 'ফোন নম্বর',
    lastLogin: 'শেষ লগইন',
    noEmailProvided: 'কোন ইমেইল প্রদান করা হয়নি',
    
    // PWA Install
    installApp: 'Play9 ইনস্টল করুন',
    quickAccess: 'হোম স্ক্রিন থেকে দ্রুত অ্যাক্সেস',
    installNow: 'এখনই ইনস্টল করুন',
    fastSecure: 'দ্রুত এবং নিরাপদ',
    worksOffline: 'অফলাইনে কাজ করে',
    
    // iOS Install Instructions
    iosInstallTitle: 'iOS এ Play9 ইনস্টল করতে:',
    iosInstallStep1: 'Safari এর নিচে Share (⇧) বাটনে ট্যাপ করুন',
    iosInstallStep2: 'নিচে স্ক্রল করে "Add to Home Screen" এ ট্যাপ করুন',
    iosInstallStep3: 'নিশ্চিত করতে "Add" এ ট্যাপ করুন',
    iosInstallFooter: 'অ্যাপটি আপনার হোম স্ক্রিনে দেখা যাবে!',
    
    // Android Install Instructions
    androidInstallTitle: 'Play9 ইনস্টল করতে:',
    androidInstallStep1: 'ব্রাউজার অ্যাড্রেস বারে ইনস্টল আইকন (⊕) খুঁজুন, অথবা',
    androidInstallStep2: 'ব্রাউজার মেনু (⋮) খুলুন → "Add to Home Screen" বা "Install Play9"',
    androidInstallStep3: 'অনুরোধ করা হলে "Install" এ ট্যাপ করুন',
    androidInstallFooter: 'দ্রুত অ্যাক্সেসের জন্য অ্যাপটি আপনার হোম স্ক্রিনে যোগ হবে!',
    
    // Welcome Message
    welcomeTo: 'স্বাগতম',
    slogan: 'যেখানে ভাগ্য বদলায় এক ক্লিকে',
    loginComplete: 'আপনার লগইন সম্পূর্ণ হয়েছে এবং গেমের রোমাঞ্চ উপভোগ করতে প্রস্তুত হোন! স্পোর্টস বেটিং এর বিশ্ব এখন আপনার হাতের নাগালে। আপনার বেটের জন্য শুভকামনা!',
    registrationComplete: 'আপনার রেজিস্ট্রেশন সম্পূর্ণ হয়েছে এবং গেমের রোমাঞ্চ উপভোগ করতে প্রস্তুত হোন! স্পোর্টস বেটিং এর বিশ্ব এখন আপনার হাতের নাগালে। আপনার বেটের জন্য শুভকামনা!',
    letsPlay: 'চলুন খেলি!',
    
    // Features
    transparentOdds: '📊 প্রতিটি গেমে ট্রান্সপারেন্ট অডস ও হিস্ট্রি দেখা যায়',
    fastPayout: '$ দ্রুত এবং ঝামেলামুক্ত পেআউট গ্যারান্টি',
    support247: '২৪/৭ ফোন কলের মাধ্যমে কাস্টমার সাপোর্ট',
    
    // Games
    playNow: 'এখনই খেলুন',
    playGame: 'গেম খেলুন',
    gameProvider: 'গেম প্রোভাইডার',
    playCount: 'খেলার সংখ্যা',
    updateCount: 'কাউন্ট আপডেট করুন',
    searchByGameName: 'গেমের নাম দিয়ে অনুসন্ধান করুন',
    sportsGames: 'স্পোর্টস গেমস',
    
    // Sports
    inPlay: 'চলমান',
    today: 'আজ',
    tomorrow: 'আগামীকাল',
    parlay: 'পার্লে',
    
    // Banking
    amount: 'পরিমাণ',
    add: 'যোগ করুন',
    bankName: 'ব্যাংকের নাম',
    selectBankName: 'ব্যাংকের নাম নির্বাচন করুন',
    
    // Marquee Messages
    lotteryMessage: 'লটারী! লটারী!! লটারী!!! জয়েন করুন www.velki.club',
    agentListMessage: 'অফিসিয়াল এজেন্ট লিষ্ট https://allagentlist.com/ma.php',
    fraudMessage: 'Once player account found with fraudulent ticket, the respective market will be voided and the player account will be locked.',
    welcomeVmessage: 'WELCOME TO VELKI ! ENJOY BETTING IN MATCH ODDS, FANCY & LIVE CASINO',
    
    // Language Selector
    selectLanguage: 'ভাষা নির্বাচন করুন',
    language: 'ভাষা',
  },
  
  en: {
    // Common
    welcome: 'Welcome',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    balance: 'Balance',
    username: 'Username',
    password: 'Password',
    submit: 'Submit',
    cancel: 'Cancel',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    signUp: 'SignUp',
    signIn: 'Sign In',
    
    // Auth Pages
    welcomeBack: 'Welcome Back',
    signInToContinue: 'Sign in to your account to continue',
    createAccount: 'Create Account',
    joinBettingJourney: 'Join us and start your betting journey',
    phoneUsername: 'Phone/Username',
    phoneNumber: 'Phone Number',
    fullName: 'Full Name',
    confirmPassword: 'Confirm Password',
    verificationCode: 'Verification Code',
    enterVerificationCode: 'Enter verification code',
    enterPhoneNumber: 'Enter your phone number',
    confirmYourPassword: 'Confirm your password',
    haveReferralCode: 'Have a Referral Code?',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    
    // Navigation
    home: 'Home',
    sports: 'Sports',
    casino: 'Casino',
    live: 'Live',
    profile: 'Profile',
    favourite: 'Favourite',
    table: 'Table',
    slot: 'Slot',
    crash: 'Crash',
    fishing: 'Fishing',
    lottery: 'Lottery',
    arcade: 'Arcade',
    all: 'All',
    popular: 'Popular',
    egame: 'Egame',
    
    // Game Categories
    favouriteGames: 'Favourite Games',
    popularGames: 'Popular Games',
    sportsGames: 'Sports Games',
    liveGames: 'Live Games',
    tableGames: 'Table Games',
    slotGames: 'Slot Games',
    crashGames: 'Crash Games',
    fishingGames: 'Fishing Games',
    lotteryGames: 'Lottery Games',
    arcadeGames: 'Arcade Games',
    allGames: 'All Games',
    
    // Sidebar Menu
    menu: 'Menu',
    balanceOverview: 'Balance Overview',
    depositeBalance: 'Deposite Balance',
    withdrawBalance: 'Withdraw Balance',
    depositByChat: 'Deposit by Chat',
    withdrawByChat: 'Withdraw by Chat',
    turnOver: 'TurnOver',
    myProfile: 'My Profile',
    setting: 'Setting',
    dashboard: 'Dashboard',
    timeZone: 'Time Zone',
    
    // Balance & Account
    yourBalance: 'Your Balance',
    activeAccount: 'Active Account',
    deposits: 'Deposits',
    withdrawals: 'Withdrawals',
    netBalance: 'Net Balance',
    availableBalance: 'Available Balance',
    currentBalance: 'Current Balance',
    totalDeposits: 'Total Deposits',
    totalWithdrawals: 'Total Withdrawals',
    
    // Deposit & Withdraw
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    submitDepositRequest: 'Submit your deposit request',
    requestWithdrawal: 'Request a withdrawal from your account',
    selectPaymentMethod: 'Select Payment Method',
    confirmDeposit: 'Confirm Deposit',
    
    // Chat Support
    depositByChatSupport: 'Deposit by Chat Support',
    withdrawByChatSupport: 'Withdraw by Chat Support',
    getInstantAssistanceDeposits: 'Get instant assistance with your deposits through our dedicated support channels',
    getInstantAssistanceWithdrawals: 'Get instant assistance with your withdrawals through our dedicated support channels',
    whatsapp: 'Whatsapp',
    messenger: 'Messenger',
    signal: 'Signal',
    account: 'Account',
    number: 'Number',
    forInstantDepositHelp: 'For instant deposit help, contact our support team via your preferred method above.',
    forInstantWithdrawHelp: 'For instant withdrawal help, contact our support team via your preferred method above.',
    ourAgentsAvailable: 'Our agents are available 24/7 to assist you!',
    
    // Analytics & Reports
    turnoverAnalytics: 'Turnover Analytics',
    trackTurnoverProgress: 'Track your turnover progress and status',
    turnoverLimit: 'Turnover Limit',
    completedTurnover: 'Completed Turnover',
    status: 'Status',
    progress: 'Progress',
    active: 'Active',
    
    // Bets & History
    betsHistory: 'Bets History',
    trackBettingActivity: 'Track your betting activity and results',
    searchByGameName: 'Search by game name',
    betAmount: 'Bet Amount',
    winAmount: 'Win Amount',
    round: 'Round',
    serial: 'Serial',
    
    // Transaction History
    transactionHistory: 'Transaction History',
    totalDeposit30Days: 'Total Deposit (30 days)',
    totalWithdraw30Days: 'Total Withdraw (30 days)',
    all: 'All',
    description: 'Description',
    date: 'Date',
    showRecentTransactions: 'Show Recent Transactions',
    transactionOverview: 'Transaction Overview',
    
    // Profile
    showInfo: 'Show Info',
    changePassword: 'Change Password',
    activity: 'Activity',
    email: 'Email',
    phoneNumberField: 'Phone Number',
    lastLogin: 'Last Login',
    noEmailProvided: 'No email provided',
    
    // PWA Install
    installApp: 'Install Play9',
    quickAccess: 'Quick access from home screen',
    installNow: 'Install Now',
    fastSecure: 'Fast & Secure',
    worksOffline: 'Works Offline',
    
    // iOS Install Instructions
    iosInstallTitle: 'To install Play9 on iOS:',
    iosInstallStep1: 'Tap the Share button (⇧) at the bottom of Safari',
    iosInstallStep2: 'Scroll down and tap "Add to Home Screen"',
    iosInstallStep3: 'Tap "Add" to confirm',
    iosInstallFooter: 'The app will appear on your home screen!',
    
    // Android Install Instructions
    androidInstallTitle: 'To install Play9:',
    androidInstallStep1: 'Look for the install icon (⊕) in your browser address bar, OR',
    androidInstallStep2: 'Open browser menu (⋮) → "Add to Home Screen" or "Install Play9"',
    androidInstallStep3: 'Tap "Install" when prompted',
    androidInstallFooter: 'The app will be added to your home screen for quick access!',
    
    // Welcome Message
    welcomeTo: 'Welcome to',
    slogan: 'Where fortune changes with one click',
    loginComplete: 'Your login is complete and get ready to enjoy the thrill of the game! The world of sports betting is now at your fingertips. Good luck with your bets!',
    registrationComplete: 'Your registration is complete and get ready to enjoy the thrill of the game! The world of sports betting is now at your fingertips. Good luck with your bets!',
    letsPlay: "Let's Play!",
    
    // Features
    transparentOdds: '📊 Transparent odds & history visible in every game',
    fastPayout: '$ Fast and hassle-free payout guarantee',
    support247: '24/7 customer support via phone call',
    
    // Games
    playNow: 'Play Now',
    playGame: 'Play Game',
    gameProvider: 'Provider',
    playCount: 'Play Count',
    updateCount: 'Update Count',
    searchByGameName: 'Search by game name',
    sportsGames: 'Sports Games',
    
    // Sports
    inPlay: 'In-Play',
    today: 'Today',
    tomorrow: 'Tomorrow',
    parlay: 'Parlay',
    
    // Banking
    amount: 'Amount',
    add: 'Add',
    bankName: 'Bank Name',
    selectBankName: 'Select Bank Name',
    
    // Marquee Messages
    lotteryMessage: 'Lottery! Lottery!! Lottery!!! Join www.velki.club',
    agentListMessage: 'Official Agent List https://allagentlist.com/ma.php',
    fraudMessage: 'Once player account found with fraudulent ticket, the respective market will be voided and the player account will be locked.',
    welcomeVMessage: 'WELCOME TO VELKI ! ENJOY BETTING IN MATCH ODDS, FANCY & LIVE CASINO',
    
    // Language Selector
    selectLanguage: 'Select Language',
    language: 'Language',
  }
};

// Get translation function
export const getTranslation = (key, language = DEFAULT_LANGUAGE) => {
  return translations[language]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || key;
}; 