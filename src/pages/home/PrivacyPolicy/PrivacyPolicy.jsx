import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="relative bg-[#1b1f23] px-4 py-4 text-white text-center shadow-lg">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="text-lg font-semibold">Privacy Policy</p>
      </div>

      {/* Content */}
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-8 transform hover:shadow-2xl transition-all duration-300">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1b1f23]">
              Privacy Policy
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Your privacy is our priority. Learn how we protect and manage your personal information.
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-8 text-gray-700">
            {/* Introduction */}
            <section className="space-y-4">
              <p className="leading-relaxed text-lg">
                Your privacy is important to us, and we are committed to protecting
                your personal information. We will be clear and open about why we
                collect your personal information and how we use it. Where you have
                choices or rights, we will explain these to you.
              </p>
              
              <p className="leading-relaxed">
                This Privacy Policy explains how Ourbet uses your personal information
                when you are using one of our website.
              </p>
            </section>

            {/* Agreement Section */}
            <section className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-[#1b1f23]">Your Agreement</h2>
              <p className="leading-relaxed">
                If you do not agree with any statements contained within this Privacy
                Policy, please do not proceed any further on our website. Please be
                aware that registering an account on our website, placing bets and
                transferring funds will be deemed confirmation of your full agreement
                with our Terms and Conditions and our Privacy Policy. You have the
                right to cease using the website at any time; however, we may still be
                legally required to retain some of your personal information.
              </p>
            </section>

            {/* Updates Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#1b1f23]">Policy Updates</h2>
              <p className="leading-relaxed">
                We may periodically make changes to this Privacy Policy and will
                notify you of these changes by posting the modified terms on our
                platforms. We recommend that you revisit this Privacy Policy
                regularly.
              </p>
            </section>

            {/* Information Control Section */}
            <section className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-[#1b1f23]">
                Who is in control of your information?
              </h2>
              <p className="leading-relaxed">
                Throughout this Privacy Policy, "Ourbet", "we", "our" and "us"
                relates to Mayasofttech Ltd, a limited liability company, registered
                in Belize. We control the ways your Personal Data is collected and the
                purposes for which your Personal Data is used by Ourbet, acting as the
                "data controller" for the purposes of applicable European data
                protection legislation.
              </p>
            </section>

            {/* Contact Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#1b1f23]">
                Our Data Protection Officer
              </h2>
              <div className="bg-[#1b1f23] text-white rounded-xl p-6">
                <p className="leading-relaxed">
                  If you have concerns or would like any further information about how
                  Ourbet handles your personal information, you can contact our Data
                  Protection Officer.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
