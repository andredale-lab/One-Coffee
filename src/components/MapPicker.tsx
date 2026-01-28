import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { X, Check, Loader2, Search } from 'lucide-react';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  onSelect: (location: string) => void;
  onClose: () => void;
  lang: 'IT' | 'EN';
}

function MapUpdater({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16);
    }
  }, [center, map]);
  return null;
}

function LocationMarker({ onLocationFound }: { onLocationFound: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationFound(e.latlng.lat, e.latlng.lng);
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    map.locate();
  }, [map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

function NearbyBars({ onSelectBar }: { onSelectBar: (name: string, lat: number, lng: number) => void }) {
  const [bars, setBars] = useState<Array<{id: number, lat: number, lon: number, tags?: {name?: string}}>>([]);
  const map = useMapEvents({
    moveend: () => {
      fetchBars();
    }
  });

  const fetchBars = async () => {
    const bounds = map.getBounds();
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"cafe|bar|pub"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
      );
      out body 30;
    `;

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      const data = await response.json();
      setBars(data.elements.filter((el: any) => el.lat && el.lon));
    } catch (error) {
      console.error('Error fetching bars:', error);
    }
  };

  useEffect(() => {
    fetchBars();
  }, [map]);

  const coffeeIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`;

  const barIcon = L.divIcon({
    html: `<div style="background-color: white; border-radius: 50%; padding: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 1px solid #fcd34d;">${coffeeIconSvg}</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <>
      {bars.map(bar => (
        <Marker 
          key={bar.id} 
          position={[bar.lat, bar.lon]} 
          icon={barIcon}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e); // Prevent map click
              onSelectBar(bar.tags?.name || 'Bar', bar.lat, bar.lon);
            }
          }}
        />
      ))}
    </>
  );
}

export default function MapPicker({ onSelect, onClose, lang }: MapPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  const t = {
    IT: {
      title: 'Seleziona un bar',
      confirm: 'Conferma selezione',
      cancel: 'Annulla',
      instruction: 'Clicca sulla mappa per selezionare un luogo',
      loading: 'Ricerca indirizzo...',
      selected: 'Selezionato:',
      searchPlaceholder: 'Cerca bar o indirizzo...'
    },
    EN: {
      title: 'Select a bar',
      confirm: 'Confirm selection',
      cancel: 'Cancel',
      instruction: 'Click on the map to select a place',
      loading: 'Finding address...',
      selected: 'Selected:',
      searchPlaceholder: 'Search bar or address...'
    }
  }[lang];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setMapCenter([lat, lon]);
    setSearchResults([]);
    setSearchQuery(result.display_name.split(',')[0]); 
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      
      let placeName = '';
      if (data.address) {
         placeName = data.address.amenity || data.address.shop || data.address.tourism || data.address.building || data.address.leisure || '';
         
         if (placeName) {
            placeName += `, ${data.address.road || ''}`;
         } else {
            placeName = (data.address.road || '') + ', ' + (data.address.suburb || data.address.city || '');
         }
         
         if (!placeName.replace(/, /g, '').trim()) {
            placeName = data.display_name.split(',').slice(0, 2).join(',');
         }
      } else {
        placeName = data.display_name;
      }
      
      setAddress(placeName || data.display_name);
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header with Search */}
        <div className="p-4 border-b border-gray-100 flex flex-col gap-3 bg-white z-10">
            <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{t.title}</h3>
                  <p className="text-sm text-gray-500">{t.instruction}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
            </div>
            
            <div className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder={t.searchPlaceholder}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <button 
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[3rem]"
                    >
                        {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </button>
                </div>

                {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white mt-1 rounded-lg shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-50">
                        {searchResults.map((result, i) => (
                            <button
                                key={i}
                                onClick={() => selectResult(result)}
                                className="w-full text-left p-3 hover:bg-amber-50 transition-colors border-b border-gray-50 last:border-0"
                            >
                                <p className="font-medium text-gray-900 line-clamp-1">{result.display_name.split(',')[0]}</p>
                                <p className="text-xs text-gray-500 line-clamp-1">{result.display_name}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
        
        <div className="flex-1 relative z-0">
            <MapContainer 
                center={[45.4642, 9.1900]} // Default Milan
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater center={mapCenter} />
                <LocationMarker onLocationFound={handleLocationSelect} />
                <NearbyBars onSelectBar={(name, lat, lng) => {
                  setSelectedLocation({ lat, lng });
                  setAddress(name);
                }} />
            </MapContainer>

            {/* Selection Overlay */}
            {selectedLocation && (
                <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100 z-[1000] animate-in slide-in-from-bottom-2">
                    <div className="flex flex-col gap-3">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.selected}</p>
                            {loading ? (
                                <div className="flex items-center space-x-2 text-amber-600 mt-1">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm font-medium">{t.loading}</span>
                                </div>
                            ) : (
                                <p className="text-gray-900 font-medium mt-1 line-clamp-2">{address}</p>
                            )}
                        </div>
                        <button
                            onClick={() => onSelect(address)}
                            disabled={loading}
                            className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            <Check className="w-5 h-5" />
                            <span>{t.confirm}</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
