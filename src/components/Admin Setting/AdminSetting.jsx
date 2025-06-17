import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useToasts } from "react-toast-notifications";

const AdminSetting = () => {
  const axiosSecure = useAxiosSecure();
  const { addToast } = useToasts();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    isMaintenanceMode: false,
    defaultCurrency: "USD",
    defaultRefferalCode: "",
    defaultBonusAccUsername: "",
    signupBonus: 0,
    firstDepositBonusPercentage: 0,
    minAmountForFirstDepositBonus: 0,
    paymentMethodBonus: [],
    bonusTurnoverRatio: 1,
    regularTurnoverRatio: 1,
    supportContact: [],
    depositWithdrawNumbers: []
  });
 console.log(form);
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        // Fetch general settings
        const generalRes = await axiosSecure.get('/api/v1/system-setting/get-general');
        if (generalRes.data.success && generalRes.data.data) {
          setForm(prev => ({
            ...prev,
            isMaintenanceMode: generalRes.data.data.isMaintenanceMode,
            supportContact: generalRes.data.data.supportContact || []
          }));
        }

        // Fetch other settings
        const res = await axiosSecure.get('/api/v1/system-setting');
        if (res.data.success && res.data.data) {
          setForm(prev => ({
            ...prev,
            ...res.data.data,
            supportContact: prev.supportContact // Keep the support contact from general settings
          }));
        }
      } catch (err) {
        addToast('Failed to fetch settings', { appearance: 'error', autoDismiss: true });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handlePaymentMethodChange = (index, field, value) => {
    const newPaymentMethods = [...form.paymentMethodBonus];
    newPaymentMethods[index] = { ...newPaymentMethods[index], [field]: value };
    handleChange('paymentMethodBonus', newPaymentMethods);
  };

  const addPaymentMethod = () => {
    handleChange('paymentMethodBonus', [
      ...form.paymentMethodBonus,
      { method: '', percentage: 0 }
    ]);
  };

  const removePaymentMethod = (index) => {
    const newPaymentMethods = form.paymentMethodBonus.filter((_, i) => i !== index);
    handleChange('paymentMethodBonus', newPaymentMethods);
  };

  const handleSupportContactChange = (index, field, value) => {
    const newContacts = [...form.supportContact];
    newContacts[index] = { ...newContacts[index], [field]: value };
    handleChange('supportContact', newContacts);
  };

  const addSupportContact = () => {
    handleChange('supportContact', [
      ...form.supportContact,
      { providerName: '', phoneNumber: '', link: '' }
    ]);
  };

  const removeSupportContact = (index) => {
    const newContacts = form.supportContact.filter((_, i) => i !== index);
    handleChange('supportContact', newContacts);
  };

  const handleDepositWithdrawNumberChange = (index, field, value) => {
    const newNumbers = [...form.depositWithdrawNumbers];
    newNumbers[index] = { ...newNumbers[index], [field]: value };
    handleChange('depositWithdrawNumbers', newNumbers);
  };

  const addDepositWithdrawNumber = () => {
    handleChange('depositWithdrawNumbers', [
      ...form.depositWithdrawNumbers,
      { method: '', number: '' }
    ]);
  };

  const removeDepositWithdrawNumber = (index) => {
    const newNumbers = form.depositWithdrawNumbers.filter((_, i) => i !== index);
    handleChange('depositWithdrawNumbers', newNumbers);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save general settings
      const generalData = {
        isMaintenanceMode: form.isMaintenanceMode,
        supportContact: form.supportContact
      };
      const generalRes = await axiosSecure.put('/api/v1/system-setting/general', generalData);
      
      // Save other settings
      const otherData = {
        ...form,
        supportContact: undefined // Remove supportContact from other settings
      };
      const res = await axiosSecure.put('/api/v1/system-setting/update', otherData);

      if (generalRes.data.success && res.data.success) {
        addToast('Settings updated successfully', { appearance: 'success', autoDismiss: true });
      } else {
        addToast('Failed to update settings', { appearance: 'error', autoDismiss: true });
      }
    } catch (err) {
      addToast('Error updating settings', { appearance: 'error', autoDismiss: true });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1f2937]"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-4">
            <h1 className="text-2xl font-bold text-white text-center">
              System Settings
            </h1>
            <p className="text-gray-300 text-center mt-1">
              Configure your system preferences and bonus settings
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* Maintenance Mode */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-lg font-semibold text-[#1f2937] mb-4">System Status</h2>
              <div className="flex items-center space-x-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.isMaintenanceMode}
                    onChange={(e) => handleChange('isMaintenanceMode', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1f2937]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1f2937]"></div>
                </label>
                <span className="text-gray-700 font-medium">
                  {form.isMaintenanceMode ? 'Maintenance Mode Active' : 'System Active'}
                </span>
              </div>
            </div>

            {/* Default Settings */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-lg font-semibold text-[#1f2937] mb-4">Default Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Currency
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                    value={form.defaultCurrency}
                    onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="BDT">BDT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Referral Code
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                    value={form.defaultRefferalCode}
                    onChange={(e) => handleChange('defaultRefferalCode', e.target.value)}
                    placeholder="Enter referral code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Bonus Account
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                    value={form.defaultBonusAccUsername}
                    onChange={(e) => handleChange('defaultBonusAccUsername', e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
              </div>
            </div>

            {/* Bonus Settings */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h2 className="text-lg font-semibold text-[#1f2937] mb-4">Bonus Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Signup Bonus
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                      value={form.signupBonus}
                      onChange={(e) => handleChange('signupBonus', Number(e.target.value))}
                      placeholder="Enter bonus amount"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Deposit Bonus (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                      value={form.firstDepositBonusPercentage}
                      onChange={(e) => handleChange('firstDepositBonusPercentage', Number(e.target.value))}
                      placeholder="Enter percentage"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Amount for First Deposit Bonus
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                      value={form.minAmountForFirstDepositBonus}
                      onChange={(e) => handleChange('minAmountForFirstDepositBonus', Number(e.target.value))}
                      placeholder="Enter minimum amount"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{form.defaultCurrency}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bonus Turnover Ratio
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                    value={form.bonusTurnoverRatio}
                    onChange={(e) => handleChange('bonusTurnoverRatio', Number(e.target.value))}
                    placeholder="Enter bonus turnover ratio"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Regular Turnover Ratio
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                    value={form.regularTurnoverRatio}
                    onChange={(e) => handleChange('regularTurnoverRatio', Number(e.target.value))}
                    placeholder="Enter regular turnover ratio"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Bonus */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#1f2937]">Payment Method Bonus</h2>
                <button
                  onClick={addPaymentMethod}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1f2937] hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f2937] transition-all duration-200"
                >
                  <FaPlus className="mr-2" /> Add Method
                </button>
              </div>
              <div className="space-y-4">
                {form.paymentMethodBonus.map((method, index) => (
                  <div key={index} className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div className="flex-1">
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                        value={method.method}
                        onChange={(e) => handlePaymentMethodChange(index, 'method', e.target.value)}
                        placeholder="Payment method name"
                      />
                    </div>
                    <div className="w-32 relative">
                      <input
                        type="number"
                        className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                        value={method.percentage}
                        onChange={(e) => handlePaymentMethodChange(index, 'percentage', Number(e.target.value))}
                        placeholder="Percentage"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                    </div>
                    <button
                      onClick={() => removePaymentMethod(index)}
                      className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Contact Section */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#1f2937]">Support Contacts</h2>
                <button
                  onClick={addSupportContact}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1f2937] hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f2937] transition-all duration-200"
                >
                  <FaPlus className="mr-2" /> Add Contact
                </button>
              </div>
              <div className="space-y-4">
                {form.supportContact.map((contact, index) => (
                  <div key={index} className="flex flex-wrap md:flex-nowrap items-center space-y-2 md:space-y-0 md:space-x-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div className="flex-1 min-w-[120px]">
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                        value={contact.providerName}
                        onChange={(e) => handleSupportContactChange(index, 'providerName', e.target.value)}
                        placeholder="Provider Name (e.g. WhatsApp)"
                      />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                        value={contact.phoneNumber}
                        onChange={(e) => handleSupportContactChange(index, 'phoneNumber', e.target.value)}
                        placeholder="Phone Number"
                      />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                        value={contact.link}
                        onChange={(e) => handleSupportContactChange(index, 'link', e.target.value)}
                        placeholder="Link (optional)"
                      />
                    </div>
                    <button
                      onClick={() => removeSupportContact(index)}
                      className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Deposit/Withdraw Numbers Section */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#1f2937]">Deposit/Withdraw Numbers</h2>
                <button
                  onClick={addDepositWithdrawNumber}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1f2937] hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f2937] transition-all duration-200"
                >
                  <FaPlus className="mr-2" /> Add Number
                </button>
              </div>
              <div className="space-y-4">
                {form.depositWithdrawNumbers.map((item, index) => (
                  <div key={index} className="flex flex-wrap md:flex-nowrap items-center space-y-2 md:space-y-0 md:space-x-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div className="flex-1 min-w-[120px]">
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                        value={item.method}
                        onChange={(e) => handleDepositWithdrawNumberChange(index, 'method', e.target.value)}
                        placeholder="Method (e.g. Bkash, Nagad)"
                      />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                        value={item.number}
                        onChange={(e) => handleDepositWithdrawNumberChange(index, 'number', e.target.value)}
                        placeholder="Account Number"
                      />
                    </div>
                    <button
                      onClick={() => removeDepositWithdrawNumber(index)}
                      className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#1f2937] hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetting;
