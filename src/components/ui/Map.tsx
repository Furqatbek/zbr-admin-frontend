import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon in Leaflet with webpack/vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

// Custom marker icons
const createCustomIcon = (color: 'green' | 'orange' | 'gray' | 'blue') => {
  const colors = {
    green: '#22c55e',
    orange: '#f97316',
    gray: '#6b7280',
    blue: '#3b82f6',
  }

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${colors[color]};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18.5" cy="17.5" r="3.5"/>
          <circle cx="5.5" cy="17.5" r="3.5"/>
          <circle cx="15" cy="5" r="1"/>
          <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

export const courierIcons = {
  available: createCustomIcon('green'),
  busy: createCustomIcon('orange'),
  offline: createCustomIcon('gray'),
  default: createCustomIcon('blue'),
}

// User location icon
const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.2);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

export interface MapMarker {
  id: number | string
  lat: number
  lng: number
  status?: 'available' | 'busy' | 'offline'
  popup?: React.ReactNode
}

interface MapProps {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  selectedMarkerId?: number | string | null
  onMarkerClick?: (id: number | string) => void
  showUserLocation?: boolean
  className?: string
  onZoomChange?: (zoom: number) => void
}

// Component to handle map events and flying to selected marker
function MapController({
  selectedMarkerId,
  markers,
  onZoomChange,
}: {
  selectedMarkerId?: number | string | null
  markers?: MapMarker[]
  onZoomChange?: (zoom: number) => void
}) {
  const map = useMap()

  useEffect(() => {
    if (selectedMarkerId && markers) {
      const marker = markers.find((m) => m.id === selectedMarkerId)
      if (marker) {
        map.flyTo([marker.lat, marker.lng], 15, { duration: 0.5 })
      }
    }
  }, [selectedMarkerId, markers, map])

  useEffect(() => {
    if (onZoomChange) {
      const handleZoom = () => {
        onZoomChange(map.getZoom())
      }
      map.on('zoomend', handleZoom)
      return () => {
        map.off('zoomend', handleZoom)
      }
    }
  }, [map, onZoomChange])

  return null
}

// Component to show user location
function UserLocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const map = useMap()

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude]
          setPosition(newPos)
        },
        (error) => {
          console.warn('Geolocation error:', error.message)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      )
    }
  }, [map])

  if (!position) return null

  return (
    <Marker position={position} icon={userLocationIcon}>
      <Popup>
        <div className="text-sm">
          <strong>Ваше местоположение</strong>
          <br />
          {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </div>
      </Popup>
    </Marker>
  )
}

export function Map({
  center = [41.2995, 69.2401], // Tashkent default
  zoom = 12,
  markers = [],
  selectedMarkerId,
  onMarkerClick,
  showUserLocation = false,
  className = '',
  onZoomChange,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null)

  const getMarkerIcon = (status?: 'available' | 'busy' | 'offline') => {
    switch (status) {
      case 'available':
        return courierIcons.available
      case 'busy':
        return courierIcons.busy
      case 'offline':
        return courierIcons.offline
      default:
        return courierIcons.default
    }
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`h-full w-full ${className}`}
      ref={mapRef}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        selectedMarkerId={selectedMarkerId}
        markers={markers}
        onZoomChange={onZoomChange}
      />

      {showUserLocation && <UserLocationMarker />}

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={getMarkerIcon(marker.status)}
          eventHandlers={{
            click: () => onMarkerClick?.(marker.id),
          }}
        >
          {marker.popup && <Popup>{marker.popup}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  )
}

// Hook for geolocation with permission handling
export function useGeolocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null)

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setError('Геолокация не поддерживается вашим браузером')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setLoading(false)
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Доступ к геолокации запрещен. Разрешите доступ в настройках браузера.')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Информация о местоположении недоступна')
            break
          case err.TIMEOUT:
            setError('Превышено время ожидания запроса геолокации')
            break
          default:
            setError('Произошла ошибка при определении местоположения')
        }
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }

  // Check permission state
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionState(result.state)
        result.onchange = () => {
          setPermissionState(result.state)
        }
      })
    }
  }, [])

  return {
    location,
    error,
    loading,
    permissionState,
    requestLocation,
  }
}

export default Map
