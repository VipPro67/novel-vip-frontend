import { Notification } from "../models";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

let eventSource: EventSource | null = null;
let lastErrorTime = 0;
const ERROR_THROTTLE_MS = 5000; // Only log errors every 5 seconds
let isConnecting = false; // Guard to prevent multiple simultaneous connections
let currentUserId: string | null = null; // Track current user to prevent duplicate connections
const CONNECTION_TIMEOUT_MS = 5000; // 5 second timeout for initial connection
let connectionTimeoutId: NodeJS.Timeout | null = null;

function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let deviceId = sessionStorage.getItem("deviceId");
  if (!deviceId) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      deviceId = crypto.randomUUID();
    } else {
      deviceId = Math.random().toString(36).substring(2, 15);
    }
    sessionStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
}

export function connectNotifications(
  userId: string,
  onNotification: (notification: Notification) => void,
): boolean {
  // Only run in browser environment
  if (typeof window === "undefined") {
    console.warn("SSE connection can only be established in browser environment");
    return false;
  }
  // Prevent duplicate connections for the same user
  if (isConnecting) {
    console.log("SSE connection already in progress, skipping...");
    return false;
  }

  if (eventSource && eventSource.readyState !== EventSource.CLOSED && currentUserId === userId) {
    console.log("SSE connection already exists for user:", userId, "state:", eventSource.readyState);
    return false;
  }

  // Force disconnect any existing connection (even if state seems closed)
  if (eventSource) {
    console.log("Force closing existing EventSource before creating new one");
    try {
      eventSource.close();
    } catch (e) {
      console.warn("Error force-closing EventSource:", e);
    }
    eventSource = null;
  }

  // Set connection state
  isConnecting = true;
  currentUserId = userId;

  const deviceId = getDeviceId();
  const url = new URL(`${API_BASE_URL}/api/notifications/stream?deviceId=${deviceId}`);

  try {
    eventSource = new EventSource(url.toString(), {
      withCredentials: true
    });
    // Set a timeout for the initial connection
    connectionTimeoutId = setTimeout(() => {
      if (isConnecting && eventSource?.readyState === EventSource.CONNECTING) {
        console.warn("SSE connection timeout - backend may be unavailable, retrying naturally...");
        isConnecting = false;
      }
    }, CONNECTION_TIMEOUT_MS);

    eventSource.onopen = () => {
      console.log("SSE connection established for user:", userId);
      isConnecting = false; // Connection successful
      // Clear timeout on successful connection
      if (connectionTimeoutId) {
        clearTimeout(connectionTimeoutId);
        connectionTimeoutId = null;
      }
    };

    eventSource.addEventListener("connected", (event) => {
      console.log("SSE connected:", event.data);
    });

    eventSource.addEventListener("notification", (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        onNotification(notification);
      } catch (error) {
        console.error("Failed to parse notification:", error);
      }
    });

    eventSource.onerror = (error) => {
      // Clear connection timeout on error
      if (connectionTimeoutId) {
        clearTimeout(connectionTimeoutId);
        connectionTimeoutId = null;
      }

      const now = Date.now();
      // Throttle error logging to prevent console spam
      if (now - lastErrorTime > ERROR_THROTTLE_MS) {
        console.warn(`SSE connection issue, readyState: ${eventSource?.readyState}. Reconnecting natively...`);
        lastErrorTime = now;
      }
      isConnecting = false;
    };

    return true;
  } catch (error) {
    console.error("Failed to establish SSE connection:", error);
    isConnecting = false; // Reset connection flag on exception
    return false;
  }
}

export function disconnectNotifications() {
  // Clear any pending connection timeout
  if (connectionTimeoutId) {
    clearTimeout(connectionTimeoutId);
    connectionTimeoutId = null;
  }

  if (eventSource) {
    console.log("Closing SSE connection, readyState:", eventSource.readyState);
    try {
      eventSource.close();
    } catch (error) {
      console.error("Error closing EventSource:", error);
    }
    eventSource = null;
  }
  // Reset all connection state
  lastErrorTime = 0;
  isConnecting = false;
  currentUserId = null;
}
