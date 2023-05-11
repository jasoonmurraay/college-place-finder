export interface Establishment {
  _id: string;
  Name: string;
  Address: string;
  City: string;
  State: string;
  Zip: string;
  Latitude: number;
  Longitude: number;
  Creator: ReviewAuthor;
  School: School;
  Reviews: Review[];
}

export interface ReviewAuthor {
  _id: string;
  username: string;
}

export interface Review {
  _id: string;
  author: ReviewAuthor | null;
  place: Establishment;
  title: string;
  foodQuality: number;
  serviceQuality: number;
  goodForStudents: number;
  goodForFamilies: number;
  forUnder21: number;
  noiseLevel: number;
  prices: number;
  drinkQuality: number;
  otherComments: string;
  timeStamp: Date[];
}

export interface ReviewCompProps {
  review: Review;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export interface User {
  _id: string;
  username: string;
  password: string;
  email: string;
  Reviews: Review[];
  Favorites: Establishment[];
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

export type placeContextType = {
  data?: Establishment;
  error?: string;
};

export type Viewport = {
  latitude: number;
  longitude: number;
  zoom: number;
  width: string;
  height: number;
};

export type Dict = {
  [key: number]: string;
};

export const nlDict: Dict = {
  0: "Quiet",
  1: "Moderate",
  2: "Loud",
};

export const priceDict: Dict = {
  0: "$",
  1: "$$",
  2: "$$$",
};

export const ynDict: Dict = {
  1: "Yes",
  0: "No",
};
