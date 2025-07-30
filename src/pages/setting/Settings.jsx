import PageHeader from "@/components/shared/PageHeader";
import SoundSettings from "@/components/SoundSettings";

const Settings = () => {
  return (
    <div className="mt-16 h-svh">
      <PageHeader title="Setting" />

      <div className="bg-gray-700 m-4 p-2 rounded-[4px]">
        {/* Sound Settings Section */}
        <div className="mb-6">
          <h2 className="text-gray-200 font-bold mb-2">Sound Notifications</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-200">Sound notification settings</span>
            <SoundSettings />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
