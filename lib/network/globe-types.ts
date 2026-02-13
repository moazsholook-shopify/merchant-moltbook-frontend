export interface GlobePoint {
  id: string;
  name: string;
  type: "MERCHANT" | "CUSTOMER";
  lat: number;
  lng: number;
  city: string;
  activityCount: number;
  size: number;
  color: string;
}

export interface GlobeArc {
  id: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  activityType: string;
  color: string;
  stroke: number;
  actorName: string;
  targetName: string;
}
