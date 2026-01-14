import { useState, useEffect } from "react";
import { Settings, Save, AlertCircle, CheckCircle } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { getGlobalSettings, updateGlobalSetting } from "@/utils/api";

function AdminSettingsContent() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // Key being updated
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getGlobalSettings();
      if (res.ok) {
        setSettings(res.data.settings);
        
        // Ensure GAME_STARTED exists in local state if not in DB
        const hasGameStarted = res.data.settings.find(s => s.key === "GAME_STARTED");
        if (!hasGameStarted) {
            setSettings(prev => [...prev, { key: "GAME_STARTED", value: "false" }]);
        }
      } else {
        console.error("Failed to fetch settings");
        setMessage({ type: "error", text: "Failed to fetch current settings" });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage({ type: "error", text: "Error fetching settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key, value) => {
    setUpdating(key);
    setMessage(null);
    try {
      const res = await updateGlobalSetting(key, value);
      if (res.ok) {
        setSettings(prev => {
            const exists = prev.find(s => s.key === key);
            if (exists) {
                return prev.map(s => s.key === key ? { ...s, value: String(value) } : s);
            } else {
                return [...prev, { key, value: String(value) }];
            }
        });
        setMessage({ type: "success", text: `${key} updated successfully` });
      } else {
        setMessage({ type: "error", text: "Failed to update setting" });
      }
    } catch (error) {
      console.error("Error updating setting:", error);
      setMessage({ type: "error", text: "Error updating setting" });
    } finally {
      setUpdating(null);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getSettingValue = (key) => {
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : "";
  };
  
  const isGameStarted = getSettingValue("GAME_STARTED") === "true";

  return (
    <AdminLayout activeTab="settings">
      <div className="p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-amber-100 mb-6 flex items-center gap-2">
          <Settings className="w-8 h-8" /> 
          Global Settings
        </h1>

        {loading ? (
           <div className="flex justify-center p-12">
             <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent"></div>
           </div>
        ) : (
          <div className="max-w-2xl bg-gray-900/50 border border-amber-500/20 rounded-xl p-6 backdrop-blur-sm">
            
            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
                message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
              }`}>
                {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message.text}
              </div>
            )}

            {/* Game Started Switch */}
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-white/10 mb-8 hover:border-amber-500/50 transition-colors">
              <div>
                <h3 className="text-xl font-bold text-amber-100 flex items-center gap-2">
                    Game Status
                    {isGameStarted ? (
                        <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded border border-green-500/20">LIVE</span>
                    ) : (
                        <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded border border-red-500/20">OFFLINE</span>
                    )}
                </h3>
                <p className="text-gray-400 text-sm mt-1">Control if the game is active for users</p>
              </div>
              
              <button
                onClick={() => handleUpdate("GAME_STARTED", !isGameStarted)}
                disabled={updating === "GAME_STARTED"}
                className={`
                  relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-black
                  ${isGameStarted ? 'bg-green-600' : 'bg-gray-600'}
                  ${updating === "GAME_STARTED" ? 'opacity-50 cursor-wait' : ''}
                `}
              >
                <span
                  className={`${
                    isGameStarted ? 'translate-x-7' : 'translate-x-1'
                  } inline-block h-6 w-6 transform rounded-full bg-white transition-transform`}
                />
              </button>
            </div>

             <div className="border-t border-white/10 my-6"></div>

             {/* Generic Table for other settings */}
             <div className="space-y-4">
                <h3 className="text-lg font-semibold text-amber-200 mb-4">Configuration Values</h3>
                <div className="space-y-4">
                    {/* List existing settings (excluding GAME_STARTED to avoid duplication, or keep it for manual override) */}
                    {settings.map((setting) => (
                        <div key={setting.key} className="flex flex-col gap-2 p-4 bg-black/20 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                            <label className="text-sm font-mono text-gray-400">{setting.key}</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    defaultValue={setting.value}
                                    className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-white font-mono focus:border-amber-500 outline-none transition-colors"
                                    id={`input-${setting.key}`}
                                />
                                <button
                                    onClick={() => {
                                        const newVal = document.getElementById(`input-${setting.key}`).value;
                                        handleUpdate(setting.key, newVal);
                                    }}
                                    disabled={updating === setting.key}
                                    className="p-2 bg-amber-900/50 hover:bg-amber-800 text-amber-100 border border-amber-500/30 rounded disabled:opacity-50 transition-colors"
                                    title="Save Value"
                                >
                                    {updating === setting.key ? (
                                        <div className="w-4 h-4 border-2 border-amber-200 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Add New Setting Section */}
                <div className="mt-8 pt-6 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Add New Setting</h4>
                    <div className="p-4 bg-black/20 rounded-lg border border-white/5 border-dashed">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <input 
                                type="text"
                                placeholder="KEY_NAME"
                                id="new-setting-key"
                                className="bg-black/50 border border-white/10 rounded px-3 py-2 text-white font-mono text-sm focus:border-amber-500 outline-none"
                            />
                            <input 
                                type="text"
                                placeholder="Value"
                                id="new-setting-value"
                                className="bg-black/50 border border-white/10 rounded px-3 py-2 text-white font-mono text-sm focus:border-amber-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={() => {
                                const key = document.getElementById("new-setting-key").value;
                                const val = document.getElementById("new-setting-value").value;
                                if(key && val) {
                                    handleUpdate(key, val);
                                    document.getElementById("new-setting-key").value = "";
                                    document.getElementById("new-setting-value").value = "";
                                }
                            }}
                            className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm transition-colors border border-white/10"
                        >
                            Add Parameter
                        </button>
                    </div>
                </div>
             </div>

          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function AdminSettings() {
  return (
    <ProtectedRoute adminOnly={true}>
      <AdminSettingsContent />
    </ProtectedRoute>
  );
}