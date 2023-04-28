export interface Establishment {
  _id: string;
  Name: string;
  Address: string;
  City: string;
  State: string;
  Zip: string;
  Latitude: number;
  Longitude: number;
  School: School;
  Reviews: Review[];
}

export interface Review {
  _id: string;
  Title: string;
  Food: number;
  Service: number;
  ForStudents: number;
  ForFamilies: number;
  ForFreshman: number;
  NoiseLevel: number;
  Price: number;
  Drinks: number;
  Comments: string;
}

export interface School {
  _id: string;
  FullName: string;
  CommonName: string;
  Teams: string;
  City: string;
  State: string;
  Type: string;
  Subdivision: string;
  PrimaryConference: string;
  latitude: string;
  longitude: string;
  Logo: string;
  establishments: Establishment[];
}

export type contextType = {
  params: {
    Id: string;
  };
};

export type Viewport = {
  latitude: number;
  longitude: number;
  zoom: number;
  width: string;
  height: number;
};
