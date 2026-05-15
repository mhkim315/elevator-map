// Type declarations for untyped Leaflet plugins

declare module 'leaflet' {
  // leaflet.markercluster
  class MarkerClusterGroup extends L.LayerGroup {
    constructor(options?: MarkerClusterGroupOptions);
    addLayers(layers: L.Layer[]): this;
    clearLayers(): this;
    getChildCount(): number;
    getAllChildMarkers(): L.Marker[];
    zoomToBounds(options?: L.FitBoundsOptions): void;
  }

  interface MarkerClusterGroupOptions {
    chunkedLoading?: boolean;
    maxClusterRadius?: number | ((zoom: number) => number);
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    iconCreateFunction?: (cluster: MarkerCluster) => L.DivIcon;
    spiderLegPolylineOptions?: L.PolylineOptions;
    removeOutsideVisibleBounds?: boolean;
  }

  interface MarkerCluster extends L.Layer {
    getChildCount(): number;
    getAllChildMarkers(): L.Marker[];
  }

  // leaflet.heat
  function heatLayer(
    latlngs: Array<[number, number, number]>,
    options?: HeatLayerOptions
  ): HeatLayer;

  interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: Array<[number, number, number]>): this;
    addLatLng(latlng: [number, number, number]): this;
    setOptions(options: HeatLayerOptions): this;
    redraw(): this;
  }

  interface HeatLayerOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: Record<number, string>;
  }
}

export {};
