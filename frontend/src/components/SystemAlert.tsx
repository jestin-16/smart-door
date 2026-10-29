import React from 'react';
import { AlertCircle, WifiOff, X, RefreshCw } from 'lucide-react';

interface SystemAlertProps {
  error: string | null;
  isDisconnected: boolean;
  onDismissError?: () => void;
  onRetryConnection?: () => void;
}

export const SystemAlert: React.FC<SystemAlertProps> = ({
  error,
  isDisconnected,
  onDismissError,
  onRetryConnection,
}) => {
  if (!error && !isDisconnected) return null;

  return (
    <div className="dashboard-alerts space-y-3 mb-6" role="alert">
      {/* Disconnected Banner */}
      {isDisconnected && (
        <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-luxury border-rose-200/80 bg-rose-50/70">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-rose-100 rounded-2xl text-rose-700 shadow-xs">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">Device Connection Offline</h4>
              <p className="text-xs text-rose-700/90 mt-0.5">
                The ESP32 or MQTT broker is currently unreachable. The local edge hardware will continue operating autonomously.
              </p>
            </div>
          </div>
          {onRetryConnection && (
            <button
              onClick={onRetryConnection}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs whitespace-nowrap ml-4"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          )}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-luxury border-amber-200/80 bg-amber-50/70">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-amber-100 rounded-2xl text-amber-700 shadow-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">A quick heads-up</h4>
              <p className="text-xs text-amber-800 mt-0.5">{error}</p>
            </div>
          </div>
          {onDismissError && (
            <button
              onClick={onDismissError}
              aria-label="Dismiss notification"
              className="p-1.5 rounded-full text-amber-600 hover:text-amber-900 hover:bg-amber-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SystemAlert;

