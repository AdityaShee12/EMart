import { useState } from "react";
import { subscribeToPush } from "../utils/pushNotification.js";
import { notificationAPI } from "../api/api.js";

const Dashboard = () => {

  const [loading, setLoading] = useState(false);

  const handleNotification = async () => {
    try {
      setLoading(true);

      await subscribeToPush(notificationAPI);

      alert("Notification Enabled Successfully!");

    } catch (error) {
      console.error(error);

      alert(
        error.message || "Failed to enable notification"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button
        onClick={handleNotification}
        disabled={loading}
      >
        {loading
          ? "Enabling..."
          : "Enable Notification"}
      </button>
    </div>
  );
};

export default Dashboard;
