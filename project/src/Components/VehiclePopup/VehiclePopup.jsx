import React from 'react';
import useVehicleDetails from '../../Hooks/useVehicleDetails';
import styles from './VehiclePopup.module.css';

const VehiclePopup = () => {
  const vehicle = useVehicleDetails().vehicleDetails;
  if (!vehicle) return null;

  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  // Format delay
  const formatDelay = (delay) => {
    if (!delay) return 'On time';
    const minutes = Math.floor(Math.abs(delay) / 60);
    const seconds = Math.abs(delay) % 60;
    if (minutes > 0) {
      return delay > 0 ? `${minutes}m ${seconds}s late` : `${minutes}m ${seconds}s early`;
    }
    return delay > 0 ? `${seconds}s late` : `${seconds}s early`;
  };

  // Format distance
  const formatDistance = (distance) => {
    if (!distance) return 'Unknown';
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  // Get occupancy status text
  const getOccupancyStatus = (status) => {
    const statusMap = {
      0: 'Empty',
      1: 'Many seats available',
      2: 'Few seats available',
      3: 'Standing room only',
      4: 'Crushed standing room only',
      5: 'Full',
      6: 'Not accepting passengers'
    };
    return statusMap[status] || 'Unknown';
  };

  return (
    <div className={styles.popupWrapper}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          background: '#e74c3c',
          color: 'white',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '18px',
          fontWeight: 'bold',
          minWidth: '50px',
          textAlign: 'center'
        }}>
          {vehicle.routeId || 'Unknown'}
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            Vehicle {vehicle.vehicleId || vehicle.id}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            Last update: {formatTime(vehicle.timestamp)}
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#2c3e50' }}>Current Status</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
          <div>
            <div style={{ color: '#7f8c8d', fontSize: '12px', fontWeight: '500' }}>Position:</div>
            <div style={{ color: '#2c3e50', fontWeight: '600' }}>
              {vehicle.lat?.toFixed(5)}, {vehicle.lon?.toFixed(5)}
            </div>
          </div>
          <div>
            <div style={{ color: '#7f8c8d', fontSize: '12px', fontWeight: '500' }}>Speed:</div>
            <div style={{ color: '#2c3e50', fontWeight: '600' }}>
              {vehicle.speed ? `${(vehicle.speed * 3.6).toFixed(1)} km/h` : 'Unknown'}
            </div>
          </div>
          {vehicle.bearing && (
            <div>
              <div style={{ color: '#7f8c8d', fontSize: '12px', fontWeight: '500' }}>Direction:</div>
              <div style={{ color: '#2c3e50', fontWeight: '600' }}>{vehicle.bearing}°</div>
            </div>
          )}
          <div>
            <div style={{ color: '#7f8c8d', fontSize: '12px', fontWeight: '500' }}>Occupancy:</div>
            <div style={{ color: '#2c3e50', fontWeight: '600' }}>
              {getOccupancyStatus(vehicle.occupancy)}
            </div>
          </div>
        </div>
      </div>

      {/* Trip Information */}
      {vehicle.tripUpdate && (
        <div style={{ 
          marginBottom: '16px',
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '6px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#2c3e50' }}>Trip Information</h4>
          {vehicle.tripUpdate.delay && (
            <div style={{ 
              display: 'inline-block',
              background: vehicle.tripUpdate.delay > 0 ? '#ffeaa7' : '#a29bfe',
              color: vehicle.tripUpdate.delay > 0 ? '#e17055' : '#2d3436',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              {formatDelay(vehicle.tripUpdate.delay)}
            </div>
          )}
          
          {vehicle.tripUpdate.stopTimeUpdates && vehicle.tripUpdate.stopTimeUpdates.length > 0 && (
            <div style={{ fontSize: '14px' }}>
              <strong>Next stops:</strong>
              <div style={{ maxHeight: '140px', overflowY: 'auto', marginTop: '8px', border: '1px solid #dfe6e9', borderRadius: '6px' }}>
                {vehicle.tripUpdate.stopTimeUpdates.slice(0, 3).map((stop, index) => (
                  <div key={index} style={{ 
                    padding: '10px',
                    background: 'white',
                    borderBottom: '1px solid #dfe6e9'
                  }}>
                    <div style={{ fontWeight: '600', fontSize: '12px', color: '#2d3436', marginBottom: '4px' }}>
                      {stop.station?.station_name || stop.stopId}
                    </div>
                    {stop.arrival && (
                      <div style={{ fontSize: '11px', color: '#636e72' }}>
                        Arrival: {formatTime(stop.arrival.time)} 
                        {stop.arrival.delay && (
                          <span style={{ color: stop.arrival.delay > 0 ? '#e17055' : '#00b894', fontWeight: '600' }}>
                            {' '}({formatDelay(stop.arrival.delay)})
                          </span>
                        )}
                      </div>
                    )}
                    {stop.departure && (
                      <div style={{ fontSize: '11px', color: '#636e72' }}>
                        Departure: {formatTime(stop.departure.time)}
                        {stop.departure.delay && (
                          <span style={{ color: stop.departure.delay > 0 ? '#e17055' : '#00b894', fontWeight: '600' }}>
                            {' '}({formatDelay(stop.departure.delay)})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nearest Station */}
      {vehicle.nearestStation && (
        <div style={{ 
          marginBottom: '16px',
          padding: '12px',
          background: '#e8f6f3',
          borderRadius: '6px',
          border: '1px solid #76d7c4'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#155724' }}>Nearest Station</h4>
          <div style={{ fontSize: '14px' }}>
            <div style={{ fontWeight: 'bold', color: '#1a5276' }}>
              {vehicle.nearestStation.station_name}
            </div>
            <div style={{ fontSize: '12px', color: '#2874a6' }}>
              Distance: {formatDistance(vehicle.nearestStation.distance)}
              {vehicle.nearestStation.transport_type && (
                <span style={{ fontWeight: '600' }}> • {vehicle.nearestStation.transport_type}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        paddingTop: '12px',
        borderTop: '1px solid #dee2e6',
        fontSize: '12px',
        color: '#6c757d'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span>Vehicle ID: {vehicle.id}</span>
          {vehicle.tripId && <span>Trip ID: {vehicle.tripId}</span>}
          {vehicle.serverTime && (
            <span>Server time: {formatTime(vehicle.serverTime)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehiclePopup;