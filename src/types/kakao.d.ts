declare namespace kakao.maps {
  class Map {
    constructor(container: HTMLElement, options: { center: LatLng; level: number })
    setCenter(latlng: LatLng): void
    setBounds(bounds: LatLngBounds): void
    relayout(): void
  }

  class LatLng {
    constructor(lat: number, lng: number)
    getLat(): number
    getLng(): number
  }

  class LatLngBounds {
    extend(latlng: LatLng): void
  }

  class Marker {
    constructor(options: { map?: Map; position: LatLng })
    setMap(map: Map | null): void
  }

  class InfoWindow {
    constructor(options: { content: string; removable?: boolean })
    open(map: Map, marker: Marker): void
    close(): void
  }

  class CustomOverlay {
    constructor(options: { content: string; position: LatLng; yAnchor?: number })
    setMap(map: Map | null): void
  }

  namespace event {
    function addListener(target: Marker | Map, type: string, handler: () => void): void
  }

  namespace services {
    class Geocoder {
      addressSearch(address: string, callback: (result: GeocoderResult[], status: string) => void): void
    }
    interface GeocoderResult {
      y: string
      x: string
      address_name: string
    }
    const Status: { OK: string; ZERO_RESULT: string; ERROR: string }
  }

  function load(callback: () => void): void
}

interface Window {
  kakao: typeof kakao
}
