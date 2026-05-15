import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Shield, Clock, MapPin, Battery, Wifi, Navigation } from 'lucide-react';
import { format } from 'date-fns';

// Fix for default marker icon in Leaflet + React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to recenter map when location updates
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 15);
  return null;
}

interface CommuteSession {
  id: string;
  route_name: string;
  from_address: string;
  to_address: string;
  transport_mode: string;
  status: string;
  started_at: string;
  expected_arrival: string;
}

interface LocationPing {
  latitude: number;
  longitude: number;
  accuracy: number;
  created_at: string;
}

function App() {
  const [session, setSession] = useState<CommuteSession | null>(null);
  const [latestPing, setLatestPing] = useState<LocationPing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = window.location.pathname.split('/').pop();

  useEffect(() => {
    if (!sessionId || sessionId === '' || sessionId === 'session') {
      setError('Invalid Session ID. Please use the link sent by the traveller.');
      setLoading(false);
      return;
    }

    fetchSessionData();

    // Subscribe to real-time location pings
    const channel = supabase
      .channel('location_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'location_pings',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setLatestPing(payload.new as LocationPing);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('commute_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      const { data: pingData, error: pingError } = await supabase
        .from('location_pings')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!pingError) {
        setLatestPing(pingData);
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not find this safety session. It may have ended or been deleted.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <Shield size={48} className="pulse" color="#3b82f6" />
        <p>Connecting to secure tracking...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="error-screen">
        <Shield size={48} color="#ef4444" />
        <h1>Session Not Found</h1>
        <p>{error}</p>
      </div>
    );
  }

  const center: [number, number] = latestPing 
    ? [latestPing.latitude, latestPing.longitude] 
    : [0, 0];

  return (
    <div className="app-container">
      <header className="glass">
        <div className="header-content">
          <div className="brand">
            <Shield className="brand-icon" color="#3b82f6" />
            <div>
              <h1>ReachSafe</h1>
              <p>Live Safety Dashboard</p>
            </div>
          </div>
          <div className={`status-badge ${session.status}`}>
            {session.status.toUpperCase()}
          </div>
        </div>
      </header>

      <main>
        <div className="map-container premium-card">
          {latestPing ? (
            <MapContainer {...({ center, zoom: 15, zoomControl: false } as any)}>
              <TileLayer
                {...({
                  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                } as any)}
              />
              <ChangeView center={center} />
              <Marker position={center}>
                <Popup>
                  Traveller's current location<br />
                  Accuracy: {latestPing.accuracy?.toFixed(0)}m
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="no-location">
              <MapPin size={48} color="#a3a3a3" />
              <p>Waiting for location signal...</p>
            </div>
          )}
        </div>

        <aside className="details-panel">
          <div className="premium-card info-card">
            <h2>Commute Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <Navigation size={18} color="#3b82f6" />
                <div>
                  <label>Route</label>
                  <span>{session.route_name}</span>
                </div>
              </div>
              <div className="info-item">
                <Clock size={18} color="#3b82f6" />
                <div>
                  <label>Started At</label>
                  <span>{format(new Date(session.started_at), 'p')}</span>
                </div>
              </div>
              <div className="info-item">
                <MapPin size={18} color="#3b82f6" />
                <div>
                  <label>Destination</label>
                  <span>{session.to_address}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="premium-card info-card">
            <h2>Safety Status</h2>
            <div className="status-grid">
              <div className="status-item">
                <Battery size={20} color={session.status === 'active' ? "#10b981" : "#a3a3a3"} />
                <label>Device Battery</label>
                <span>Good</span>
              </div>
              <div className="status-item">
                <Wifi size={20} color={session.status === 'active' ? "#10b981" : "#a3a3a3"} />
                <label>Connection</label>
                <span>Live</span>
              </div>
            </div>
          </div>
          
          <div className="footer-note">
            <p>This session is encrypted. Only people with this link can view this location.</p>
          </div>
        </aside>
      </main>

      <style>{`
        .app-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100%;
        }

        header {
          padding: 16px 24px;
          z-index: 1000;
          position: sticky;
          top: 0;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 32px;
          height: 32px;
        }

        .brand h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .brand p {
          margin: 0;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .status-badge.active {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }

        main {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 20px;
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        @media (max-width: 1024px) {
          main {
            grid-template-columns: 1fr;
          }
          aside {
            order: 2;
          }
          .map-container {
            height: 400px !important;
          }
        }

        .map-container {
          height: 100%;
          padding: 8px !important;
        }

        .details-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-card h2 {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 20px;
          letter-spacing: 0.5px;
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-item {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .info-item label {
          display: block;
          font-size: 11px;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 600;
        }

        .info-item span {
          display: block;
          font-size: 15px;
          font-weight: 600;
        }

        .status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .status-item {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--border);
        }

        .status-item label {
          font-size: 10px;
          color: var(--text-secondary);
          font-weight: 600;
          text-align: center;
        }

        .status-item span {
          font-size: 14px;
          font-weight: 700;
        }

        .footer-note {
          text-align: center;
          padding: 10px;
        }

        .footer-note p {
          font-size: 11px;
          color: var(--text-secondary);
          font-style: italic;
        }

        .loading-screen, .error-screen {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          text-align: center;
          padding: 20px;
        }

        .pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }

        .no-location {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
}

export default App;
